import { useState } from 'react';
import { App, Button, Checkbox, Drawer, Form, Input, Modal, Segmented, Select, Tag } from 'antd';
import { FaHistory, FaMapMarkedAlt, FaPhoneAlt, FaPlay, FaCheck } from 'react-icons/fa';
import ProjectInfo from '../components/ProjectInfo';
import { EmptyState, PageHeader, StatusTag } from '../components/ui';
import { useStore, useLookup } from '../store';
import { LOG_RESULT, WORK_STATUS, WORK_TYPE } from '../data/constants';
import { addMonths, daysUntil, formatDate, todayISO, uid } from '../utils';
import type { MaintenanceLog, Project, WorkOrder } from '../types';

/**
 * Lịch công việc của kỹ thuật viên (Kỹ thuật, Admin).
 * Mỗi phiếu hiển thị: công trình, liên hệ khách, chỉ đường, và LẦN XỬ LÝ TRƯỚC (ai làm, kết quả)
 * để kỹ thuật nắm lịch sử trước khi tới. Hoàn thành → lập biên bản → tự ghi vào lịch sử công trình
 * và tự tính lịch bảo trì kế tiếp theo chu kỳ.
 */
type View = 'today' | 'week' | 'open' | 'done';

const Schedule = () => {
    const { db, edit, user } = useStore();
    const lookup = useLookup();
    const { message } = App.useApp();
    const [view, setView] = useState<View>('today');
    const [techFilter, setTechFilter] = useState<string>(user?.role === 'technician' ? user.id : 'all');
    const [reportFor, setReportFor] = useState<WorkOrder | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);
    const project = lookup.project(projectId ?? undefined);

    const technicians = db.users.filter((u) => u.role === 'technician');
    const all = db.workOrders.filter((w) => techFilter === 'all' || w.technicianId === techFilter);
    const isOpen = (w: WorkOrder) => w.status === 'pending' || w.status === 'in_progress';
    const filters: Record<View, (w: WorkOrder) => boolean> = {
        today: (w) => isOpen(w) && daysUntil(w.date) <= 0,
        week: (w) => isOpen(w) && daysUntil(w.date) <= 7,
        open: isOpen,
        done: (w) => w.status === 'done',
    };
    const list = all.filter(filters[view]).sort((a, b) => (view === 'done' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

    const setStatus = (w: WorkOrder, status: WorkOrder['status']) => edit('workOrders', w.id, { status });

    const complete = (v: { result: MaintenanceLog['result']; note: string; reschedule: boolean }) => {
        const w = reportFor;
        const p = lookup.project(w?.projectId);
        if (!w || !p) return;

        // 1. Phiếu công việc → hoàn thành
        edit('workOrders', w.id, { status: 'done', report: v.note });

        // 2. Ghi biên bản vào lịch sử công trình (+ bàn giao nếu là việc lắp đặt, + lịch bảo trì kế tiếp)
        const log: MaintenanceLog = { id: uid('l'), date: todayISO(), technicianId: w.technicianId, type: w.type, note: v.note, result: v.result };
        const changes: Partial<Project> = { logs: [...p.logs, log] };
        if (w.type === 'install' && p.status === 'installing') {
            changes.status = 'active';
            changes.handoverAt = todayISO();
        }
        if (v.reschedule) changes.nextMaintenance = addMonths(todayISO(), p.maintenanceCycleMonths);
        edit('projects', p.id, changes);

        setReportFor(null);
        message.success(`Đã hoàn thành ${w.code}${v.reschedule ? `. Bảo trì kế tiếp: ${formatDate(changes.nextMaintenance)}` : ''}`);
    };

    return (
        <div>
            <PageHeader title="Lịch công việc" subtitle="Bấm Bắt đầu khi tới công trình, Hoàn thành để lập biên bản." />
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                <div className="overflow-x-auto">
                    <Segmented
                        value={view}
                        onChange={(v) => setView(v as View)}
                        options={[
                            { label: `Hôm nay & quá hạn (${all.filter(filters.today).length})`, value: 'today' },
                            { label: `7 ngày tới (${all.filter(filters.week).length})`, value: 'week' },
                            { label: `Chưa xong (${all.filter(filters.open).length})`, value: 'open' },
                            { label: 'Đã hoàn thành', value: 'done' },
                        ]}
                    />
                </div>
                {user?.role !== 'technician' && (
                    <Select
                        value={techFilter}
                        onChange={setTechFilter}
                        className="w-56"
                        options={[{ value: 'all', label: 'Tất cả kỹ thuật viên' }, ...technicians.map((t) => ({ value: t.id, label: t.name }))]}
                    />
                )}
            </div>

            {list.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {list.map((w) => {
                        const p = lookup.project(w.projectId);
                        const customer = lookup.user(p?.customerId);
                        const prev = p?.logs[p.logs.length - 1];
                        const late = isOpen(w) && daysUntil(w.date) < 0;
                        return (
                            <article key={w.id} className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 flex flex-col gap-3 ${late ? 'border-red-400' : 'border-[var(--border)]'}`}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <b className="text-[var(--text-h)]">{w.code}</b>
                                    <StatusTag map={WORK_TYPE} value={w.type} />
                                    <StatusTag map={WORK_STATUS} value={w.status} />
                                    <span className={`ml-auto text-sm font-semibold ${late ? 'text-red-600' : 'text-[var(--text-h)]'}`}>
                                        {formatDate(w.date)}{late ? ` · trễ ${-daysUntil(w.date)} ngày` : daysUntil(w.date) === 0 ? ' · hôm nay' : ''}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-semibold text-[var(--text-h)]">{p?.name}</div>
                                    <div className="text-sm text-[var(--text)]">{p?.address}</div>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                    {customer && (
                                        <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-1.5 text-[var(--text-h)] hover:text-red-600">
                                            <FaPhoneAlt size={11} /> {customer.name} · {customer.phone}
                                        </a>
                                    )}
                                    {p && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-[var(--text-h)] hover:text-red-600"
                                        >
                                            <FaMapMarkedAlt size={12} /> Chỉ đường
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm text-[var(--text-h)] rounded-xl bg-gray-50 dark:bg-slate-800/50 p-3 m-0">{w.note}</p>
                                {prev && (
                                    <div className="text-xs text-[var(--text)] flex gap-2">
                                        <FaHistory className="mt-0.5 shrink-0" />
                                        <span>
                                            Lần trước {formatDate(prev.date)} – <b className="text-[var(--text-h)]">{lookup.userName(prev.technicianId)}</b>{' '}
                                            <Tag color={LOG_RESULT[prev.result].color} className="text-[10px]">{LOG_RESULT[prev.result].label}</Tag>
                                            <br />
                                            {prev.note}
                                        </span>
                                    </div>
                                )}
                                {w.report && <div className="text-xs text-[var(--text)]">Biên bản: {w.report}</div>}
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    <Button size="small" onClick={() => setProjectId(w.projectId)}>Hồ sơ công trình</Button>
                                    {w.status === 'pending' && (
                                        <Button size="small" icon={<FaPlay size={10} />} onClick={() => { setStatus(w, 'in_progress'); message.info(`Bắt đầu ${w.code}`); }}>
                                            Bắt đầu
                                        </Button>
                                    )}
                                    {isOpen(w) && (
                                        <Button size="small" type="primary" icon={<FaCheck size={11} />} onClick={() => setReportFor(w)}>
                                            Hoàn thành & lập biên bản
                                        </Button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <EmptyState title="Không có công việc" description={view === 'today' ? 'Hôm nay không có việc nào đến hạn.' : undefined} />
                </div>
            )}

            <Modal title={reportFor ? `Biên bản ${reportFor.code}` : ''} open={!!reportFor} onCancel={() => setReportFor(null)} footer={null} destroyOnHidden>
                <Form
                    layout="vertical"
                    requiredMark={false}
                    onFinish={complete}
                    initialValues={{ result: 'ok', reschedule: reportFor?.type === 'maintenance' || reportFor?.type === 'install' }}
                >
                    <Form.Item name="result" label="Kết quả">
                        <Select options={Object.entries(LOG_RESULT).map(([k, s]) => ({ value: k, label: s.label }))} />
                    </Form.Item>
                    <Form.Item name="note" label="Nội dung đã thực hiện" rules={[{ required: true, message: 'Ghi lại công việc đã làm' }]}>
                        <Input.TextArea rows={4} placeholder="Ví dụ: Kiểm tra 40 bình, nạp lại 2 bình khu B, thay 1 đầu báo khói tầng 2..." />
                    </Form.Item>
                    <Form.Item name="reschedule" valuePropName="checked">
                        <Checkbox>Tự tính lịch bảo trì kế tiếp theo chu kỳ công trình</Checkbox>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Xác nhận hoàn thành</Button>
                </Form>
            </Modal>

            <Drawer open={!!project} onClose={() => setProjectId(null)} size={760} title={project ? `${project.code} – ${project.name}` : ''}>
                {project && <ProjectInfo project={project} showCustomer />}
            </Drawer>
        </div>
    );
};

export default Schedule;

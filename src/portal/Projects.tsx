import { useState } from 'react';
import { App, Button, Drawer, Form, Input, InputNumber, Modal, Select, Switch, Table, Tag } from 'antd';
import { FaPlus } from 'react-icons/fa';
import ProjectInfo from '../components/ProjectInfo';
import { PageHeader, Panel, StatusTag } from '../components/ui';
import { useStore, useLookup } from '../store';
import { PROJECT_STATUS, WORK_TYPE } from '../data/constants';
import { maintenanceInfo, nextCode, addMonths, formatDate, matches, todayISO, uid } from '../utils';
import type { Project, WorkOrder, WorkType } from '../types';

/**
 * Quản lý công trình (Kinh doanh, Kỹ thuật xem; chỉ Admin được thêm/sửa).
 * Giải quyết: kỹ thuật không nắm công trình nào đến lịch bảo trì, ai đã làm trước đó.
 * - Bảng công trình với lịch bảo trì kế tiếp & kỹ thuật phụ trách.
 * - Ngăn chi tiết: toàn bộ lịch sử bảo trì (ai làm, kết quả), thiết bị & bảo hành.
 * - Admin/quản lý: phân công kỹ thuật, tạo phiếu công việc, thêm thiết bị, tạo công trình mới.
 */
const ManagePanel = ({ project }: { project: Project }) => {
    const { db, add, edit } = useStore();
    const { message } = App.useApp();
    const technicians = db.users.filter((u) => u.role === 'technician' && u.status === 'active');

    const patch = (changes: Partial<Project>) => edit('projects', project.id, changes);

    return (
        <div className="flex flex-col gap-5">
            <Panel title="Phân công & lịch bảo trì">
                <div className="grid sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-h)]">
                        Kỹ thuật phụ trách
                        <Select
                            mode="multiple"
                            value={project.technicianIds}
                            onChange={(v) => patch({ technicianIds: v })}
                            options={technicians.map((t) => ({ value: t.id, label: `${t.name} – ${t.position ?? ''}` }))}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-h)]">
                        Trạng thái
                        <Select value={project.status} onChange={(v) => patch({ status: v })} options={Object.entries(PROJECT_STATUS).map(([k, s]) => ({ value: k, label: s.label }))} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-h)]">
                        Chu kỳ bảo trì (tháng)
                        <InputNumber min={1} max={24} value={project.maintenanceCycleMonths} onChange={(v) => v && patch({ maintenanceCycleMonths: v })} className="w-full" />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-[var(--text-h)]">
                        Ngày bảo trì kế tiếp
                        <Input type="date" value={project.nextMaintenance} onChange={(e) => e.target.value && patch({ nextMaintenance: e.target.value })} />
                    </label>
                </div>
            </Panel>

            <Panel title="Tạo phiếu công việc cho kỹ thuật">
                <Form
                    layout="vertical"
                    requiredMark={false}
                    initialValues={{ type: 'maintenance', date: project.nextMaintenance, technicianId: project.technicianIds[0] }}
                    onFinish={(v: { technicianId: string; type: WorkType; date: string; note: string }) => {
                        const wo: WorkOrder = { id: uid('w'), code: nextCode('CV', db.workOrders.map((w) => w.code)), projectId: project.id, status: 'pending', ...v };
                        add('workOrders', wo);
                        message.success(`Đã tạo ${wo.code} cho ${db.users.find((u) => u.id === v.technicianId)?.name}`);
                    }}
                >
                    <div className="grid sm:grid-cols-3 gap-x-3">
                        <Form.Item name="technicianId" label="Kỹ thuật viên" rules={[{ required: true }]}>
                            <Select options={technicians.map((t) => ({ value: t.id, label: t.name }))} />
                        </Form.Item>
                        <Form.Item name="type" label="Loại việc">
                            <Select options={Object.entries(WORK_TYPE).map(([k, s]) => ({ value: k, label: s.label }))} />
                        </Form.Item>
                        <Form.Item name="date" label="Ngày thực hiện" rules={[{ required: true }]}>
                            <Input type="date" />
                        </Form.Item>
                    </div>
                    <Form.Item name="note" label="Ghi chú cho kỹ thuật" rules={[{ required: true, message: 'Nhập nội dung công việc' }]}>
                        <Input.TextArea rows={2} placeholder="Nội dung, vật tư cần mang, lưu ý từ lần trước..." />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Tạo phiếu công việc</Button>
                </Form>
            </Panel>

            <Panel title="Thêm thiết bị đã lắp">
                <Form
                    layout="vertical"
                    requiredMark={false}
                    initialValues={{ quantity: 1, installedAt: todayISO() }}
                    onFinish={(v: { productId: string; quantity: number; location: string; installedAt: string }) => {
                        const months = db.products.find((p) => p.id === v.productId)?.warrantyMonths ?? 12;
                        patch({ devices: [...project.devices, { ...v, warrantyUntil: addMonths(v.installedAt, months) }] });
                        message.success('Đã thêm thiết bị');
                    }}
                >
                    <div className="grid sm:grid-cols-[minmax(0,2fr)_90px_minmax(0,1fr)_150px] gap-x-3">
                        <Form.Item name="productId" label="Thiết bị" rules={[{ required: true }]}>
                            <Select showSearch optionFilterProp="label" options={db.products.map((p) => ({ value: p.id, label: `${p.code} – ${p.name}` }))} />
                        </Form.Item>
                        <Form.Item name="quantity" label="SL"><InputNumber min={1} className="w-full" /></Form.Item>
                        <Form.Item name="location" label="Vị trí" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="installedAt" label="Ngày lắp"><Input type="date" /></Form.Item>
                    </div>
                    <Button htmlType="submit">Thêm thiết bị</Button>
                </Form>
            </Panel>
        </div>
    );
};

const Projects = () => {
    const { db, add, user } = useStore();
    const isAdmin = user?.role === 'admin'; // chỉ Admin được thêm/sửa công trình
    const lookup = useLookup();
    const { message } = App.useApp();
    const [search, setSearch] = useState('');
    const [onlyMine, setOnlyMine] = useState(user?.role === 'technician');
    const [openId, setOpenId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const open = db.projects.find((p) => p.id === openId);

    const mine = (p: Project) => p.technicianIds.includes(user?.id ?? '') || p.salesId === user?.id;
    const data = db.projects
        .filter((p) => (!onlyMine || mine(p)) && (!search || matches(`${p.code} ${p.name} ${p.address} ${lookup.userName(p.customerId)}`, search)))
        .sort((a, b) => a.nextMaintenance.localeCompare(b.nextMaintenance));

    const customers = db.users.filter((u) => u.role === 'customer');
    const sales = db.users.filter((u) => u.role === 'sales');
    const technicians = db.users.filter((u) => u.role === 'technician');

    return (
        <div>
            <PageHeader
                title="Công trình"
                subtitle="Sắp xếp theo ngày bảo trì gần nhất. Bấm vào dòng để xem lịch sử và thiết bị."
                extra={isAdmin && <Button type="primary" icon={<FaPlus />} onClick={() => setCreateOpen(true)}>Thêm công trình</Button>}
            />
            <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
                <Input.Search allowClear placeholder="Mã, tên, địa chỉ, khách hàng" onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
                <label className="flex items-center gap-2 text-sm text-[var(--text-h)]">
                    <Switch size="small" checked={onlyMine} onChange={setOnlyMine} /> Chỉ công trình tôi phụ trách
                </label>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={data}
                    scroll={{ x: 980 }}
                    onRow={(p) => ({ onClick: () => setOpenId(p.id), className: 'cursor-pointer' })}
                    columns={[
                        { title: 'Công trình', render: (_, p) => <span><b>{p.code}</b><br />{p.name}</span> },
                        { title: 'Khách hàng', render: (_, p) => lookup.user(p.customerId)?.company ?? lookup.userName(p.customerId) },
                        { title: 'Loại', dataIndex: 'buildingType' },
                        { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={PROJECT_STATUS} value={s} /> },
                        {
                            title: 'Bảo trì kế tiếp',
                            dataIndex: 'nextMaintenance',
                            render: (d: string, p) => (p.status === 'active' ? <span>{formatDate(d)}<br /><Tag color={maintenanceInfo(d).color}>{maintenanceInfo(d).label}</Tag></span> : '—'),
                        },
                        { title: 'Kỹ thuật', render: (_, p) => p.technicianIds.map((id) => lookup.userName(id)).join(', ') || <Tag color="red">Chưa phân công</Tag> },
                        {
                            title: 'Lần xử lý gần nhất',
                            render: (_, p) => {
                                const last = p.logs[p.logs.length - 1];
                                return last ? <span>{formatDate(last.date)}<br /><span className="text-xs text-[var(--text)]">{lookup.userName(last.technicianId)}</span></span> : '—';
                            },
                        },
                    ]}
                />
            </div>

            <Drawer open={!!open} onClose={() => setOpenId(null)} size={820} title={open ? `${open.code} – ${open.name}` : ''}>
                {open && (
                    <div className="flex flex-col gap-5">
                        <ProjectInfo project={open} showCustomer />
                        {isAdmin && <ManagePanel key={open.id} project={open} />}
                    </div>
                )}
            </Drawer>

            <Modal title="Thêm công trình" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} destroyOnHidden width={640}>
                <Form
                    layout="vertical"
                    requiredMark={false}
                    initialValues={{ status: 'surveying', startedAt: todayISO(), maintenanceCycleMonths: db.settings.defaultMaintenanceMonths, technicianIds: [] }}
                    onFinish={(v: Omit<Project, 'id' | 'code' | 'devices' | 'logs' | 'nextMaintenance'>) => {
                        const year = new Date().getFullYear();
                        const sameYear = db.projects.filter((p) => p.code.startsWith(`CT-${year}-`)).map((p) => Number(p.code.split('-')[2]));
                        const code = `CT-${year}-${String(Math.max(0, ...sameYear) + 1).padStart(3, '0')}`;
                        const project: Project = { ...v, id: uid('pj'), code, devices: [], logs: [], nextMaintenance: addMonths(v.startedAt, v.maintenanceCycleMonths) };
                        add('projects', project);
                        setCreateOpen(false);
                        message.success(`Đã tạo công trình ${code}`);
                    }}
                >
                    <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="label" options={customers.map((c) => ({ value: c.id, label: `${c.company ?? c.name} (${c.phone})` }))} />
                    </Form.Item>
                    <div className="grid sm:grid-cols-2 gap-x-3">
                        <Form.Item name="name" label="Tên công trình" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="buildingType" label="Loại công trình" rules={[{ required: true }]}><Input placeholder="Nhà xưởng, văn phòng 300 m²..." /></Form.Item>
                    </div>
                    <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}><Input /></Form.Item>
                    <div className="grid sm:grid-cols-3 gap-x-3">
                        <Form.Item name="status" label="Trạng thái"><Select options={Object.entries(PROJECT_STATUS).map(([k, s]) => ({ value: k, label: s.label }))} /></Form.Item>
                        <Form.Item name="startedAt" label="Ngày khởi công"><Input type="date" /></Form.Item>
                        <Form.Item name="maintenanceCycleMonths" label="Chu kỳ bảo trì (tháng)"><InputNumber min={1} max={24} className="w-full" /></Form.Item>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-3">
                        <Form.Item name="salesId" label="Kinh doanh phụ trách" rules={[{ required: true }]}>
                            <Select options={sales.map((s) => ({ value: s.id, label: s.name }))} />
                        </Form.Item>
                        <Form.Item name="technicianIds" label="Kỹ thuật phụ trách">
                            <Select mode="multiple" options={technicians.map((s) => ({ value: s.id, label: s.name }))} />
                        </Form.Item>
                    </div>
                    <Button type="primary" htmlType="submit" block>Tạo công trình</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Projects;

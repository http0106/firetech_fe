import { Descriptions, Table, Tag, Timeline } from 'antd';
import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { useLookup, useStore } from '../store';
import { LOG_RESULT, PROJECT_STATUS, WORK_STATUS, WORK_TYPE } from '../data/constants';
import { maintenanceInfo, warrantyInfo, formatDate } from '../utils';
import { Panel, StatusTag } from './ui';

/**
 * Thông tin đầy đủ của một công trình — dùng chung cho khách hàng (/account/projects/:id)
 * và nhân viên (/portal/projects). Trả lời: thi công ngày nào, ai phụ trách, thiết bị nào còn bảo hành,
 * các lần bảo trì trước do ai làm, kết quả ra sao, lịch sắp tới.
 */
const ProjectInfo = ({ project, showCustomer = false, compact = false }: { project: Project; showCustomer?: boolean; compact?: boolean }) => {
    const { db } = useStore();
    const lookup = useLookup();
    const m = maintenanceInfo(project.nextMaintenance);
    const sales = lookup.user(project.salesId);
    const customer = lookup.user(project.customerId);
    const upcoming = db.workOrders
        .filter((w) => w.projectId === project.id && (w.status === 'pending' || w.status === 'in_progress'))
        .sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="flex flex-col gap-5">
            <Panel title="Thông tin công trình">
                <Descriptions
                    size="small"
                    column={compact ? 1 : { xs: 1, sm: 2, lg: 3 }}
                    items={[
                        ...(showCustomer
                            ? [{ key: 'cus', label: 'Khách hàng', children: <span>{customer?.company ?? customer?.name}<br /><span className="text-[var(--text)]">{customer?.name} · {customer?.phone}</span></span> }]
                            : []),
                        { key: 'code', label: 'Mã công trình', children: <b>{project.code}</b> },
                        { key: 'type', label: 'Loại công trình', children: project.buildingType },
                        { key: 'status', label: 'Trạng thái', children: <StatusTag map={PROJECT_STATUS} value={project.status} /> },
                        { key: 'addr', label: 'Địa chỉ', children: project.address },
                        { key: 'start', label: 'Ngày khởi công', children: formatDate(project.startedAt) },
                        { key: 'handover', label: 'Ngày bàn giao', children: formatDate(project.handoverAt) },
                        { key: 'cycle', label: 'Chu kỳ bảo trì', children: `${project.maintenanceCycleMonths} tháng/lần` },
                        {
                            key: 'next',
                            label: 'Bảo trì kế tiếp',
                            children: (
                                <span>
                                    {formatDate(project.nextMaintenance)} <Tag color={m.color} className="ml-1">{m.label}</Tag>
                                </span>
                            ),
                        },
                        { key: 'sales', label: 'Kinh doanh phụ trách', children: sales ? `${sales.name} · ${sales.phone}` : '—' },
                        {
                            key: 'tech',
                            label: 'Kỹ thuật phụ trách',
                            children: project.technicianIds.map((id) => lookup.user(id)?.name).filter(Boolean).join(', ') || '—',
                        },
                    ]}
                />
            </Panel>

            {upcoming.length > 0 && (
                <Panel title="Lịch công việc sắp tới" bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={upcoming}
                        scroll={{ x: 520 }}
                        columns={[
                            { title: 'Ngày', dataIndex: 'date', render: formatDate },
                            { title: 'Công việc', dataIndex: 'type', render: (t: string) => <StatusTag map={WORK_TYPE} value={t} /> },
                            { title: 'Kỹ thuật viên', dataIndex: 'technicianId', render: (id: string) => `${lookup.userName(id)} · ${lookup.user(id)?.phone ?? ''}` },
                            { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={WORK_STATUS} value={s} /> },
                        ]}
                    />
                </Panel>
            )}

            <Panel title={`Thiết bị đã lắp đặt (${project.devices.reduce((s, d) => s + d.quantity, 0)})`} bodyClassName="p-0">
                <Table
                    size="small"
                    rowKey="productId"
                    pagination={false}
                    dataSource={project.devices}
                    scroll={{ x: 640 }}
                    columns={[
                        {
                            title: 'Thiết bị',
                            render: (_, d) => {
                                const p = lookup.product(d.productId);
                                return p ? <Link to={`/products/${p.id}`} className="text-[var(--text-h)] hover:text-red-600">{p.name}</Link> : '—';
                            },
                        },
                        { title: 'Vị trí', dataIndex: 'location' },
                        { title: 'SL', dataIndex: 'quantity', width: 56, align: 'center' },
                        { title: 'Ngày lắp', dataIndex: 'installedAt', render: formatDate },
                        {
                            title: 'Bảo hành',
                            dataIndex: 'warrantyUntil',
                            render: (d: string) => {
                                const w = warrantyInfo(d);
                                return <Tag color={w.color}>{w.label}</Tag>;
                            },
                        },
                    ]}
                />
            </Panel>

            <Panel title={`Lịch sử thi công & bảo trì (${project.logs.length})`}>
                {project.logs.length ? (
                    <Timeline
                        className="pt-2"
                        items={[...project.logs].reverse().map((log) => ({
                            color: LOG_RESULT[log.result]?.color === 'red' ? 'red' : LOG_RESULT[log.result]?.color === 'blue' ? 'blue' : 'green',
                            content: (
                                <div className="pb-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <b className="text-[var(--text-h)]">{formatDate(log.date)}</b>
                                        <StatusTag map={WORK_TYPE} value={log.type} />
                                        <StatusTag map={LOG_RESULT} value={log.result} />
                                    </div>
                                    <p className="text-sm text-[var(--text-h)] mt-1">{log.note}</p>
                                    <div className="text-xs text-[var(--text)] mt-0.5">
                                        Kỹ thuật viên: <b>{lookup.userName(log.technicianId)}</b>
                                    </div>
                                </div>
                            ),
                        }))}
                    />
                ) : (
                    <p className="text-sm text-[var(--text)]">Chưa có lịch sử. Công trình đang thi công.</p>
                )}
            </Panel>
        </div>
    );
};

export default ProjectInfo;

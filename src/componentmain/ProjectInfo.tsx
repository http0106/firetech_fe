import { Descriptions, Table, Tag, Timeline } from 'antd';
import { Panel, StatusTag, EmptyState } from './ui';
import { useLookup } from '../context/StoreContext';
import { LOG_RESULT, PROJECT_STATUS, WORK_TYPE } from '../data/constants';
import { maintenanceInfo, warrantyInfo } from '../utils/business';
import { formatDate } from '../utils/format';
import type { Project, ProjectDevice } from '../types';

/** Thông tin công trình dùng chung: tổng quan, thiết bị & bảo hành, lịch sử bảo trì. */
const ProjectInfo = ({ project }: { project: Project }) => {
    const lookup = useLookup();
    const m = maintenanceInfo(project.nextMaintenance);
    const logs = [...project.logs].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="flex flex-col gap-4">
            <Panel title="Thông tin công trình">
                <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
                    <Descriptions.Item label="Mã công trình">{project.code}</Descriptions.Item>
                    <Descriptions.Item label="Loại công trình">{project.buildingType}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái"><StatusTag map={PROJECT_STATUS} value={project.status} /></Descriptions.Item>
                    <Descriptions.Item label="Ngày khởi công">{formatDate(project.startedAt)}</Descriptions.Item>
                    <Descriptions.Item label="Ngày bàn giao">{formatDate(project.handoverAt)}</Descriptions.Item>
                    <Descriptions.Item label="Chu kỳ bảo trì">{project.maintenanceCycleMonths} tháng</Descriptions.Item>
                    <Descriptions.Item label="Bảo trì kế tiếp">
                        {project.status === 'active' ? <>{formatDate(project.nextMaintenance)} <Tag color={m.color} className="ml-1">{m.label}</Tag></> : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phụ trách kinh doanh">{lookup.userName(project.salesId)}</Descriptions.Item>
                    <Descriptions.Item label="Kỹ thuật viên">
                        {project.technicianIds.length ? project.technicianIds.map((id) => lookup.userName(id)).join(', ') : '—'}
                    </Descriptions.Item>
                </Descriptions>
            </Panel>

            <Panel title={`Thiết bị đã lắp đặt (${project.devices.reduce((s, d) => s + d.quantity, 0)})`} bodyClassName="p-0">
                <Table<ProjectDevice>
                    size="small"
                    rowKey={(d) => `${d.productId}-${d.location}`}
                    dataSource={project.devices}
                    pagination={false}
                    scroll={{ x: 640 }}
                    locale={{ emptyText: 'Chưa có thiết bị' }}
                    columns={[
                        {
                            title: 'Thiết bị',
                            render: (_, d) => {
                                const p = lookup.product(d.productId);
                                return p ? <><div className="font-medium">{p.name}</div><div className="text-xs opacity-70">{p.code}</div></> : d.productId;
                            },
                        },
                        { title: 'SL', dataIndex: 'quantity', width: 60, align: 'center' },
                        { title: 'Vị trí', dataIndex: 'location' },
                        { title: 'Lắp đặt', dataIndex: 'installedAt', render: (v: string) => formatDate(v) },
                        {
                            title: 'Bảo hành',
                            dataIndex: 'warrantyUntil',
                            render: (v: string) => {
                                const w = warrantyInfo(v);
                                return <Tag color={w.color} className="m-0">{w.label}</Tag>;
                            },
                        },
                    ]}
                />
            </Panel>

            <Panel title="Lịch sử bảo trì / sửa chữa">
                {logs.length ? (
                    <Timeline
                        className="pt-2"
                        items={logs.map((l) => ({
                            key: l.id,
                            color: LOG_RESULT[l.result]?.color,
                            children: (
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{formatDate(l.date)}</span>
                                        <StatusTag map={WORK_TYPE} value={l.type} />
                                        <StatusTag map={LOG_RESULT} value={l.result} />
                                    </div>
                                    <div className="text-sm mt-1">{l.note}</div>
                                    <div className="text-xs opacity-70 mt-0.5">KTV: {lookup.userName(l.technicianId)}</div>
                                </div>
                            ),
                        }))}
                    />
                ) : (
                    <EmptyState title="Chưa có lần bảo trì nào" description="Lịch sử sẽ được cập nhật sau mỗi lần kỹ thuật viên xử lý tại công trình." />
                )}
            </Panel>
        </div>
    );
};

export default ProjectInfo;

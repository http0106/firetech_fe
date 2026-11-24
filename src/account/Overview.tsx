import { useState } from 'react';
import { Alert, Button, Table, Tag } from 'antd';
import { FaBuilding, FaCalendarAlt, FaFireExtinguisher, FaShieldAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState, Panel, StatCard, StatusTag } from '../components/ui';
import { RequestServiceModal } from '../components/QuoteForm';
import { useStore, useLookup } from '../store';
import { ORDER_STATUS, QUOTE_STATUS } from '../data/constants';
import { maintenanceInfo, warrantyInfo, formatDate, formatPrice } from '../utils';
import type { Project } from '../types';

/**
 * Tổng quan tài khoản khách hàng.
 * Trả lời ngay 3 câu hỏi khách hay quên: công trình thi công ngày nào, bao giờ đến lịch bảo trì,
 * thiết bị nào còn/sắp hết bảo hành — kèm đơn hàng và báo giá gần đây.
 */
const Overview = () => {
    const { db, user } = useStore();
    const lookup = useLookup();
    const navigate = useNavigate();
    const [requestFor, setRequestFor] = useState<Project | null>(null);
    if (!user) return null;

    const projects = db.projects.filter((p) => p.customerId === user.id);
    const devices = projects.flatMap((p) => p.devices.map((d) => ({ ...d, project: p })));
    const upcoming = projects.filter((p) => p.status === 'active').sort((a, b) => a.nextMaintenance.localeCompare(b.nextMaintenance));
    const warrantySoon = devices.filter((d) => warrantyInfo(d.warrantyUntil).level === 'soon');
    const orders = db.orders.filter((o) => o.customerId === user.id).slice(0, 5);
    const quotes = db.quotes.filter((q) => q.customerId === user.id && ['new', 'processing', 'sent'].includes(q.status));
    const next = upcoming[0];

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h1 className="m-0 tracking-normal text-2xl font-extrabold text-[var(--text-h)]">Xin chào, {user.name}</h1>
                <p className="text-sm text-[var(--text)]">{user.company ?? 'Khách hàng cá nhân'} · Thành viên từ {formatDate(user.createdAt)}</p>
            </div>

            {user.pendingProjectCode && (
                <Alert
                    type="info"
                    showIcon
                    title={`Mã công trình ${user.pendingProjectCode} đang chờ CSKH xác minh`}
                    description="Sau khi được liên kết, lịch bảo trì và bảo hành của công trình sẽ hiển thị tại đây."
                />
            )}

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard icon={<FaBuilding />} label="Công trình" value={projects.length} hint={`${upcoming.length} đang bảo trì định kỳ`} onClick={() => navigate('/account/projects')} />
                <StatCard icon={<FaFireExtinguisher />} label="Thiết bị đã lắp" value={devices.reduce((s, d) => s + d.quantity, 0)} color="#2563eb" />
                <StatCard
                    icon={<FaCalendarAlt />}
                    label="Bảo trì gần nhất"
                    value={next ? formatDate(next.nextMaintenance) : '—'}
                    hint={next ? <Tag color={maintenanceInfo(next.nextMaintenance).color} className="m-0">{maintenanceInfo(next.nextMaintenance).label}</Tag> : 'Chưa có lịch'}
                    color="#ea580c"
                />
                <StatCard icon={<FaShieldAlt />} label="Sắp hết bảo hành" value={warrantySoon.length} hint="trong 60 ngày tới" color="#16a34a" />
            </div>

            <Panel title="Lịch bảo trì công trình" extra={<Link to="/account/projects" className="text-sm text-red-600">Xem tất cả</Link>} bodyClassName="p-0">
                {upcoming.length ? (
                    <div className="divide-y divide-[var(--border)]">
                        {upcoming.map((p) => {
                            const m = maintenanceInfo(p.nextMaintenance);
                            const last = p.logs[p.logs.length - 1];
                            return (
                                <div key={p.id} className="flex flex-col md:flex-row md:items-center gap-3 p-4">
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/account/projects/${p.id}`} className="font-semibold text-[var(--text-h)] hover:text-red-600">{p.name}</Link>
                                        <div className="text-xs text-[var(--text)] mt-0.5">{p.code} · {p.address}</div>
                                        {last && (
                                            <div className="text-xs text-[var(--text)] mt-1">
                                                Lần gần nhất: {formatDate(last.date)}, KTV <b className="text-[var(--text-h)]">{lookup.userName(last.technicianId)}</b>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm md:text-right">
                                        <div className="text-[var(--text-h)] font-semibold">{formatDate(p.nextMaintenance)}</div>
                                        <Tag color={m.color} className="m-0 mt-1">{m.label}</Tag>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="small" onClick={() => navigate(`/account/projects/${p.id}`)}>Chi tiết</Button>
                                        <Button size="small" type="primary" danger ghost onClick={() => setRequestFor(p)}>Yêu cầu bảo trì</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        title="Chưa có công trình nào"
                        description="Công trình do FireTech thi công sẽ tự động xuất hiện tại đây với lịch bảo trì và bảo hành."
                        action={<Button type="primary" danger onClick={() => navigate('/services')}>Đăng ký khảo sát</Button>}
                    />
                )}
            </Panel>

            {warrantySoon.length > 0 && (
                <Panel title="Thiết bị sắp hết bảo hành" bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey={(r) => `${r.project.id}-${r.productId}`}
                        pagination={false}
                        dataSource={warrantySoon}
                        scroll={{ x: 560 }}
                        columns={[
                            { title: 'Thiết bị', render: (_, r) => lookup.product(r.productId)?.name },
                            { title: 'Công trình', render: (_, r) => r.project.name },
                            { title: 'SL', dataIndex: 'quantity', width: 60 },
                            { title: 'Hết hạn', render: (_, r) => <Tag color="orange">{formatDate(r.warrantyUntil)}</Tag> },
                        ]}
                    />
                </Panel>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Panel title="Đơn hàng gần đây" extra={<Link to="/account/orders" className="text-sm text-red-600">Tất cả</Link>} bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={orders}
                        locale={{ emptyText: 'Chưa có đơn hàng' }}
                        columns={[
                            { title: 'Mã', dataIndex: 'code' },
                            { title: 'Ngày', dataIndex: 'createdAt', render: formatDate },
                            { title: 'Tổng', dataIndex: 'total', align: 'right', render: formatPrice },
                            { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={ORDER_STATUS} value={s} /> },
                        ]}
                    />
                </Panel>
                <Panel title="Báo giá đang xử lý" extra={<Link to="/account/quotes" className="text-sm text-red-600">Tất cả</Link>} bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={quotes}
                        locale={{ emptyText: 'Không có báo giá đang chờ' }}
                        columns={[
                            { title: 'Mã', dataIndex: 'code' },
                            { title: 'Nội dung', render: (_, q) => q.service ?? `${q.items.length} sản phẩm` },
                            { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={QUOTE_STATUS} value={s} /> },
                        ]}
                    />
                </Panel>
            </div>

            <RequestServiceModal project={requestFor} onClose={() => setRequestFor(null)} />
        </div>
    );
};

export default Overview;

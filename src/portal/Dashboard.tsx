import { App, Button, Table, Tag } from 'antd';
import {
    FaCalendarDay,
    FaCheckCircle,
    FaComments,
    FaExclamationTriangle,
    FaFileInvoiceDollar,
    FaFileSignature,
    FaHandHoldingUsd,
    FaMoneyBillWave,
    FaShoppingBag,
    FaStar,
    FaUsers,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ChartCard, HBarList } from '../components/Charts';
import { PageHeader, Panel, StatCard, StatusTag } from '../components/ui';
import { useStore, useLookup } from '../store';
import { QUOTE_STATUS, ROLE_LABELS, WORK_STATUS, WORK_TYPE } from '../data/constants';
import { invoiceState, maintenanceInfo, monthlySeries, prevMonthKey, productRevenue, thisMonthKey, daysUntil, formatCompact, formatDate, formatPrice, relativeTime, todayISO } from '../utils';

/**
 * Trang tổng quan nội bộ (/portal). Mỗi vai trò thấy một bảng riêng (xem cuối file):
 * Admin (toàn cảnh), Kinh doanh (báo giá, chat), Kỹ thuật (việc hôm nay), Kế toán (doanh thu, công nợ).
 */

/** "▲ 12% so với tháng trước" */

const trend = (cur: number, prev: number) => {
    if (!prev) return 'Tháng trước: 0';
    const pct = Math.round(((cur - prev) / prev) * 100);
    return `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}% so với tháng trước`;
};

const AdminDashboard = () => {
    const { db } = useStore();
    const lookup = useLookup();
    const navigate = useNavigate();
    const month = thisMonthKey();
    const revenue = db.invoices.filter((i) => i.issuedAt.startsWith(month)).reduce((s, i) => s + i.amount, 0);
    const prevRevenue = db.invoices.filter((i) => i.issuedAt.startsWith(prevMonthKey())).reduce((s, i) => s + i.amount, 0);
    const overdueProjects = db.projects.filter((p) => p.status === 'active' && daysUntil(p.nextMaintenance) < 0);
    const ratings = db.reviews.filter((r) => !r.hidden);
    const avgRating = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
    const top = productRevenue(db.orders).slice(0, 5);
    const upcoming = db.projects
        .filter((p) => p.status === 'active' && daysUntil(p.nextMaintenance) <= 30)
        .sort((a, b) => a.nextMaintenance.localeCompare(b.nextMaintenance));

    return (
        <>
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 mb-5">
                <StatCard icon={<FaMoneyBillWave />} label="Doanh thu tháng này" value={formatCompact(revenue)} hint={trend(revenue, prevRevenue)} color="#16a34a" onClick={() => navigate('/portal/reports')} />
                <StatCard icon={<FaShoppingBag />} label="Đơn chờ xác nhận" value={db.orders.filter((o) => o.status === 'pending').length} onClick={() => navigate('/portal/orders')} />
                <StatCard icon={<FaFileSignature />} label="Báo giá mới" value={db.quotes.filter((q) => q.status === 'new').length} color="#7c3aed" onClick={() => navigate('/portal/quotes')} />
                <StatCard icon={<FaExclamationTriangle />} label="Quá hạn bảo trì" value={overdueProjects.length} hint="công trình" color="#ea580c" onClick={() => navigate('/portal/projects')} />
                <StatCard icon={<FaUsers />} label="Khách hàng" value={db.users.filter((u) => u.role === 'customer').length} color="#2563eb" onClick={() => navigate('/portal/users')} />
                <StatCard icon={<FaStar />} label="Đánh giá trung bình" value={`${avgRating.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/5`} hint={`${ratings.length} đánh giá`} color="#ca8a04" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <ChartCard title="Doanh thu 6 tháng gần nhất" data={monthlySeries(db.invoices)} format={formatPrice} axisFormat={formatCompact} valueTitle="Doanh thu" />
                <Panel title="Sản phẩm bán chạy (doanh số)">
                    <HBarList
                        format={formatCompact}
                        items={top.map((t) => ({ key: t.productId, label: lookup.product(t.productId)?.name, value: t.revenue, hint: `${t.quantity} sản phẩm` }))}
                    />
                </Panel>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 mt-5">
                <Panel title="Lịch bảo trì 30 ngày tới" bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={upcoming}
                        scroll={{ x: 480 }}
                        columns={[
                            { title: 'Công trình', render: (_, p) => <span><b>{p.code}</b><br /><span className="text-[var(--text)]">{p.name}</span></span> },
                            { title: 'Kỹ thuật', render: (_, p) => p.technicianIds.map((id) => lookup.userName(id)).join(', ') },
                            { title: 'Ngày', dataIndex: 'nextMaintenance', render: (d: string) => <span>{formatDate(d)}<br /><Tag color={maintenanceInfo(d).color}>{maintenanceInfo(d).label}</Tag></span> },
                        ]}
                    />
                </Panel>
                <Panel title="Yêu cầu báo giá gần đây" bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={db.quotes.slice(0, 6)}
                        scroll={{ x: 480 }}
                        onRow={() => ({ onClick: () => navigate('/portal/quotes'), className: 'cursor-pointer' })}
                        columns={[
                            { title: 'Mã', dataIndex: 'code' },
                            { title: 'Khách', render: (_, q) => q.company ?? q.contactName },
                            { title: 'Phụ trách', dataIndex: 'salesId', render: (id?: string) => (id ? lookup.userName(id) : <Tag>Chưa nhận</Tag>) },
                            { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={QUOTE_STATUS} value={s} /> },
                        ]}
                    />
                </Panel>
            </div>
        </>
    );
};

const SalesDashboard = () => {
    const { db, edit, user } = useStore();
    const lookup = useLookup();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const newQuotes = db.quotes.filter((q) => q.status === 'new');
    const mine = db.quotes.filter((q) => q.salesId === user?.id);
    const closed = mine.filter((q) => q.status === 'accepted' || q.status === 'rejected');
    const winRate = closed.length ? Math.round((mine.filter((q) => q.status === 'accepted').length / closed.length) * 100) : 0;
    const waitingChats = db.chats.filter((c) => c.status === 'open' && c.unreadByStaff > 0);
    const myCustomersDue = db.projects.filter((p) => p.salesId === user?.id && p.status === 'active' && daysUntil(p.nextMaintenance) <= 30);

    return (
        <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                <StatCard icon={<FaComments />} label="Chat chờ phản hồi" value={waitingChats.length} color="#2563eb" onClick={() => navigate('/portal/chat')} />
                <StatCard icon={<FaFileSignature />} label="Báo giá mới chưa nhận" value={newQuotes.length} color="#7c3aed" onClick={() => navigate('/portal/quotes')} />
                <StatCard icon={<FaHandHoldingUsd />} label="Báo giá tôi đang xử lý" value={mine.filter((q) => q.status === 'processing' || q.status === 'sent').length} />
                <StatCard icon={<FaCheckCircle />} label="Tỷ lệ chốt của tôi" value={`${winRate}%`} hint={`${closed.length} báo giá đã có kết quả`} color="#16a34a" />
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Panel title="Báo giá mới cần nhận xử lý" bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={newQuotes}
                        locale={{ emptyText: 'Không có yêu cầu mới' }}
                        scroll={{ x: 480 }}
                        columns={[
                            { title: 'Mã', dataIndex: 'code' },
                            { title: 'Khách', render: (_, q) => <span>{q.company ?? q.contactName}<br /><span className="text-[var(--text)]">{q.phone}</span></span> },
                            { title: 'Nhu cầu', render: (_, q) => q.service ?? `${q.items.length} sản phẩm` },
                            {
                                title: '',
                                render: (_, q) => (
                                    <Button
                                        size="small"
                                        type="primary"
                                        onClick={() => {
                                            edit('quotes', q.id, { salesId: user!.id, status: 'processing' });
                                            message.success(`Đã nhận xử lý ${q.code}`);
                                        }}
                                    >
                                        Nhận xử lý
                                    </Button>
                                ),
                            },
                        ]}
                    />
                </Panel>
                <Panel title="Tin nhắn chờ phản hồi" extra={<Button size="small" onClick={() => navigate('/portal/chat')}>Mở hộp thư</Button>} bodyClassName="p-0">
                    {waitingChats.length ? (
                        <div className="divide-y divide-[var(--border)]">
                            {waitingChats.map((c) => (
                                <button key={c.id} type="button" onClick={() => navigate(`/portal/chat?thread=${c.id}`)} className="w-full text-left px-4 py-3 bg-transparent border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800">
                                    <div className="flex justify-between text-sm"><b className="text-[var(--text-h)]">{c.guestName}</b><span className="text-xs text-[var(--text)]">{relativeTime(c.updatedAt)}</span></div>
                                    <div className="text-sm text-[var(--text)] truncate">{c.messages[c.messages.length - 1]?.text}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--text)] p-4">Không có tin nhắn chờ.</p>
                    )}
                </Panel>
            </div>
            <Panel title="Khách hàng của tôi sắp đến hạn bảo trì (gọi nhắc lịch / tư vấn nâng cấp)" className="mt-5" bodyClassName="p-0">
                <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={myCustomersDue}
                    locale={{ emptyText: 'Không có công trình sắp đến hạn' }}
                    scroll={{ x: 520 }}
                    columns={[
                        { title: 'Công trình', render: (_, p) => `${p.code} – ${p.name}` },
                        { title: 'Liên hệ', render: (_, p) => `${lookup.userName(p.customerId)} · ${lookup.user(p.customerId)?.phone}` },
                        { title: 'Bảo trì', dataIndex: 'nextMaintenance', render: (d: string) => <Tag color={maintenanceInfo(d).color}>{formatDate(d)} · {maintenanceInfo(d).label}</Tag> },
                    ]}
                />
            </Panel>
        </>
    );
};

const TechnicianDashboard = () => {
    const { db, user } = useStore();
    const lookup = useLookup();
    const navigate = useNavigate();
    const mine = db.workOrders.filter((w) => w.technicianId === user?.id);
    const open = mine.filter((w) => w.status === 'pending' || w.status === 'in_progress');
    const today = open.filter((w) => w.date <= todayISO());
    const week = open.filter((w) => daysUntil(w.date) >= 0 && daysUntil(w.date) <= 7);
    const doneMonth = mine.filter((w) => w.status === 'done' && w.date.startsWith(thisMonthKey()));
    const myProjects = db.projects.filter((p) => p.technicianIds.includes(user?.id ?? '') && p.status === 'active');
    const overdue = myProjects.filter((p) => daysUntil(p.nextMaintenance) < 0);

    return (
        <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                <StatCard icon={<FaCalendarDay />} label="Việc hôm nay" value={today.length} onClick={() => navigate('/portal/schedule')} />
                <StatCard icon={<FaCalendarDay />} label="Việc 7 ngày tới" value={week.length} color="#2563eb" onClick={() => navigate('/portal/schedule')} />
                <StatCard icon={<FaExclamationTriangle />} label="Công trình quá hạn bảo trì" value={overdue.length} color="#ea580c" />
                <StatCard icon={<FaCheckCircle />} label="Hoàn thành tháng này" value={doneMonth.length} color="#16a34a" />
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Panel title="Việc cần làm" extra={<Button size="small" type="primary" onClick={() => navigate('/portal/schedule')}>Mở lịch công việc</Button>} bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={open.sort((a, b) => a.date.localeCompare(b.date))}
                        locale={{ emptyText: 'Không có việc đang chờ' }}
                        scroll={{ x: 480 }}
                        columns={[
                            { title: 'Ngày', dataIndex: 'date', render: (d: string) => <span className={daysUntil(d) <= 0 ? 'font-bold text-red-600' : ''}>{formatDate(d)}</span> },
                            { title: 'Công trình', dataIndex: 'projectId', render: (id: string) => lookup.project(id)?.name },
                            { title: 'Loại', dataIndex: 'type', render: (t: string) => <StatusTag map={WORK_TYPE} value={t} /> },
                            { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={WORK_STATUS} value={s} /> },
                        ]}
                    />
                </Panel>
                <Panel title="Công trình tôi phụ trách" bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={myProjects}
                        scroll={{ x: 480 }}
                        onRow={() => ({ onClick: () => navigate('/portal/projects'), className: 'cursor-pointer' })}
                        columns={[
                            { title: 'Công trình', render: (_, p) => `${p.code} – ${p.name}` },
                            { title: 'Bảo trì kế tiếp', dataIndex: 'nextMaintenance', render: (d: string) => <Tag color={maintenanceInfo(d).color}>{maintenanceInfo(d).label}</Tag> },
                        ]}
                    />
                </Panel>
            </div>
        </>
    );
};

const AccountantDashboard = () => {
    const { db } = useStore();
    const lookup = useLookup();
    const navigate = useNavigate();
    const month = thisMonthKey();
    const issued = db.invoices.filter((i) => i.issuedAt.startsWith(month));
    const receivable = db.invoices.reduce((s, i) => s + Math.max(0, i.amount - i.paidAmount), 0);
    const overdue = db.invoices.filter((i) => invoiceState(i) === 'overdue');

    return (
        <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                <StatCard icon={<FaMoneyBillWave />} label="Doanh thu tháng này" value={formatCompact(issued.reduce((s, i) => s + i.amount, 0))} color="#16a34a" />
                <StatCard icon={<FaHandHoldingUsd />} label="Đã thu tháng này" value={formatCompact(issued.reduce((s, i) => s + i.paidAmount, 0))} color="#2563eb" />
                <StatCard icon={<FaFileInvoiceDollar />} label="Công nợ phải thu" value={formatCompact(receivable)} onClick={() => navigate('/portal/invoices')} />
                <StatCard icon={<FaExclamationTriangle />} label="Hóa đơn quá hạn" value={overdue.length} hint={formatPrice(overdue.reduce((s, i) => s + i.amount - i.paidAmount, 0))} color="#ea580c" onClick={() => navigate('/portal/invoices')} />
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <ChartCard title="Thực thu theo tháng phát hành hóa đơn" data={monthlySeries(db.invoices, 6, 'paidAmount')} format={formatPrice} axisFormat={formatCompact} valueTitle="Đã thu" />
                <Panel title="Hóa đơn quá hạn" bodyClassName="p-0">
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={overdue}
                        locale={{ emptyText: 'Không có hóa đơn quá hạn' }}
                        scroll={{ x: 480 }}
                        columns={[
                            { title: 'Số HĐ', dataIndex: 'code' },
                            { title: 'Khách hàng', dataIndex: 'customerId', render: (id: string) => lookup.user(id)?.company ?? lookup.userName(id) },
                            { title: 'Còn nợ', align: 'right', render: (_, i) => formatPrice(i.amount - i.paidAmount) },
                            { title: 'Hạn', dataIndex: 'dueDate', render: (d: string) => <Tag color="red">{formatDate(d)}</Tag> },
                        ]}
                    />
                </Panel>
            </div>
        </>
    );
};

const greetingNow = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
};

const Dashboard = () => {
    const { user } = useStore();
    if (!user) return null;

    return (
        <div>
            <PageHeader title={`${greetingNow()}, ${user.name}`} subtitle={`${user.position ?? ROLE_LABELS[user.role]} · ${formatDate(todayISO())}`} />
            {user.role === 'admin' && <AdminDashboard />}
            {user.role === 'sales' && <SalesDashboard />}
            {user.role === 'technician' && <TechnicianDashboard />}
            {user.role === 'accountant' && <AccountantDashboard />}
        </div>
    );
};

export default Dashboard;

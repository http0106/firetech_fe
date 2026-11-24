import { Rate, Table, Tabs } from 'antd';
import { ChartCard, HBarList } from '../components/Charts';
import { PageHeader, Panel } from '../components/ui';
import { useLookup, useStore } from '../store';
import { CATEGORIES } from '../data/constants';
import { monthlySeries, productRevenue, ratingOf, daysUntil, formatCompact, formatPrice } from '../utils';

/**
 * Thống kê (Kế toán, Admin): doanh thu, sản phẩm, hiệu quả kinh doanh,
 * hiệu suất kỹ thuật, chất lượng dịch vụ qua đánh giá.
 */
const Reports = () => {
    const { db } = useStore();
    const lookup = useLookup();

    const byProduct = productRevenue(db.orders);
    const byCategory = CATEGORIES.map((c) => ({
        key: c.key,
        label: c.label,
        value: byProduct.filter((p) => lookup.product(p.productId)?.category === c.key).reduce((s, p) => s + p.revenue, 0),
    })).sort((a, b) => b.value - a.value);

    const salesStats = db.users
        .filter((u) => u.role === 'sales')
        .map((u) => {
            const qs = db.quotes.filter((q) => q.salesId === u.id);
            const won = qs.filter((q) => q.status === 'accepted');
            const decided = qs.filter((q) => q.status === 'accepted' || q.status === 'rejected');
            return {
                id: u.id,
                name: u.name,
                quotes: qs.length,
                won: won.length,
                rate: decided.length ? Math.round((won.length / decided.length) * 100) : 0,
                value: won.reduce((s, q) => s + (q.amount ?? 0), 0),
                chats: db.chats.filter((c) => c.assignedTo === u.id).length,
            };
        });

    const techStats = db.users
        .filter((u) => u.role === 'technician')
        .map((u) => {
            const wos = db.workOrders.filter((w) => w.technicianId === u.id);
            return {
                id: u.id,
                name: u.name,
                done: wos.filter((w) => w.status === 'done').length,
                open: wos.filter((w) => w.status === 'pending' || w.status === 'in_progress').length,
                late: wos.filter((w) => (w.status === 'pending' || w.status === 'in_progress') && daysUntil(w.date) < 0).length,
                logs: db.projects.reduce((s, p) => s + p.logs.filter((l) => l.technicianId === u.id).length, 0),
                projects: db.projects.filter((p) => p.technicianIds.includes(u.id)).length,
            };
        });

    const visible = db.reviews.filter((r) => !r.hidden);
    const avg = (list: typeof visible) => (list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0);
    const productReviews = visible.filter((r) => r.targetType === 'product');
    const serviceReviews = visible.filter((r) => r.targetType === 'service');

    return (
        <div>
            <PageHeader title="Thống kê" subtitle="Số liệu tính từ dữ liệu hiện có trong hệ thống." />
            <Tabs
                items={[
                    {
                        key: 'revenue',
                        label: 'Doanh thu',
                        children: (
                            <div className="flex flex-col gap-5">
                                <ChartCard title="Doanh thu theo tháng (giá trị hóa đơn phát hành)" data={monthlySeries(db.invoices, 12)} format={formatPrice} axisFormat={formatCompact} valueTitle="Doanh thu" />
                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                    <Panel title="Doanh số theo danh mục sản phẩm">
                                        <HBarList items={byCategory} format={formatCompact} />
                                    </Panel>
                                    <Panel title="Top 8 sản phẩm theo doanh số">
                                        <HBarList
                                            format={formatCompact}
                                            items={byProduct.slice(0, 8).map((p) => ({ key: p.productId, label: lookup.product(p.productId)?.name, value: p.revenue, hint: `${p.quantity} sản phẩm` }))}
                                        />
                                    </Panel>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'sales',
                        label: 'Kinh doanh',
                        children: (
                            <Panel title="Hiệu quả nhân viên kinh doanh" bodyClassName="p-0">
                                <Table
                                    rowKey="id"
                                    pagination={false}
                                    dataSource={salesStats}
                                    scroll={{ x: 640 }}
                                    columns={[
                                        { title: 'Nhân viên', dataIndex: 'name' },
                                        { title: 'Báo giá phụ trách', dataIndex: 'quotes', align: 'right' },
                                        { title: 'Chốt thành công', dataIndex: 'won', align: 'right' },
                                        { title: 'Tỷ lệ chốt', dataIndex: 'rate', align: 'right', render: (v: number) => `${v}%` },
                                        { title: 'Giá trị chốt', dataIndex: 'value', align: 'right', render: formatPrice },
                                        { title: 'Hội thoại tư vấn', dataIndex: 'chats', align: 'right' },
                                    ]}
                                />
                            </Panel>
                        ),
                    },
                    {
                        key: 'tech',
                        label: 'Kỹ thuật',
                        children: (
                            <Panel title="Hiệu suất kỹ thuật viên" bodyClassName="p-0">
                                <Table
                                    rowKey="id"
                                    pagination={false}
                                    dataSource={techStats}
                                    scroll={{ x: 640 }}
                                    columns={[
                                        { title: 'Kỹ thuật viên', dataIndex: 'name' },
                                        { title: 'Công trình phụ trách', dataIndex: 'projects', align: 'right' },
                                        { title: 'Phiếu hoàn thành', dataIndex: 'done', align: 'right' },
                                        { title: 'Đang mở', dataIndex: 'open', align: 'right' },
                                        { title: 'Trễ hạn', dataIndex: 'late', align: 'right', render: (v: number) => <span className={v ? 'text-red-600 font-bold' : ''}>{v}</span> },
                                        { title: 'Biên bản đã lập', dataIndex: 'logs', align: 'right' },
                                    ]}
                                />
                            </Panel>
                        ),
                    },
                    {
                        key: 'reviews',
                        label: 'Đánh giá',
                        children: (
                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                <Panel title="Điểm trung bình">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Sản phẩm', list: productReviews },
                                            { label: 'Dịch vụ lắp đặt & bảo trì', list: serviceReviews },
                                        ].map((g) => (
                                            <div key={g.label} className="rounded-xl bg-gray-50 dark:bg-slate-800/50 p-4 text-center">
                                                <div className="text-sm text-[var(--text)]">{g.label}</div>
                                                <div className="text-3xl font-extrabold text-[var(--text-h)] mt-1">{avg(g.list).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</div>
                                                <Rate disabled allowHalf value={Math.round(avg(g.list) * 2) / 2} style={{ fontSize: 14 }} />
                                                <div className="text-xs text-[var(--text)]">{g.list.length} đánh giá</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5">
                                        <HBarList
                                            items={[5, 4, 3, 2, 1].map((star) => ({ key: String(star), label: `${star} sao`, value: visible.filter((r) => r.rating === star).length }))}
                                        />
                                    </div>
                                </Panel>
                                <Panel title="Sản phẩm có đánh giá thấp nhất (cần xem lại)" bodyClassName="p-0">
                                    <Table
                                        rowKey="id"
                                        size="small"
                                        pagination={false}
                                        dataSource={[...new Set(productReviews.map((r) => r.targetId))]
                                            .map((id) => ({ id, name: lookup.product(id)?.name, ...ratingOf(db.reviews, 'product', id) }))
                                            .sort((a, b) => a.avg - b.avg)
                                            .slice(0, 6)}
                                        columns={[
                                            { title: 'Sản phẩm', dataIndex: 'name' },
                                            { title: 'Điểm', dataIndex: 'avg', render: (v: number) => v.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) },
                                            { title: 'Số đánh giá', dataIndex: 'count' },
                                        ]}
                                    />
                                </Panel>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default Reports;

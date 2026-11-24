import { useState } from 'react';
import { App, Input, Segmented, Select, Table, Tag } from 'antd';
import { PageHeader, StatusTag } from '../components/ui';
import { useLookup, useStore } from '../store';
import { INVOICE_STATUS, ORDER_STATUS } from '../data/constants';
import { invoiceState, nextCode, addDays, formatDate, formatPrice, matches, todayISO } from '../utils';
import type { Invoice, Order } from '../types';

/**
 * Quản lý đơn hàng (Kinh doanh, Kế toán, Admin).
 * Khi đơn chuyển sang "Đã xác nhận" lần đầu → tự tạo hóa đơn cho Kế toán theo dõi công nợ.
 */
const Orders = () => {
    const { db, add, edit } = useStore();
    const lookup = useLookup();
    const { message } = App.useApp();
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');

    const data = db.orders.filter(
        (o) =>
            (status === 'all' || o.status === status) &&
            (!search || matches(`${o.code} ${lookup.userName(o.customerId)} ${lookup.user(o.customerId)?.company ?? ''}`, search)),
    );

    const changeStatus = (order: Order, next: Order['status']) => {
        edit('orders', order.id, { status: next });
        const hasInvoice = db.invoices.some((i) => i.refType === 'order' && i.refId === order.id);
        if (['confirmed', 'shipping', 'completed'].includes(next) && !hasInvoice) {
            const invoice: Invoice = {
                id: `i-${order.id}`,
                code: nextCode('HD', db.invoices.map((i) => i.code)),
                customerId: order.customerId,
                refType: 'order',
                refId: order.id,
                description: `Đơn hàng ${order.code}`,
                amount: order.total,
                paidAmount: 0,
                issuedAt: todayISO(),
                dueDate: addDays(todayISO(), 30),
            };
            add('invoices', invoice);
            message.success(`Đã cập nhật ${order.code} và tạo hóa đơn ${invoice.code}`);
        } else message.success(`Đã cập nhật ${order.code}`);
    };

    return (
        <div>
            <PageHeader title="Đơn hàng" subtitle="Đơn đặt trên website và đơn tạo từ báo giá." />
            <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
                <div className="overflow-x-auto">
                    <Segmented
                        value={status}
                        onChange={(v) => setStatus(String(v))}
                        options={[
                            { label: 'Tất cả', value: 'all' },
                            ...Object.entries(ORDER_STATUS).map(([k, s]) => ({ label: `${s.label} (${db.orders.filter((o) => o.status === k).length})`, value: k })),
                        ]}
                    />
                </div>
                <Input.Search allowClear placeholder="Mã đơn, khách hàng" onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={data}
                    scroll={{ x: 960 }}
                    expandable={{
                        expandedRowRender: (o) => (
                            <div className="text-sm flex flex-col gap-1">
                                {o.items.map((i) => (
                                    <div key={i.productId} className="flex justify-between gap-3 max-w-xl">
                                        <span>{i.quantity} × {lookup.product(i.productId)?.name}</span>
                                        <span>{formatPrice(i.price * i.quantity)}</span>
                                    </div>
                                ))}
                                <div className="text-[var(--text)]">Giao tới: {o.shippingAddress}{o.note ? ` · ${o.note}` : ''}</div>
                            </div>
                        ),
                    }}
                    columns={[
                        { title: 'Mã đơn', dataIndex: 'code', render: (c: string) => <b>{c}</b> },
                        { title: 'Ngày', dataIndex: 'createdAt', render: formatDate, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt), defaultSortOrder: 'descend' },
                        {
                            title: 'Khách hàng',
                            dataIndex: 'customerId',
                            render: (id: string) => (
                                <span>{lookup.user(id)?.company ?? lookup.userName(id)}<br /><span className="text-xs text-[var(--text)]">{lookup.userName(id)} · {lookup.user(id)?.phone}</span></span>
                            ),
                        },
                        { title: 'SL', render: (_, o) => o.items.reduce((s, i) => s + i.quantity, 0), width: 60 },
                        { title: 'Tổng tiền', dataIndex: 'total', align: 'right', render: (v: number) => <b>{formatPrice(v)}</b>, sorter: (a, b) => a.total - b.total },
                        { title: 'Thanh toán', dataIndex: 'paymentMethod', render: (m: string) => (m === 'cod' ? 'COD' : 'Chuyển khoản') },
                        {
                            title: 'Hóa đơn',
                            render: (_, o) => {
                                const inv = db.invoices.find((i) => i.refType === 'order' && i.refId === o.id);
                                return inv ? <StatusTag map={INVOICE_STATUS} value={invoiceState(inv)} /> : <Tag>Chưa có</Tag>;
                            },
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            render: (s: Order['status'], o) => (
                                <Select
                                    size="small"
                                    value={s}
                                    onChange={(v) => changeStatus(o, v)}
                                    className="w-36"
                                    options={Object.entries(ORDER_STATUS).map(([k, v]) => ({ value: k, label: v.label }))}
                                />
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default Orders;

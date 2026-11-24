import { useState } from 'react';
import { Alert, App, Button, Descriptions, Drawer, Input, InputNumber, Segmented, Switch, Table, Tag } from 'antd';
import { PageHeader, StatusTag } from '../components/ui';
import { useStore, useLookup } from '../store';
import { QUOTE_STATUS } from '../data/constants';
import { nextCode, daysFromNow, formatDate, formatPrice, moneyFormatter, moneyParser, todayISO, uid } from '../utils';
import type { Order, Quote, QuoteItem } from '../types';

/**
 * Xử lý yêu cầu báo giá (Kinh doanh, Admin).
 * Luồng: Mới → Nhận xử lý → nhập đơn giá chào / tổng giá dịch vụ → Gửi báo giá → khách Đồng ý/Từ chối
 * trực tuyến trong tài khoản → (đồng ý) tạo đơn hàng 1 chạm.
 */
const QuoteEditor = ({ quote, onClose }: { quote: Quote; onClose: () => void }) => {
    const { db, add, edit, user } = useStore();
    const lookup = useLookup();
    const { message } = App.useApp();
    const [items, setItems] = useState<QuoteItem[]>(
        quote.items.map((i) => ({ ...i, price: i.price ?? lookup.product(i.productId)?.price ?? 0 })),
    );
    const [serviceAmount, setServiceAmount] = useState<number | null>(quote.kind === 'service' ? quote.amount ?? null : null);
    const [note, setNote] = useState(quote.salesNote ?? '');
    const [validUntil, setValidUntil] = useState(quote.validUntil ?? daysFromNow(14));

    const total = quote.kind === 'product' ? items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) : serviceAmount ?? 0;
    const editable = quote.status === 'new' || quote.status === 'processing' || quote.status === 'sent';

    const save = (status: Quote['status'], extra: Partial<Quote> = {}) =>
        edit('quotes', quote.id, {
            items,
            amount: total || undefined,
            salesNote: note || undefined,
            validUntil,
            salesId: quote.salesId ?? user?.id,
            status,
            ...extra,
        });

    const createOrder = () => {
        if (!quote.customerId) return;
        const order: Order = {
            id: uid('o'),
            code: nextCode('DH', db.orders.map((o) => o.code)),
            customerId: quote.customerId,
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price ?? 0 })),
            total,
            status: 'confirmed',
            paymentMethod: 'transfer',
            shippingAddress: lookup.user(quote.customerId)?.address ?? '',
            note: `Tạo từ báo giá ${quote.code}`,
            createdAt: todayISO(),
        };
        add('orders', order);
        message.success(`Đã tạo đơn ${order.code} từ báo giá`);
        onClose();
    };

    return (
        <div className="flex flex-col gap-4">
            <Descriptions
                size="small"
                column={1}
                items={[
                    { key: 'st', label: 'Trạng thái', children: <StatusTag map={QUOTE_STATUS} value={quote.status} /> },
                    { key: 'c', label: 'Khách hàng', children: <span>{quote.contactName}{quote.company ? ` – ${quote.company}` : ''} {quote.customerId ? <Tag color="blue">Có tài khoản</Tag> : <Tag>Vãng lai</Tag>}</span> },
                    { key: 'p', label: 'Liên hệ', children: `${quote.phone}${quote.email ? ` · ${quote.email}` : ''}` },
                    ...(quote.service ? [{ key: 'sv', label: 'Dịch vụ', children: quote.service }] : []),
                    ...(quote.projectId ? [{ key: 'pj', label: 'Công trình', children: `${lookup.project(quote.projectId)?.code} – ${lookup.project(quote.projectId)?.name}` }] : []),
                    { key: 'm', label: 'Nhu cầu', children: quote.message },
                    { key: 'sa', label: 'Phụ trách', children: quote.salesId ? lookup.userName(quote.salesId) : 'Chưa có' },
                ]}
            />

            {quote.kind === 'product' ? (
                <Table
                    size="small"
                    rowKey="productId"
                    pagination={false}
                    dataSource={items}
                    columns={[
                        { title: 'Sản phẩm', render: (_, i) => <span>{lookup.product(i.productId)?.name}<br /><span className="text-xs text-[var(--text)]">Niêm yết {formatPrice(lookup.product(i.productId)?.price ?? 0)}</span></span> },
                        { title: 'SL', dataIndex: 'quantity', width: 50 },
                        {
                            title: 'Đơn giá chào',
                            width: 150,
                            render: (_, i) => (
                                <InputNumber
                                    min={0}
                                    step={1000}
                                    disabled={!editable}
                                    value={i.price}
                                    formatter={moneyFormatter}
                                    parser={moneyParser}
                                    onChange={(v) => setItems((list) => list.map((x) => (x.productId === i.productId ? { ...x, price: v ?? 0 } : x)))}
                                    className="w-full"
                                />
                            ),
                        },
                    ]}
                />
            ) : (
                <label className="flex flex-col gap-1 text-sm text-[var(--text-h)]">
                    Tổng giá dịch vụ (VNĐ)
                    <InputNumber
                        min={0}
                        step={100000}
                        disabled={!editable}
                        value={serviceAmount}
                        onChange={setServiceAmount}
                        formatter={moneyFormatter}
                        parser={moneyParser}
                        className="w-full"
                        placeholder="Nhập sau khi khảo sát"
                    />
                </label>
            )}

            <div className="flex justify-between items-center rounded-xl bg-gray-50 dark:bg-slate-800/50 p-3">
                <span className="text-[var(--text)]">Tổng giá chào</span>
                <b className="text-lg text-red-600">{formatPrice(total)}</b>
            </div>

            <label className="flex flex-col gap-1 text-sm text-[var(--text-h)]">
                Ghi chú gửi khách
                <Input.TextArea rows={3} disabled={!editable} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Chiết khấu, thời gian giao hàng, điều kiện thanh toán..." />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--text-h)]">
                Hiệu lực đến
                <Input type="date" disabled={!editable} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </label>

            {editable && (
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => { save('processing'); message.success('Đã lưu'); }}>Lưu nháp</Button>
                    <Button
                        type="primary"
                        disabled={total <= 0}
                        onClick={() => {
                            save('sent');
                            message.success(quote.customerId ? 'Đã gửi báo giá cho khách.' : 'Đã chuyển trạng thái. Gửi báo giá cho khách qua email hoặc Zalo.');
                            onClose();
                        }}
                    >
                        Gửi báo giá cho khách
                    </Button>
                </div>
            )}
            {quote.status === 'sent' && (
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => { save('accepted'); message.success('Đã ghi nhận khách đồng ý'); }}>Ghi nhận khách đồng ý (qua điện thoại)</Button>
                    <Button danger onClick={() => { save('rejected'); onClose(); }}>Khách từ chối</Button>
                </div>
            )}
            {quote.status === 'accepted' && quote.kind === 'product' && (
                quote.customerId ? (
                    <Button type="primary" onClick={createOrder}>Tạo đơn hàng từ báo giá</Button>
                ) : (
                    <Alert type="info" showIcon title="Khách vãng lai" description="Hướng dẫn khách tạo tài khoản để đặt hàng và theo dõi bảo hành." />
                )
            )}
        </div>
    );
};

const Quotes = () => {
    const { db, user } = useStore();
    const lookup = useLookup();
    const [status, setStatus] = useState<string>('all');
    const [onlyMine, setOnlyMine] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const open = db.quotes.find((q) => q.id === openId);

    const data = db.quotes.filter((q) => (status === 'all' || q.status === status) && (!onlyMine || q.salesId === user?.id));
    const count = (s: string) => db.quotes.filter((q) => q.status === s).length;

    return (
        <div>
            <PageHeader title="Yêu cầu báo giá" subtitle="Từ website, giỏ hàng, trang dịch vụ và yêu cầu bảo trì của khách hàng." />
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="overflow-x-auto">
                    <Segmented
                        value={status}
                        onChange={(v) => setStatus(String(v))}
                        options={[
                            { label: `Tất cả (${db.quotes.length})`, value: 'all' },
                            ...Object.entries(QUOTE_STATUS).map(([k, s]) => ({ label: `${s.label} (${count(k)})`, value: k })),
                        ]}
                    />
                </div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-h)]">
                    <Switch size="small" checked={onlyMine} onChange={setOnlyMine} /> Chỉ báo giá của tôi
                </label>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={data}
                    scroll={{ x: 900 }}
                    onRow={(q) => ({ onClick: () => setOpenId(q.id), className: 'cursor-pointer' })}
                    columns={[
                        { title: 'Mã', dataIndex: 'code', render: (c: string) => <b>{c}</b> },
                        { title: 'Ngày', dataIndex: 'createdAt', render: formatDate, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
                        {
                            title: 'Khách',
                            render: (_, q) => (
                                <span>
                                    {q.company ?? q.contactName} {q.customerId && <Tag color="blue" className="ml-1">TK</Tag>}
                                    <br />
                                    <span className="text-xs text-[var(--text)]">{q.contactName} · {q.phone}</span>
                                </span>
                            ),
                        },
                        { title: 'Loại', dataIndex: 'kind', render: (k: string) => (k === 'product' ? <Tag>Thiết bị</Tag> : <Tag color="purple">Dịch vụ</Tag>) },
                        { title: 'Nội dung', render: (_, q) => <span className="line-clamp-2 max-w-xs">{q.service ?? q.items.map((i) => `${i.quantity}× ${lookup.product(i.productId)?.code}`).join(', ')}</span> },
                        { title: 'Phụ trách', dataIndex: 'salesId', render: (id?: string) => (id ? lookup.userName(id) : <Tag color="red">Chưa nhận</Tag>) },
                        { title: 'Giá chào', dataIndex: 'amount', align: 'right', render: (v?: number) => (v ? formatPrice(v) : '—') },
                        { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={QUOTE_STATUS} value={s} /> },
                    ]}
                />
            </div>
            <Drawer open={!!open} onClose={() => setOpenId(null)} size={560} title={open ? `Báo giá ${open.code}` : ''}>
                {open && <QuoteEditor key={open.id + open.status} quote={open} onClose={() => setOpenId(null)} />}
            </Drawer>
        </div>
    );
};

export default Quotes;

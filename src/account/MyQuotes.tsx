import { useState } from 'react';
import { Alert, App, Button, Descriptions, Drawer, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatusTag } from '../componentmain/ui';
import { useAuth } from '../context/AuthContext';
import { useLookup, useStore } from '../context/StoreContext';
import { QUOTE_STATUS } from '../data/constants';
import { daysUntil, formatDate, formatPrice } from '../utils/format';
import type { Quote } from '../types';

/**
 *  — Báo giá của khách: xem giá tư vấn viên chào, đồng ý / từ chối trực tuyến
 * (trước đây phải trao đổi qua điện thoại với admin, mất thời gian hai bên).
 */
const MyQuotes = () => {
    const { user } = useAuth();
    const { db, update } = useStore();
    const lookup = useLookup();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [openId, setOpenId] = useState<string | null>(null);
    const quotes = db.quotes.filter((q) => q.customerId === user?.id);
    const open = quotes.find((q) => q.id === openId);

    const respond = (q: Quote, status: 'accepted' | 'rejected') => {
        update('quotes', (list) => list.map((x) => (x.id === q.id ? { ...x, status } : x)));
        message.success(status === 'accepted' ? 'Đã đồng ý báo giá. Tư vấn viên sẽ liên hệ để chốt đơn.' : 'Đã từ chối báo giá.');
    };

    return (
        <div>
            <PageHeader
                title="Báo giá của tôi"
                subtitle="Theo dõi các yêu cầu báo giá & tư vấn đã gửi."
                extra={<Button type="primary" danger onClick={() => navigate('/contact')}>Gửi yêu cầu mới</Button>}
            />
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={quotes}
                    scroll={{ x: 680 }}
                    locale={{ emptyText: 'Chưa có yêu cầu báo giá' }}
                    onRow={(q) => ({ onClick: () => setOpenId(q.id), className: 'cursor-pointer' })}
                    columns={[
                        { title: 'Mã', dataIndex: 'code', render: (c: string) => <b>{c}</b> },
                        { title: 'Ngày gửi', dataIndex: 'createdAt', render: formatDate },
                        { title: 'Loại', dataIndex: 'kind', render: (k: string) => (k === 'product' ? <Tag>Thiết bị</Tag> : <Tag color="purple">Dịch vụ</Tag>) },
                        { title: 'Nội dung', render: (_, q) => q.service ?? `${q.items.length} sản phẩm` },
                        { title: 'Giá chào', dataIndex: 'amount', align: 'right', render: (v?: number) => (v ? formatPrice(v) : '—') },
                        { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={QUOTE_STATUS} value={s} /> },
                    ]}
                />
            </div>

            <Drawer open={!!open} onClose={() => setOpenId(null)} size={520} title={open ? `Báo giá ${open.code}` : ''}>
                {open && (
                    <div className="flex flex-col gap-4">
                        <Descriptions
                            size="small"
                            column={1}
                            items={[
                                { key: 's', label: 'Trạng thái', children: <StatusTag map={QUOTE_STATUS} value={open.status} /> },
                                { key: 'd', label: 'Ngày gửi', children: formatDate(open.createdAt) },
                                ...(open.service ? [{ key: 'sv', label: 'Dịch vụ', children: open.service }] : []),
                                ...(open.projectId ? [{ key: 'pj', label: 'Công trình', children: lookup.project(open.projectId)?.name }] : []),
                                { key: 'm', label: 'Nội dung', children: open.message },
                                { key: 'sa', label: 'Tư vấn viên', children: open.salesId ? `${lookup.userName(open.salesId)} · ${lookup.user(open.salesId)?.phone}` : 'Đang phân công' },
                            ]}
                        />
                        {open.items.length > 0 && (
                            <Table
                                size="small"
                                rowKey="productId"
                                pagination={false}
                                dataSource={open.items}
                                columns={[
                                    { title: 'Sản phẩm', render: (_, i) => lookup.product(i.productId)?.name },
                                    { title: 'SL', dataIndex: 'quantity', width: 50 },
                                    {
                                        title: 'Đơn giá chào',
                                        align: 'right',
                                        render: (_, i) => {
                                            const list = lookup.product(i.productId)?.price ?? 0;
                                            return i.price ? (
                                                <span>{formatPrice(i.price)}{i.price < list && <div className="text-[11px] line-through text-[var(--text)]">{formatPrice(list)}</div>}</span>
                                            ) : '—';
                                        },
                                    },
                                ]}
                            />
                        )}
                        {open.amount && (
                            <div className="flex justify-between items-center rounded-xl bg-gray-50 dark:bg-slate-800/50 p-3">
                                <span className="text-[var(--text)]">Tổng giá chào</span>
                                <b className="text-lg text-red-600">{formatPrice(open.amount)}</b>
                            </div>
                        )}
                        {open.salesNote && <Alert type="info" showIcon title="Ghi chú từ tư vấn viên" description={open.salesNote} />}
                        {open.status === 'sent' && (
                            <>
                                {open.validUntil && (
                                    <p className="text-sm text-[var(--text)]">
                                        Báo giá có hiệu lực đến {formatDate(open.validUntil)}
                                        {daysUntil(open.validUntil) >= 0 ? ` (còn ${daysUntil(open.validUntil)} ngày)` : ' (đã hết hạn)'}.
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Button type="primary" danger block onClick={() => respond(open, 'accepted')}>Đồng ý báo giá</Button>
                                    <Button block onClick={() => respond(open, 'rejected')}>Từ chối</Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default MyQuotes;

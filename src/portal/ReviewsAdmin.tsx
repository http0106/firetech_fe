import { useState } from 'react';
import { App, Button, Input, Modal, Rate, Segmented, Switch, Table, Tag } from 'antd';
import { PageHeader } from '../components/ui';
import { useLookup, useStore } from '../store';
import { formatDate } from '../utils';
import type { Review } from '../types';

/** Phản hồi & kiểm duyệt đánh giá sản phẩm/dịch vụ (Kinh doanh, Admin). */
const ReviewsAdmin = () => {
    const { db, edit } = useStore();
    const lookup = useLookup();
    const { message } = App.useApp();
    const [type, setType] = useState<'all' | Review['targetType'] | 'unreplied'>('all');
    const [replyFor, setReplyFor] = useState<Review | null>(null);
    const [reply, setReply] = useState('');

    const data = db.reviews
        .filter((r) => type === 'all' || (type === 'unreplied' ? !r.reply : r.targetType === type))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const patch = (id: string, changes: Partial<Review>) => edit('reviews', id, changes);

    return (
        <div>
            <PageHeader title="Đánh giá" subtitle="Phản hồi khách hàng công khai, ẩn đánh giá vi phạm." />
            <div className="overflow-x-auto mb-3">
                <Segmented
                    value={type}
                    onChange={(v) => setType(v as typeof type)}
                    options={[
                        { label: 'Tất cả', value: 'all' },
                        { label: `Chưa phản hồi (${db.reviews.filter((r) => !r.reply).length})`, value: 'unreplied' },
                        { label: 'Sản phẩm', value: 'product' },
                        { label: 'Dịch vụ', value: 'service' },
                    ]}
                />
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={data}
                    scroll={{ x: 980 }}
                    columns={[
                        { title: 'Ngày', dataIndex: 'createdAt', render: formatDate, width: 110 },
                        { title: 'Khách', dataIndex: 'userName', render: (n: string, r) => <span>{n}{!r.userId && <Tag className="ml-1">Vãng lai</Tag>}</span> },
                        {
                            title: 'Đối tượng',
                            render: (_, r) =>
                                r.targetType === 'product' ? (
                                    <span><Tag>Sản phẩm</Tag>{lookup.product(r.targetId)?.name}</span>
                                ) : (
                                    <span><Tag color="purple">Dịch vụ</Tag>{lookup.project(r.targetId)?.name}</span>
                                ),
                        },
                        { title: 'Điểm', dataIndex: 'rating', render: (v: number) => <Rate disabled value={v} style={{ fontSize: 12 }} />, sorter: (a, b) => a.rating - b.rating },
                        {
                            title: 'Nội dung',
                            render: (_, r) => (
                                <div className="max-w-sm">
                                    <div className="text-sm">{r.comment}</div>
                                    {r.reply && <div className="text-xs text-[var(--text)] mt-1">↳ {r.reply}</div>}
                                </div>
                            ),
                        },
                        { title: 'Hiển thị', dataIndex: 'hidden', render: (h: boolean, r) => <Switch size="small" checked={!h} onChange={(c) => patch(r.id, { hidden: !c })} /> },
                        {
                            title: '',
                            render: (_, r) => (
                                <Button size="small" onClick={() => { setReplyFor(r); setReply(r.reply ?? ''); }}>
                                    {r.reply ? 'Sửa phản hồi' : 'Phản hồi'}
                                </Button>
                            ),
                        },
                    ]}
                />
            </div>
            <Modal
                title={`Phản hồi ${replyFor?.userName ?? ''}`}
                open={!!replyFor}
                onCancel={() => setReplyFor(null)}
                okText="Đăng phản hồi"
                cancelText="Hủy"
                onOk={() => {
                    if (replyFor) patch(replyFor.id, { reply: reply.trim() || undefined });
                    setReplyFor(null);
                    message.success('Đã cập nhật phản hồi');
                }}
            >
                <p className="text-sm text-[var(--text)] mb-2">“{replyFor?.comment}”</p>
                <Input.TextArea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Cảm ơn quý khách..." />
            </Modal>
        </div>
    );
};

export default ReviewsAdmin;

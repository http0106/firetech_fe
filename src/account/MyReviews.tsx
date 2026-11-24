import { useState } from 'react';
import { App, Button, Form, Input, Modal, Rate } from 'antd';
import { EmptyState, PageHeader, Panel } from '../components/ui';
import ReviewList from '../users/component/ReviewList';
import { useStore, useLookup } from '../store';
import { todayISO, uid } from '../utils';
import type { Review } from '../types';

/**
 * Đánh giá của tôi.
 * "Chờ đánh giá": sản phẩm trong đơn đã hoàn thành và công trình đã được bảo trì mà khách chưa đánh giá.
 */
type Target = { type: Review['targetType']; id: string; name: string };

const MyReviews = () => {
    const { db, add, user } = useStore();
    const lookup = useLookup();
    const { message } = App.useApp();
    const [target, setTarget] = useState<Target | null>(null);
    if (!user) return null;

    const mine = db.reviews.filter((r) => r.userId === user.id);
    const reviewed = new Set(mine.map((r) => `${r.targetType}:${r.targetId}`));
    const boughtIds = [...new Set(db.orders.filter((o) => o.customerId === user.id && o.status === 'completed').flatMap((o) => o.items.map((i) => i.productId)))];
    const pending: Target[] = [
        ...db.projects
            .filter((p) => p.customerId === user.id && p.logs.length && !reviewed.has(`service:${p.id}`))
            .map((p) => ({ type: 'service' as const, id: p.id, name: `Dịch vụ tại ${p.name}` })),
        ...boughtIds.filter((id) => !reviewed.has(`product:${id}`)).map((id) => ({ type: 'product' as const, id, name: lookup.product(id)?.name ?? id })),
    ];

    const submit = (v: { rating: number; comment: string }) => {
        if (!target) return;
        add('reviews', { id: uid('r'), userId: user.id, userName: user.name, targetType: target.type, targetId: target.id, rating: v.rating, comment: v.comment, createdAt: todayISO() });
        setTarget(null);
        message.success('Cảm ơn bạn đã đánh giá!');
    };

    return (
        <div className="flex flex-col gap-5">
            <PageHeader title="Đánh giá của tôi" subtitle="Đánh giá giúp FireTech cải thiện dịch vụ và giúp khách hàng khác lựa chọn." />

            {pending.length > 0 && (
                <Panel title={`Chờ đánh giá (${pending.length})`} bodyClassName="p-0">
                    <div className="divide-y divide-[var(--border)]">
                        {pending.map((t) => (
                            <div key={`${t.type}-${t.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                                <span className="text-sm text-[var(--text-h)]">{t.name}</span>
                                <Button size="small" type="primary" danger ghost onClick={() => setTarget(t)}>Đánh giá</Button>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            {mine.length ? (
                <ReviewList
                    reviews={mine}
                    renderTarget={(r) => (r.targetType === 'product' ? `Sản phẩm: ${lookup.product(r.targetId)?.name}` : `Dịch vụ: ${lookup.project(r.targetId)?.name}`)}
                />
            ) : (
                <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900"><EmptyState title="Bạn chưa có đánh giá nào" /></div>
            )}

            <Modal title={target?.name} open={!!target} onCancel={() => setTarget(null)} footer={null} destroyOnHidden>
                <Form layout="vertical" initialValues={{ rating: 5 }} onFinish={submit}>
                    <Form.Item name="rating" label="Chấm điểm"><Rate /></Form.Item>
                    <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, min: 10, message: 'Tối thiểu 10 ký tự' }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Button type="primary" danger htmlType="submit" block>Gửi đánh giá</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default MyReviews;

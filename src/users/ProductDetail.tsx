import { useState } from 'react';
import { App, Breadcrumb, Button, Card, Form, Input, InputNumber, Modal, Rate, Result, Tabs, Tag } from 'antd';
import { FaBalanceScale, FaBolt, FaCartPlus, FaCheckCircle, FaFileInvoiceDollar } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductThumb from '../componentmain/ProductThumb';
import QuoteForm from '../componentmain/QuoteForm';
import ProductList from './component/ProductList';
import ReviewList from './component/ReviewList';
import CompareBar from './component/CompareBar';
import { DOC_TYPES, STANDARDS, categoryLabel } from '../data/constants';
import { useStore } from '../context/StoreContext';
import { maxQtyOf, useShopActions } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { ratingOf } from '../utils/business';
import { formatPrice, todayISO, uid } from '../utils/format';
import type { Review } from '../types';

/**
 * GIAO DIỆN MỚI — Chi tiết sản phẩm.
 * Thông số, tiêu chuẩn kiểm định, bảo hành, hướng dẫn sử dụng liên quan, đánh giá (chỉ khách đã mua
 * mới được đánh giá), thêm giỏ / mua ngay / yêu cầu báo giá / so sánh.
 */
const ProductDetail = () => {
    const { id } = useParams();
    const { db, update } = useStore();
    const { user } = useAuth();
    const { compare, addWithToast, toggleCompareWithToast } = useShopActions();
    const { message } = App.useApp();
    const navigate = useNavigate();
    const [qty, setQty] = useState(1);
    const [quoteOpen, setQuoteOpen] = useState(false);

    const product = db.products.find((p) => p.id === id);
    if (!product)
        return (
            <Result
                status="404"
                title="Không tìm thấy sản phẩm"
                subTitle="Sản phẩm có thể đã ngừng kinh doanh."
                extra={<Button type="primary" danger onClick={() => navigate('/products')}>Xem sản phẩm khác</Button>}
            />
        );

    const rating = ratingOf(db.reviews, 'product', product.id);
    const docs = db.documents.filter((d) => d.category === product.category);
    const related = db.products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
    const inCompare = compare.includes(product.id);

    const purchased =
        user?.role === 'customer' &&
        db.orders.some((o) => o.customerId === user.id && o.status === 'completed' && o.items.some((i) => i.productId === product.id));
    const alreadyReviewed = !!user && db.reviews.some((r) => r.userId === user.id && r.targetType === 'product' && r.targetId === product.id);

    const submitReview = (v: { rating: number; comment: string }) => {
        const review: Review = {
            id: uid('r'),
            userId: user!.id,
            userName: user!.name,
            targetType: 'product',
            targetId: product.id,
            rating: v.rating,
            comment: v.comment,
            createdAt: todayISO(),
        };
        update('reviews', (list) => [review, ...list]);
        message.success('Cảm ơn bạn đã đánh giá!');
    };

    const reviewBox = () => {
        if (!user)
            return (
                <p className="text-sm text-[var(--text)]">
                    <Link to={`/login?redirect=/products/${product.id}`} className="text-red-600 font-semibold">Đăng nhập</Link> để đánh giá sản phẩm đã mua.
                </p>
            );
        if (user.role !== 'customer') return null;
        if (alreadyReviewed) return <p className="text-sm text-[var(--text)]">Bạn đã đánh giá sản phẩm này. Xem lại trong mục “Đánh giá của tôi”.</p>;
        if (!purchased) return <p className="text-sm text-[var(--text)]">Chỉ khách hàng đã mua (đơn hoàn thành) mới đánh giá được.</p>;
        return (
            <Form layout="vertical" onFinish={submitReview} initialValues={{ rating: 5 }} className="rounded-2xl border border-[var(--border)] p-4">
                <div className="font-semibold text-[var(--text-h)] mb-2">Viết đánh giá của bạn</div>
                <Form.Item name="rating" label="Chấm điểm"><Rate /></Form.Item>
                <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, min: 10, message: 'Nhận xét tối thiểu 10 ký tự' }]}>
                    <Input.TextArea rows={3} placeholder="Chất lượng, đóng gói, giao hàng..." />
                </Form.Item>
                <Button type="primary" danger htmlType="submit">Gửi đánh giá</Button>
            </Form>
        );
    };

    return (
        <div className="py-6">
            <Breadcrumb
                className="mb-4"
                items={[
                    { title: <Link to="/">Trang chủ</Link> },
                    { title: <Link to="/products">Sản phẩm</Link> },
                    { title: <Link to={`/products?category=${product.category}`}>{categoryLabel(product.category)}</Link> },
                    { title: product.code },
                ]}
            />

            <Card>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 select-none">
                        <ProductThumb product={product} size="lg" />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="text-sm text-[var(--text)]">{product.brand} · Mã: <b className="text-[var(--text-h)]">{product.code}</b></div>
                            <h1 className="m-0 tracking-normal text-2xl sm:text-3xl font-extrabold text-[var(--text-h)] mt-1">{product.name}</h1>
                            <div className="flex items-center gap-2 mt-2 text-sm text-[var(--text)]">
                                <Rate disabled allowHalf value={Math.round(rating.avg * 2) / 2} style={{ fontSize: 14 }} />
                                {rating.count ? `${rating.avg.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} (${rating.count} đánh giá)` : 'Chưa có đánh giá'}
                            </div>
                        </div>

                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-extrabold text-red-600">{formatPrice(product.price)}</span>
                            {product.oldPrice && product.oldPrice > product.price && (
                                <span className="text-base line-through text-[var(--text)]">{formatPrice(product.oldPrice)}</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {product.standards.map((s) => (
                                <Tag key={s} color={s === 'bca' ? 'red' : 'blue'} icon={<FaCheckCircle className="mr-1" />} className="m-0 inline-flex items-center">
                                    {STANDARDS.find((x) => x.key === s)?.label}
                                </Tag>
                            ))}
                        </div>

                        <p className="text-sm text-[var(--text)] leading-relaxed">{product.description}</p>

                        <div className="text-sm space-y-1 text-[var(--text)]">
                            <div>Bảo hành: <b className="text-[var(--text-h)]">{product.warrantyMonths} tháng</b></div>
                            <div>
                                Tình trạng:{' '}
                                <b className={product.stock > 0 ? 'text-emerald-600' : 'text-[var(--text-h)]'}>
                                    {product.stock > 0 ? `Kho còn ${product.stock}` : 'Tạm hết hàng'}
                                </b>
                            </div>
                            <div>Giao hàng: nội thành Hà Nội trong ngày</div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <InputNumber min={1} max={Math.max(1, maxQtyOf(product))} value={qty} onChange={(v) => setQty(v ?? 1)} size="large" className="w-28" disabled={product.stock <= 0} />
                            <Button size="large" icon={<FaCartPlus />} disabled={product.stock <= 0} onClick={() => addWithToast(product.id, qty)}>
                                Thêm vào giỏ
                            </Button>
                            <Button type="primary" danger size="large" icon={<FaBolt />} disabled={product.stock <= 0}
                                onClick={() => {
                                    // Đã có đủ số lượng trong giỏ vẫn cho sang trang giỏ hàng
                                    const res = addWithToast(product.id, qty, { silent: true });
                                    if (res.ok || res.reason === 'max_reached') navigate('/cart');
                                }}>
                                Mua ngay
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button icon={<FaFileInvoiceDollar />} onClick={() => setQuoteOpen(true)}>Yêu cầu báo giá số lượng lớn</Button>
                            <Button
                                type={inCompare ? 'primary' : 'default'}
                                ghost={inCompare}
                                icon={<FaBalanceScale />}
                                onClick={() => toggleCompareWithToast(product.id)}
                            >
                                {inCompare ? 'Đã thêm vào so sánh' : 'So sánh'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="mt-6">
                <Tabs
                    items={[
                        {
                            key: 'specs',
                            label: 'Thông số kỹ thuật',
                            children: (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <tbody>
                                            {[
                                                { label: 'Danh mục', value: categoryLabel(product.category) },
                                                { label: 'Thương hiệu', value: product.brand },
                                                ...product.specs,
                                                { label: 'Bảo hành', value: `${product.warrantyMonths} tháng` },
                                            ].map((s) => (
                                                <tr key={s.label} className="border-b border-[var(--border)] last:border-0">
                                                    <th className="text-left font-medium text-[var(--text)] py-2.5 pr-4 w-1/3">{s.label}</th>
                                                    <td className="py-2.5 text-[var(--text-h)]">{s.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ),
                        },
                        {
                            key: 'docs',
                            label: `Hướng dẫn & tài liệu (${docs.length})`,
                            children: docs.length ? (
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {docs.map((d) => (
                                        <Link key={d.id} to={`/documents?doc=${d.id}`} className="rounded-xl border border-[var(--border)] p-3 hover:border-red-400">
                                            <Tag color={DOC_TYPES[d.type].color} className="m-0">{DOC_TYPES[d.type].label}</Tag>
                                            <div className="font-semibold text-[var(--text-h)] mt-2">{d.title}</div>
                                            <div className="text-xs text-[var(--text)] mt-1 line-clamp-2">{d.summary}</div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text)]">Chưa có tài liệu cho nhóm sản phẩm này.</p>
                            ),
                        },
                        {
                            key: 'reviews',
                            label: `Đánh giá (${rating.count})`,
                            children: (
                                <div className="flex flex-col gap-4">
                                    {reviewBox()}
                                    {rating.list.length ? <ReviewList reviews={rating.list} /> : <p className="text-sm text-[var(--text)]">Chưa có đánh giá nào.</p>}
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>

            {related.length > 0 && (
                <section className="mt-10">
                    <ProductList row={4} products={related} title="Sản Phẩm Cùng Loại" subtitle={categoryLabel(product.category)} />
                </section>
            )}

            <Modal title="Yêu cầu báo giá" open={quoteOpen} onCancel={() => setQuoteOpen(false)} footer={null} destroyOnHidden width={560}>
                <QuoteForm items={[{ productId: product.id, quantity: qty }]} compact />
            </Modal>

            <CompareBar />
        </div>
    );
};

export default ProductDetail;

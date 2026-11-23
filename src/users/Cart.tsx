import { useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Radio, Result } from 'antd';
import { FaFileInvoiceDollar, FaShoppingBag, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ProductThumb from '../componentmain/ProductThumb';
import QuoteForm from '../componentmain/QuoteForm';
import { EmptyState } from '../componentmain/ui';
import { maxQtyOf, useShop } from '../context/ShopContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { nextCode } from '../utils/business';
import { formatPrice, todayISO, uid } from '../utils/format';
import type { Order } from '../types';

/**
 * GIAO DIỆN MỚI — Giỏ hàng & đặt hàng (trước đây website chưa có giỏ hàng, mọi thứ phải báo giá qua admin).
 * Hai lựa chọn:
 *  1. Đặt hàng ngay (cần đăng nhập) → đơn vào /portal/orders, khách theo dõi ở /account/orders.
 *  2. Gửi yêu cầu báo giá cho cả giỏ (không cần đăng nhập) — phù hợp nhà thầu / số lượng lớn.
 */
interface CheckoutValues {
    shippingAddress: string;
    paymentMethod: Order['paymentMethod'];
    note?: string;
}

const Cart = () => {
    // Cùng nguồn dữ liệu với giỏ hàng trên Header → số lượng, tổng tiền luôn khớp
    const { lines, cartCount, cartTotal: total, setQuantity, removeFromCart, clearCart } = useShop();
    const { db, update } = useStore();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [quoteOpen, setQuoteOpen] = useState(false);
    const [placed, setPlaced] = useState<Order | null>(null);
    const quoteItems = lines.map((l) => ({ productId: l.productId, quantity: l.quantity }));

    const placeOrder = (v: CheckoutValues) => {
        const order: Order = {
            id: uid('o'),
            code: nextCode('DH', db.orders.map((o) => o.code)),
            customerId: user!.id,
            items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, price: l.product.price })),
            total,
            status: 'pending',
            paymentMethod: v.paymentMethod,
            shippingAddress: v.shippingAddress,
            note: v.note,
            createdAt: todayISO(),
        };
        update('orders', (list) => [order, ...list]);
        clearCart();
        setCheckoutOpen(false);
        setPlaced(order);
    };

    if (placed)
        return (
            <Result
                status="success"
                title={`Đặt hàng thành công: ${placed.code}`}
                subTitle={`Tổng giá trị ${formatPrice(placed.total)}. Nhân viên sẽ gọi xác nhận và báo phí vận chuyển trong giờ làm việc.`}
                extra={[
                    <Button key="orders" type="primary" danger onClick={() => navigate('/account/orders')}>Theo dõi đơn hàng</Button>,
                    <Button key="shop" onClick={() => navigate('/products')}>Tiếp tục mua sắm</Button>,
                ]}
            />
        );

    if (!lines.length)
        return (
            <div className="py-10">
                <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <EmptyState
                        title="Giỏ hàng đang trống"
                        description="Tìm thiết bị phù hợp hoặc xem gợi ý theo tình huống cháy thường gặp."
                        action={<Button type="primary" danger icon={<FaShoppingBag />} onClick={() => navigate('/products')}>Xem sản phẩm</Button>}
                    />
                </div>
            </div>
        );

    return (
        <div className="py-6">
            <h1 className="m-0 tracking-normal text-2xl font-extrabold text-[var(--text-h)] mb-5">Giỏ hàng ({cartCount} sản phẩm)</h1>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
                <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-[var(--border)]">
                    {lines.map((l) => (
                        <div key={l.productId} className="flex gap-4 p-4">
                            <Link to={`/products/${l.productId}`} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden">
                                <ProductThumb product={l.product} size="sm" />
                            </Link>
                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <Link to={`/products/${l.productId}`} className="font-semibold text-[var(--text-h)] hover:text-red-600 line-clamp-2">{l.product.name}</Link>
                                    <div className="text-xs text-[var(--text)] mt-1">Mã {l.product.code} · Bảo hành {l.product.warrantyMonths} tháng</div>
                                    <div className="text-sm font-semibold text-red-600 mt-1">{formatPrice(l.product.price)}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <InputNumber min={1} max={Math.max(1, maxQtyOf(l.product))} value={l.quantity} onChange={(v) => v && setQuantity(l.productId, v)} className="w-20" />
                                    <span className="w-28 text-right font-bold text-[var(--text-h)]">{formatPrice(l.subtotal)}</span>
                                    <Button type="text" danger aria-label="Xóa" icon={<FaTrash />} onClick={() => removeFromCart(l.productId)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <aside className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 lg:sticky lg:top-36 flex flex-col gap-3">
                    <h2 className="m-0 text-base font-bold text-[var(--text-h)]">Tóm tắt đơn hàng</h2>
                    <div className="flex justify-between text-sm text-[var(--text)]"><span>Tạm tính</span><span className="text-[var(--text-h)]">{formatPrice(total)}</span></div>
                    <div className="flex justify-between text-sm text-[var(--text)]"><span>Phí vận chuyển</span><span>Báo khi xác nhận</span></div>
                    <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                        <span className="font-semibold text-[var(--text-h)]">Tổng cộng</span>
                        <span className="text-xl font-extrabold text-red-600">{formatPrice(total)}</span>
                    </div>

                    {user ? (
                        <Button type="primary" danger size="large" block onClick={() => setCheckoutOpen(true)}>Đặt hàng</Button>
                    ) : (
                        <Button type="primary" danger size="large" block onClick={() => navigate('/login?redirect=/cart')}>
                            Đăng nhập để đặt hàng
                        </Button>
                    )}
                    <Button size="large" block icon={<FaFileInvoiceDollar />} onClick={() => setQuoteOpen(true)}>
                        Gửi yêu cầu báo giá cho giỏ hàng
                    </Button>
                    <p className="text-xs text-[var(--text)]">
                        Mua cho công trình, số lượng lớn hoặc cần xuất hóa đơn VAT? Gửi yêu cầu báo giá để nhận chiết khấu, không cần đăng nhập.
                    </p>
                </aside>
            </div>

            <Modal title="Thông tin đặt hàng" open={checkoutOpen} onCancel={() => setCheckoutOpen(false)} footer={null} destroyOnHidden>
                <Form<CheckoutValues>
                    layout="vertical"
                    requiredMark={false}
                    onFinish={placeOrder}
                    initialValues={{ shippingAddress: user?.address, paymentMethod: 'cod' }}
                >
                    <div className="rounded-xl bg-gray-50 dark:bg-slate-800/50 p-3 mb-4 text-sm">
                        <div className="text-[var(--text-h)] font-semibold">{user?.name} · {user?.phone}</div>
                        {user?.company && <div className="text-[var(--text)]">{user.company}</div>}
                    </div>
                    <Form.Item name="shippingAddress" label="Địa chỉ giao hàng" rules={[{ required: true, message: 'Nhập địa chỉ giao hàng' }]}>
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="paymentMethod" label="Thanh toán">
                        <Radio.Group
                            className="flex flex-col gap-2"
                            options={[
                                { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
                                { value: 'transfer', label: 'Chuyển khoản (kế toán gửi thông tin sau khi xác nhận)' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={2} placeholder="Giờ nhận hàng, yêu cầu xuất hóa đơn..." />
                    </Form.Item>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[var(--text)]">Tổng tiền hàng</span>
                        <b className="text-lg text-red-600">{formatPrice(total)}</b>
                    </div>
                    <Button type="primary" danger htmlType="submit" block size="large">Xác nhận đặt hàng</Button>
                </Form>
            </Modal>

            <Modal title="Yêu cầu báo giá cho giỏ hàng" open={quoteOpen} onCancel={() => setQuoteOpen(false)} footer={null} destroyOnHidden width={560}>
                <QuoteForm items={quoteItems} compact />
            </Modal>
        </div>
    );
};

export default Cart;

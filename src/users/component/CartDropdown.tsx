import { useState } from 'react';
import { Badge, Button, Dropdown, Empty, InputNumber } from 'antd';
import { FaArrowRight, FaTrash } from 'react-icons/fa';
import { MdShoppingCart } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import ProductThumb from '../../componentmain/ProductThumb';
import { maxQtyOf, useShop } from '../../context/ShopContext';
import { formatPrice } from '../../utils/format';

/**
 * Giỏ hàng thu gọn trên Header — đọc/ghi trực tiếp ShopContext nên luôn khớp với
 * trang /cart, thẻ sản phẩm, trang chi tiết (trước đây giữ state riêng với dữ liệu giả).
 */
const CartDropdown = () => {
    const navigate = useNavigate();
    const { lines, cartCount, cartTotal, setQuantity, removeFromCart, clearCart } = useShop();
    const [open, setOpen] = useState(false);

    const go = (path: string) => {
        setOpen(false);
        navigate(path);
    };

    return (
        <Dropdown
            trigger={['click']}
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            popupRender={() => (
                <div className="w-[400px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-base text-gray-800 dark:text-slate-100 m-0">Giỏ hàng của bạn</h3>
                            <p className="text-xs text-gray-400 dark:text-slate-400 m-0 mt-1">{cartCount} sản phẩm trong giỏ hàng</p>
                        </div>
                        {lines.length > 0 && (
                            <Button type="text" danger size="small" onClick={clearCart}>
                                Xóa tất cả
                            </Button>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto p-3">
                        {lines.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {lines.map((l) => (
                                    <div
                                        key={l.productId}
                                        className="flex gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-transparent dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        <Link
                                            to={`/products/${l.productId}`}
                                            onClick={() => setOpen(false)}
                                            className="w-[76px] h-[76px] shrink-0 rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700"
                                        >
                                            <ProductThumb product={l.product} size="sm" />
                                        </Link>

                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div className="flex justify-between gap-2">
                                                <div className="min-w-0">
                                                    <Link
                                                        to={`/products/${l.productId}`}
                                                        onClick={() => setOpen(false)}
                                                        className="text-sm font-semibold text-gray-800 dark:text-slate-100 hover:text-red-600 m-0 line-clamp-2 no-underline"
                                                    >
                                                        {l.product.name}
                                                    </Link>
                                                    <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5 mb-0">Mã: {l.product.code}</p>
                                                </div>
                                                <Button
                                                    type="text"
                                                    onClick={() => removeFromCart(l.productId)}
                                                    icon={<FaTrash size={15} className="text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" />}
                                                    title="Xóa sản phẩm"
                                                    aria-label={`Xóa ${l.product.name}`}
                                                    className="h-7 w-7 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatPrice(l.product.price)}</span>
                                                <InputNumber
                                                    min={1}
                                                    max={Math.max(1, maxQtyOf(l.product))}
                                                    size="small"
                                                    value={l.quantity}
                                                    onChange={(v) => v && setQuantity(l.productId, v)}
                                                    className="w-[85px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={<span className="text-gray-500 dark:text-slate-400">Giỏ hàng đang trống</span>}
                                className="py-8"
                            >
                                <Button type="primary" danger onClick={() => go('/products')}>
                                    Xem sản phẩm
                                </Button>
                            </Empty>
                        )}
                    </div>

                    {lines.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-slate-800 p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-500 dark:text-slate-400">Tạm tính</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{formatPrice(cartTotal)}</span>
                            </div>
                            <Button type="primary" danger block size="large" className="font-semibold flex items-center justify-center" onClick={() => go('/cart')}>
                                Xem giỏ hàng
                                <FaArrowRight className="ml-2" size={14} />
                            </Button>
                            <p className="text-center text-[11px] text-gray-400 dark:text-slate-400 mt-3 mb-0">Phí vận chuyển được tính khi thanh toán</p>
                        </div>
                    )}
                </div>
            )}
        >
            <button
                type="button"
                aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
                className="p-2 rounded-full cursor-pointer transition-colors hover:bg-neutral-500/10 flex items-center justify-center bg-transparent border-0"
                style={{ color: 'var(--text-h)' }}
            >
                <Badge count={cartCount} overflowCount={99} offset={[0, -2]}>
                    <MdShoppingCart size={22} style={{ color: 'var(--text-h)' }} />
                </Badge>
            </button>
        </Dropdown>
    );
};

export default CartDropdown;

import { useState, type FC } from 'react';
import { Dropdown, Badge, Avatar, Button, InputNumber, Empty } from 'antd';
import { FaArrowRight, FaTrash } from 'react-icons/fa';
import { MdShoppingCart } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useStore, useLookup } from '../../store';
import { ProductThumb } from '../../components/ui';
import { formatPrice } from '../../utils';

/** Giỏ hàng thu gọn trên Header. */
const CartDropdown: FC = () => {
    const navigate = useNavigate();
    const lookup = useLookup();
    const { cart, cartCount, setQuantity, removeFromCart, clearCart } = useStore();
    const [open, setOpen] = useState(false);

    const items = cart
        .map((i) => ({ ...i, product: lookup.product(i.productId) }))
        .filter((i): i is typeof i & { product: NonNullable<typeof i.product> } => !!i.product);

    // Tổng tiền
    const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    return (
        <Dropdown
            trigger={['click']}
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            popupRender={() => (
                <div className="
            w-[400px] max-w-[calc(100vw-24px)]
            bg-white dark:bg-slate-900 rounded-xl shadow-2xl
            border border-gray-100 dark:border-slate-800 overflow-hidden
        ">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-base text-gray-800 dark:text-slate-100 m-0">
                                Giỏ hàng của bạn
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-slate-400 m-0 mt-1">
                                {cartCount} sản phẩm trong giỏ hàng
                            </p>
                        </div>

                        {items.length > 0 && (
                            <Button type="text" danger size="small" onClick={clearCart}>
                                Xóa tất cả
                            </Button>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto p-3">
                        {items.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {items.map(item => (
                                    <div
                                        key={item.productId}
                                        className="
                        flex gap-3 p-2.5 rounded-xl
                        bg-white dark:bg-slate-800/80
                        border border-transparent dark:border-slate-700/50
                        hover:bg-gray-50 dark:hover:bg-slate-800
                        transition-all
                    "
                                    >
                                        {item.product.image ? (
                                            <Avatar
                                                shape="square"
                                                size={76}
                                                src={item.product.image}
                                                className="shrink-0 border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 cursor-pointer"
                                                onClick={() => { setOpen(false); navigate(`/products/${item.productId}`); }}
                                            />
                                        ) : (
                                            <div className="w-[76px] h-[76px] shrink-0 rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700">
                                                <ProductThumb product={item.product} size="sm" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div className="flex justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h4 className="
                                    text-sm font-semibold
                                    text-gray-800 dark:text-slate-100 m-0
                                    line-clamp-2
                                ">
                                                        {item.product.name}
                                                    </h4>
                                                    <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5 mb-0">
                                                        Mã: {item.product.code}
                                                    </p>
                                                </div>

                                                <Button
                                                    type="text"
                                                    onClick={() => removeFromCart(item.productId)}
                                                    icon={<FaTrash size={15} className='text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors' />}
                                                    title="Xóa sản phẩm"
                                                    className="h-7 w-7 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                                    {formatPrice(item.product.price)}
                                                </span>

                                                <InputNumber
                                                    min={1}
                                                    max={99}
                                                    size="small"
                                                    value={item.quantity}
                                                    onChange={(value) => value && setQuantity(item.productId, value)}
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
                            />
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-slate-800 p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-500 dark:text-slate-400">
                                    Tạm tính
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>

                            <Button
                                type="primary"
                                danger
                                block
                                size="large"
                                className="font-semibold flex items-center justify-center"
                                onClick={() => {
                                    setOpen(false);
                                    navigate('/cart');
                                }}
                            >
                                Xem giỏ hàng
                                <FaArrowRight className="ml-2" size={14} />
                            </Button>

                            <p className="text-center text-[11px] text-gray-400 dark:text-slate-400 mt-3 mb-0">
                                Phí vận chuyển được tính khi thanh toán
                            </p>
                        </div>
                    )}
                </div>
            )}
        >
            <div
                className="
            p-2 rounded-full cursor-pointer
            transition-colors hover:bg-neutral-500/10
            flex items-center justify-center
        "
                style={{ color: 'var(--text-h)' }}
                role="button"
                aria-label="Giỏ hàng"
            >
                <Badge count={cartCount} offset={[0, -2]} className="cursor-pointer">
                    <MdShoppingCart size={22} style={{ color: 'var(--text-h)' }} />
                </Badge>
            </div>
        </Dropdown>
    );
};

export default CartDropdown;

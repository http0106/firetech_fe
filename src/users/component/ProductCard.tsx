import { Button, Tag, Tooltip } from 'antd';
import { FaBalanceScale, FaCartPlus, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import ProductThumb from '../../componentmain/ProductThumb';
import { useShopActions } from '../../context/ShopContext';
import { formatPrice } from '../../utils/format';

/**
 * Thẻ sản phẩm — giữ kiểu thẻ cũ (ảnh vuông + tem BCA, mã, tên, giá, "Chi tiết →").
 * Đã sửa: định dạng giá, tình trạng kho thật, ảnh dự phòng theo danh mục, bấm vào mở trang chi tiết,
 * thêm giỏ / so sánh nhanh dùng chung ShopContext (badge Header cập nhật ngay).
 */
const ProductCard = ({ item }: { item: Product }) => {
    const { compare, addWithToast, toggleCompareWithToast } = useShopActions();
    const inCompare = compare.includes(item.id);
    const inStock = item.stock > 0;
    const detail = `/products/${item.id}`;

    return (
        <div className="box-border w-full h-full min-w-0 bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
            {/* ẢNH & BADGE (chống kéo/thả ảnh) */}
            <Link
                to={detail}
                className="relative block aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-2 select-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
            >
                <ProductThumb product={item} className="transition-transform duration-500 group-hover:scale-105 pointer-events-none" />
                {item.standards.includes('bca') && (
                    <div className="absolute top-2 left-2">
                        <Tag color="error" icon={<FaShieldAlt className="mr-1" />} className="m-0 font-bold text-[10px] border-0 shadow-sm inline-flex items-center">
                            BCA Kiểm Định
                        </Tag>
                    </div>
                )}
                {item.oldPrice && item.oldPrice > item.price && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                        -{Math.round((1 - item.price / item.oldPrice) * 100)}%
                    </span>
                )}
            </Link>

            {/* THÔNG TIN SẢN PHẨM */}
            <div className="flex flex-col flex-grow justify-between space-y-1.5">
                <div>
                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                        <span>Mã: {item.code}</span>
                        {inStock ? (
                            <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                <FaCheckCircle className="text-[10px]" /> Còn hàng
                            </span>
                        ) : (
                            <span className="text-slate-400 font-bold">Hết hàng</span>
                        )}
                    </div>
                    <Link to={detail} className="no-underline">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-600 transition-colors line-clamp-2 mt-0.5 leading-snug">
                            {item.name}
                        </h3>
                    </Link>
                </div>

                {/* GIÁ & THAO TÁC */}
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-base font-extrabold text-red-600">{formatPrice(item.price)}</span>
                        {item.oldPrice && item.oldPrice > item.price && (
                            <span className="text-[11px] line-through text-slate-400">{formatPrice(item.oldPrice)}</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-1.5">
                        <Link to={detail} className="text-xs font-semibold text-blue-600 hover:underline">
                            Chi tiết &rarr;
                        </Link>
                        <div className="flex items-center gap-1">
                            <Tooltip title={inCompare ? 'Bỏ so sánh' : 'So sánh'}>
                                <Button
                                    size="small"
                                    shape="circle"
                                    type={inCompare ? 'primary' : 'default'}
                                    aria-label={inCompare ? 'Bỏ so sánh' : 'Thêm vào so sánh'}
                                    aria-pressed={inCompare}
                                    icon={<FaBalanceScale size={12} />}
                                    onClick={() => toggleCompareWithToast(item.id)}
                                />
                            </Tooltip>
                            <Tooltip title={inStock ? 'Thêm vào giỏ' : 'Tạm hết hàng'}>
                                <Button
                                    size="small"
                                    shape="circle"
                                    type="primary"
                                    danger
                                    aria-label="Thêm vào giỏ"
                                    disabled={!inStock}
                                    icon={<FaCartPlus size={12} />}
                                    onClick={() => addWithToast(item.id)}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

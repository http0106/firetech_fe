import { App, Button, Tag, Tooltip } from 'antd';
import { SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { FaBalanceScale, FaCartPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { ProductThumb } from '../../components/ui';
import { useStore, MAX_COMPARE } from '../../store';

/** Thẻ sản phẩm: ảnh, mã, tồn kho, tên, giá, nút "Thêm vào giỏ" và "So sánh". */
export default function ProductCard({ item }: { item: Product }) {
    const { addToCart, compare, toggleCompare } = useStore();
    const { message } = App.useApp();
    const inCompare = compare.includes(item.id);

    return (
        <div className="w-full max-w-[260px] bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">

            {/* ẢNH & NHÃN BCA (chặn chuột phải / kéo ảnh) */}
            <Link to={`/products/${item.id}`} className="relative block aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2 select-none">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        draggable="false"
                        onContextMenu={(e) => e.preventDefault()}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                    />
                ) : (
                    <ProductThumb product={item} size="lg" />
                )}
                {item.standards.includes('bca') && (
                    <div className="absolute top-2 left-2">
                        <Tag color="error" icon={<SafetyCertificateOutlined />} className="m-0 font-bold text-[10px] border-0 shadow-sm">
                            BCA Kiểm Định
                        </Tag>
                    </div>
                )}
            </Link>

            {/* THÔNG TIN SẢN PHẨM */}
            <div className="flex flex-col flex-grow justify-between space-y-1.5">
                <div>
                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                        <span>Mã: {item.code}</span>
                        {item.stock > 0 ? (
                            <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                <CheckCircleOutlined className="text-[10px]" /> Kho còn {item.stock}
                            </span>
                        ) : (
                            <span className="font-bold">Hết hàng</span>
                        )}
                    </div>

                    <Link to={`/products/${item.id}`}>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-2 mt-0.5 leading-snug">
                            {item.name}
                        </h3>
                    </Link>
                </div>

                {/* GIÁ & CHI TIẾT */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-extrabold text-red-600">{item.price.toLocaleString('vi-VN')}đ</span>
                    <Link to={`/products/${item.id}`} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                        Chi tiết &rarr;
                    </Link>
                </div>

                {/* GIỎ HÀNG & SO SÁNH */}
                <div className="flex gap-1.5">
                    <Button
                        size="small"
                        type="primary"
                        danger
                        block
                        icon={<FaCartPlus />}
                        disabled={item.stock <= 0}
                        onClick={() => {
                            addToCart(item.id);
                            message.success('Đã thêm vào giỏ hàng');
                        }}
                    >
                        Thêm vào giỏ
                    </Button>
                    <Tooltip title={inCompare ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}>
                        <Button
                            size="small"
                            type={inCompare ? 'primary' : 'default'}
                            aria-label="So sánh"
                            icon={<FaBalanceScale />}
                            onClick={() => {
                                if (!toggleCompare(item.id)) message.warning(`Chỉ so sánh tối đa ${MAX_COMPARE} sản phẩm`);
                            }}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

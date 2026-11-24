import type { ReactNode } from 'react';
import { App, Button, Rate } from 'antd';
import { FaCartPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ProductThumb, EmptyState } from '../components/ui';
import { useStore, useLookup } from '../store';
import { STANDARDS, categoryLabel } from '../data/constants';
import { ratingOf, formatPrice } from '../utils';
import type { Product } from '../types';

/**
 * So sánh sản phẩm (tối đa 4).
 * Giải quyết: khách chỉ muốn xem/so sánh giá mà không phải hỏi báo giá qua admin.
 */
const Compare = () => {
    const { db, compare, toggleCompare, addToCart } = useStore();
    const lookup = useLookup();
    const navigate = useNavigate();
    const { message } = App.useApp();

    const products = compare.map((id) => lookup.product(id)).filter((p): p is Product => !!p);

    if (products.length < 2)
        return (
            <div className="py-10">
                <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <EmptyState
                        title="Chọn ít nhất 2 sản phẩm để so sánh"
                        description="Bấm biểu tượng cân trên thẻ sản phẩm để thêm vào danh sách so sánh."
                        action={<Button type="primary" danger onClick={() => navigate('/products')}>Chọn sản phẩm</Button>}
                    />
                </div>
            </div>
        );

    const minPrice = Math.min(...products.map((p) => p.price));
    const specLabels = [...new Set(products.flatMap((p) => p.specs.map((s) => s.label)))];

    const rows: { label: string; render: (p: Product) => ReactNode }[] = [
        { label: 'Giá', render: (p) => (
            <span className={`font-bold ${p.price === minPrice ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatPrice(p.price)}{p.price === minPrice && <span className="block text-[11px] font-semibold">Giá thấp nhất</span>}
            </span>
        ) },
        { label: 'Thương hiệu', render: (p) => p.brand },
        { label: 'Danh mục', render: (p) => categoryLabel(p.category) },
        { label: 'Bảo hành', render: (p) => `${p.warrantyMonths} tháng` },
        { label: 'Đánh giá', render: (p) => {
            const r = ratingOf(db.reviews, 'product', p.id);
            return r.count ? <span className="inline-flex items-center gap-1"><Rate disabled allowHalf value={Math.round(r.avg * 2) / 2} style={{ fontSize: 12 }} /> ({r.count})</span> : '—';
        } },
        { label: 'Tình trạng', render: (p) => (p.stock > 0 ? 'Còn hàng' : 'Hết hàng') },
        ...STANDARDS.map((s) => ({
            label: s.label,
            render: (p: Product) => (p.standards.includes(s.key) ? <FaCheck className="text-emerald-600" /> : <FaTimes className="text-[var(--text)]" />),
        })),
        ...specLabels.map((label) => ({ label, render: (p: Product) => p.specs.find((s) => s.label === label)?.value ?? '—' })),
    ];

    return (
        <div className="py-6">
            <h1 className="m-0 tracking-normal text-2xl font-extrabold text-[var(--text-h)] mb-1">So sánh sản phẩm</h1>
            <p className="text-sm text-[var(--text)] mb-5">Giá niêm yết, chưa gồm chiết khấu dự án. Cần giá tốt hơn? Gửi yêu cầu báo giá từ giỏ hàng.</p>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <table className="w-full min-w-[640px] text-sm border-collapse">
                    <thead>
                        <tr>
                            <th className="w-44 p-3 text-left align-bottom text-[var(--text)] font-medium">Sản phẩm</th>
                            {products.map((p) => (
                                <th key={p.id} className="p-3 align-top text-left font-normal">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            aria-label="Bỏ khỏi so sánh"
                                            onClick={() => toggleCompare(p.id)}
                                            className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-[var(--border)] grid place-items-center cursor-pointer text-[var(--text)] hover:text-red-600"
                                        >
                                            <FaTimes size={10} />
                                        </button>
                                        <Link to={`/products/${p.id}`} className="block aspect-square rounded-xl overflow-hidden mb-2 max-w-[160px]">
                                            <ProductThumb product={p} size="md" />
                                        </Link>
                                        <Link to={`/products/${p.id}`} className="font-semibold text-[var(--text-h)] hover:text-red-600 line-clamp-2">{p.name}</Link>
                                        <Button
                                            size="small"
                                            type="primary" danger
                                            className="mt-2"
                                            icon={<FaCartPlus />}
                                            onClick={() => { addToCart(p.id); message.success('Đã thêm vào giỏ hàng'); }}
                                        >
                                            Thêm vào giỏ
                                        </Button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.label} className="border-t border-[var(--border)] even:bg-gray-50 dark:even:bg-slate-800/50">
                                <th className="p-3 text-left font-medium text-[var(--text)]">{r.label}</th>
                                {products.map((p) => (
                                    <td key={p.id} className="p-3 text-[var(--text-h)]">{r.render(p)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Compare;

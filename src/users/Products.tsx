import { useState } from 'react';
import { Badge, Button, Drawer, Input, Pagination, Select } from 'antd';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import ProductList from './component/ProductList';
import CompareBar from './component/CompareBar';
import { useStore } from '../store';
import { CATEGORIES, PRICE_RANGES, STANDARDS, categoryLabel } from '../data/constants';
import { ratingOf, matches } from '../utils';
import type { Product } from '../types';

/**
 * TRANG SẢN PHẨM: bộ lọc bên trái, danh sách bên phải.
 *
 * Mọi bộ lọc được lưu trên địa chỉ trang, ví dụ:
 *   /products?q=bình&category=binh-chua-chay,bao-chay&price=lt500&sort=price-asc&page=2
 * → Header, Footer chỉ cần dẫn link là mở đúng bộ lọc; tải lại trang không mất bộ lọc.
 * Bấm ô nào là lọc ngay.
 */
const PAGE_SIZE = 12;

const SORTS = [
    { value: 'popular', label: 'Phổ biến' },
    { value: 'price-asc', label: 'Giá thấp → cao' },
    { value: 'price-desc', label: 'Giá cao → thấp' },
    { value: 'rating', label: 'Đánh giá cao' },
    { value: 'name', label: 'Tên A → Z' },
];

/** Nhãn danh mục hiển thị trong bộ lọc. */
const FILTER_LABELS: Record<string, string> = {
    'binh-chua-chay': 'Bình chữa cháy (MFZ, CO2)',
    'bao-chay': 'Thiết bị báo cháy tự động',
    'voi-tru': 'Họng nước, Vòi & Lăng phun',
    'bao-ho': 'Đồ bảo hộ & Thoát hiểm',
    'den-exit': 'Hệ thống đèn Exit & Sự cố',
};

/** Có thì bỏ ra, chưa có thì thêm vào. */
const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

const inputClass = 'rounded border-gray-300 dark:border-slate-700 text-red-600 accent-red-600 focus:ring-red-500 bg-transparent';
const labelClass = 'flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors';
const groupTitleClass = 'text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400';

const Products = () => {
    const { db } = useStore();
    const [params, setParams] = useSearchParams();
    const [drawerOpen, setDrawerOpen] = useState(false);

    /* ---------- 1. Đọc bộ lọc từ địa chỉ trang ---------- */
    const getList = (key: string) => params.get(key)?.split(',') ?? [];
    const q = params.get('q') ?? '';
    const cats = getList('category');
    const stds = getList('standard');
    const brands = getList('brand');
    const price = params.get('price') ?? '';
    const inStock = params.get('stock') === '1';
    const sort = params.get('sort') ?? 'popular';
    const page = Number(params.get('page') ?? 1);

    /** Đổi 1 bộ lọc trên địa chỉ trang (giá trị rỗng = bỏ lọc). Đổi bộ lọc thì quay về trang 1. */
    const setFilter = (key: string, value: string | string[]) => {
        const text = Array.isArray(value) ? value.join(',') : value;
        const next = new URLSearchParams(params);
        if (text) next.set(key, text);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        setParams(next, { replace: true, preventScrollReset: true });
    };

    /** Bỏ hết bộ lọc, chỉ giữ từ khóa tìm kiếm. */
    const resetFilters = () => setParams(q ? { q } : {}, { replace: true });

    /* ---------- 2. Lọc & sắp xếp ---------- */
    const range = PRICE_RANGES.find((r) => r.key === price);
    const results = db.products.filter(
        (p) =>
            (!q || matches(`${p.name} ${p.code} ${p.brand} ${categoryLabel(p.category)} ${p.description}`, q)) &&
            (cats.length === 0 || cats.includes(p.category)) &&
            (brands.length === 0 || brands.includes(p.brand)) &&
            stds.every((s) => p.standards.some((x) => x === s)) &&
            (!range || (p.price >= range.min && p.price < range.max)) &&
            (!inStock || p.stock > 0),
    );

    const rating = (p: Product) => ratingOf(db.reviews, 'product', p.id);
    if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
    if (sort === 'rating') results.sort((a, b) => rating(b).avg - rating(a).avg);
    if (sort === 'name') results.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    if (sort === 'popular') results.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || rating(b).count - rating(a).count);

    const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const allBrands = [...new Set(db.products.map((p) => p.brand))].sort();
    const activeCount = cats.length + stds.length + brands.length + (price ? 1 : 0) + (inStock ? 1 : 0);

    let title = 'Thiết Bị PCCC Kiểm Định BCA';
    if (cats.length === 1) title = CATEGORIES.find((c) => c.key === cats[0])?.label ?? title;
    if (q) title = `Kết quả tìm kiếm “${q}”`;

    /* ---------- 3. Khung bộ lọc (dùng cho cả cột trái và ngăn kéo trên điện thoại) ---------- */
    const filterPanel = (
        <div className="relative py-5 pb-10 z-10 h-full overflow-y-auto p-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 flex flex-col gap-5">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-800 dark:text-slate-100 m-0 flex items-center gap-2">
                    <span className="w-2 h-5 bg-red-600 rounded-full"></span>
                    Bộ lọc tìm kiếm
                </h3>
                <Button type="text" size="small" className="text-xs text-gray-500 dark:text-slate-400 hover:text-red-600" onClick={resetFilters}>
                    Thiết lập lại
                </Button>
            </div>

            <div className="flex flex-col gap-3">
                <span className={groupTitleClass}>Danh mục sản phẩm</span>
                <div className="flex flex-col gap-2.5">
                    {CATEGORIES.map((cat) => (
                        <label key={cat.key} className={`${labelClass} justify-between`}>
                            <span className="flex items-center gap-2">
                                <input type="checkbox" className={inputClass} checked={cats.includes(cat.key)} onChange={() => setFilter('category', toggle(cats, cat.key))} />
                                {FILTER_LABELS[cat.key]}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">({db.products.filter((p) => p.category === cat.key).length})</span>
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800 my-0" />

            <div className="flex flex-col gap-3">
                <span className={groupTitleClass}>Tiêu chuẩn & Kiểm định</span>
                <div className="flex flex-col gap-2.5">
                    {STANDARDS.map((std) => (
                        <label key={std.key} className={labelClass}>
                            <input type="checkbox" className={inputClass} checked={stds.includes(std.key)} onChange={() => setFilter('standard', toggle(stds, std.key))} />
                            {std.label}
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800 my-0" />

            <div className="flex flex-col gap-3">
                <span className={groupTitleClass}>Khoảng giá</span>
                <div className="flex flex-col gap-2">
                    {PRICE_RANGES.map((r) => (
                        <label key={r.key} className={labelClass}>
                            <input type="radio" name="priceRange" className={inputClass} checked={price === r.key} onChange={() => setFilter('price', r.key)} />
                            {r.label}
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800 my-0" />

            <div className="flex flex-col gap-3">
                <span className={groupTitleClass}>Thương hiệu phổ biến</span>
                <div className="grid grid-cols-2 gap-2">
                    {allBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300 cursor-pointer p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                            <input type="checkbox" className={inputClass} checked={brands.includes(brand)} onChange={() => setFilter('brand', toggle(brands, brand))} />
                            {brand}
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800 my-0" />

            <label className={labelClass}>
                <input type="checkbox" className={inputClass} checked={inStock} onChange={() => setFilter('stock', inStock ? '' : '1')} />
                Chỉ hiện sản phẩm còn hàng
            </label>
        </div>
    );

    /* ---------- 4. Giao diện ---------- */
    return (
        <>
            <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-screen py-5 lg:p-5 items-start">
                {/* Cột bộ lọc — máy tính */}
                <div className="hidden lg:block sticky top-20 h-[calc(100vh-96px)] overflow-hidden bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-solid border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-[#3399CC]/10">
                    <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute top-1/2 -right-24 w-96 h-96 bg-orange-400/10 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
                    {filterPanel}
                </div>

                {/* Cột sản phẩm */}
                <div className="lg:col-span-3 p-2 sm:p-4 !border !border-solid !border-gray-200 dark:!border-white rounded-lg shadow-[#3399CC] shadow-sm min-w-0">
                    {/* Thanh công cụ: tìm kiếm, số kết quả, sắp xếp */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
                        <div className="w-full sm:max-w-sm">
                            <Input
                                key={q}
                                defaultValue={q}
                                placeholder="Tìm trong danh sách sản phẩm..."
                                prefix={<FaSearch className="w-3.5 h-3.5 mr-1.5 opacity-60" style={{ color: 'var(--text)' }} />}
                                allowClear
                                onPressEnter={(e) => setFilter('q', e.currentTarget.value.trim())}
                                onClear={() => setFilter('q', '')}
                                className="rounded-full py-1.5 px-4 text-xs shadow-inner"
                                style={{ backgroundColor: 'var(--bg)', color: 'var(--text-h)', borderColor: 'var(--border)' }}
                            />
                        </div>
                        <div className="flex items-center gap-2 justify-between sm:justify-end">
                            <span className="text-xs text-gray-500 dark:text-slate-400">{results.length} sản phẩm</span>
                            <Badge count={activeCount} size="small">
                                <Button className="lg:hidden" icon={<FaFilter />} onClick={() => setDrawerOpen(true)}>
                                    Bộ lọc
                                </Button>
                            </Badge>
                            <Select value={sort} onChange={(v) => setFilter('sort', v === 'popular' ? '' : v)} options={SORTS} className="w-40" />
                        </div>
                    </div>

                    {pageItems.length > 0 ? (
                        <>
                            <ProductList row={3} products={pageItems} title={title} subtitle={`${results.length} sản phẩm chính hãng, đạt chuẩn chất lượng.`} />
                            {results.length > PAGE_SIZE && (
                                <div className="flex justify-center mt-8">
                                    <Pagination
                                        current={page}
                                        pageSize={PAGE_SIZE}
                                        total={results.length}
                                        showSizeChanger={false}
                                        onChange={(p) => {
                                            setFilter('page', String(p));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="font-bold text-base text-gray-800 dark:text-slate-100">Không tìm thấy sản phẩm phù hợp</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Thử bỏ bớt bộ lọc hoặc gửi yêu cầu để tư vấn viên tìm giúp bạn.</p>
                            <Button type="primary" danger className="mt-4" onClick={resetFilters}>
                                Thiết lập lại bộ lọc
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bộ lọc — điện thoại */}
            <Drawer title="Bộ lọc tìm kiếm" placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} size={320} styles={{ body: { padding: 0 } }}>
                {filterPanel}
            </Drawer>

            <CompareBar />
        </>
    );
};

export default Products;

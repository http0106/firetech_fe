import { useMemo, useState } from 'react';
import { Badge, Button, Drawer, Input, Pagination, Select, Tag } from 'antd';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { useLocation, useSearchParams } from 'react-router-dom';
import ProductList from './component/ProductList';
import CompareBar from './component/CompareBar';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, PRICE_RANGES, STANDARDS, categoryLabel } from '../data/constants';
import { ratingOf } from '../utils/business';
import { matches } from '../utils/format';
import type { CategoryKey, Product as ProductType, StandardKey } from '../types';

/**
 * Trang sản phẩm (trước đây layout/Product.tsx) — giữ nguyên giao diện cũ:
 * thanh bộ lọc bên trái (nền mờ, viền xanh nhạt), cột sản phẩm bên phải.
 * Đã làm cho bộ lọc hoạt động thật: chọn điều kiện → "Áp dụng bộ lọc"; "Thiết lập lại" để xóa.
 * Bộ lọc lưu trên URL (?q=&category=&brand=&standard=&price=&stock=&sort=) để chia sẻ link
 * và để menu Header dẫn thẳng vào từng danh mục.
 */
const PAGE_SIZE = 12;

/** Nhãn danh mục giữ như bộ lọc cũ. */
const FILTER_LABELS: Record<CategoryKey, string> = {
    'binh-chua-chay': 'Bình chữa cháy (MFZ, CO2)',
    'bao-chay': 'Thiết bị báo cháy tự động',
    'voi-tru': 'Họng nước, Vòi & Lăng phun',
    'bao-ho': 'Đồ bảo hộ & Thoát hiểm',
    'den-exit': 'Hệ thống đèn Exit & Sự cố',
};

/** Anchor của submenu "Thiết bị PCCC" trong Header gốc. */
const HASH_CATEGORY: Record<string, CategoryKey> = {
    'fire-extinguishers': 'binh-chua-chay',
    'fire-alarm': 'bao-chay',
    'fire-hydrant': 'voi-tru',
    'protective-equipment': 'bao-ho',
};

const SORTS = [
    { value: 'popular', label: 'Phổ biến' },
    { value: 'price-asc', label: 'Giá thấp → cao' },
    { value: 'price-desc', label: 'Giá cao → thấp' },
    { value: 'rating', label: 'Đánh giá cao' },
    { value: 'name', label: 'Tên A → Z' },
];

interface Filters {
    cats: CategoryKey[];
    stds: StandardKey[];
    price: string;
    brands: string[];
    inStock: boolean;
}

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

const inputClass = 'rounded border-gray-300 dark:border-slate-700 text-red-600 accent-red-600 focus:ring-red-500 bg-transparent';

/** Thanh bộ lọc — giao diện cũ, chọn xong bấm "Áp dụng bộ lọc". */
const FilterPanel = ({
    initial,
    products,
    brands,
    onApply,
    onReset,
}: {
    initial: Filters;
    products: ProductType[];
    brands: string[];
    onApply: (f: Filters) => void;
    onReset: () => void;
}) => {
    const [draft, setDraft] = useState<Filters>(initial);

    return (
        <div className="relative py-5 pb-10 z-10 h-full overflow-y-auto p-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 flex flex-col gap-5">

            {/* Header Bộ lọc */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-gray-800 dark:text-slate-100 m-0 flex items-center gap-2">
                    <span className="w-2 h-5 bg-red-600 rounded-full"></span>
                    Bộ lọc tìm kiếm
                </h3>
                <Button type="text" size="small" className="text-xs text-gray-500 dark:text-slate-400 hover:text-red-600" onClick={onReset}>
                    Thiết lập lại
                </Button>
            </div>

            <div className="flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                    Danh mục sản phẩm
                </span>
                <div className="flex flex-col gap-2.5">
                    {CATEGORIES.map((cat) => (
                        <label key={cat.key} className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <span className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className={inputClass}
                                    checked={draft.cats.includes(cat.key)}
                                    onChange={() => setDraft({ ...draft, cats: toggle(draft.cats, cat.key) })}
                                />
                                {FILTER_LABELS[cat.key]}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">({products.filter((p) => p.category === cat.key).length})</span>
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800 my-0" />

            <div className="flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                    Tiêu chuẩn & Kiểm định
                </span>
                <div className="flex flex-col gap-2.5">
                    {STANDARDS.map((std) => (
                        <label key={std.key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <input
                                type="checkbox"
                                className={inputClass}
                                checked={draft.stds.includes(std.key)}
                                onChange={() => setDraft({ ...draft, stds: toggle(draft.stds, std.key) })}
                            />
                            {std.label}
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800 my-0" />

            <div className="flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                    Khoảng giá
                </span>
                <div className="flex flex-col gap-2">
                    {PRICE_RANGES.map((price) => (
                        <label key={price.key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <input
                                type="radio"
                                name="priceRange"
                                className={inputClass}
                                checked={draft.price === price.key}
                                onChange={() => setDraft({ ...draft, price: price.key })}
                            />
                            {price.label}
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800 my-0" />

            {/* 4. Thương hiệu / Xuất xứ */}
            <div className="flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                    Thương hiệu phổ biến
                </span>
                <div className="grid grid-cols-2 gap-2">
                    {brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300 cursor-pointer p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                            <input
                                type="checkbox"
                                className={inputClass}
                                checked={draft.brands.includes(brand)}
                                onChange={() => setDraft({ ...draft, brands: toggle(draft.brands, brand) })}
                            />
                            {brand}
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800 my-0" />

            {/* Bổ sung: tình trạng hàng */}
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <input type="checkbox" className={inputClass} checked={draft.inStock} onChange={() => setDraft({ ...draft, inStock: !draft.inStock })} />
                Chỉ hiện sản phẩm còn hàng
            </label>

            {/* Nút Áp dụng bộ lọc */}
            <div className="pt-2 pb-4 mb-5">
                <Button type="primary" danger block size="large" className="font-semibold shadow-md shadow-red-500/20" onClick={() => onApply(draft)}>
                    Áp dụng bộ lọc
                </Button>
            </div>

        </div>
    );
};

const Product = () => {
    const { db } = useStore();
    const [params, setParams] = useSearchParams();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const { hash } = useLocation();
    const q = params.get('q') ?? '';
    const list = (key: string) => params.get(key)?.split(',').filter(Boolean) ?? [];
    // Link submenu Header gốc dùng #fire-extinguishers... → lọc đúng danh mục
    const hashCat = HASH_CATEGORY[hash.slice(1)];
    const filters: Filters = {
        cats: (params.get('category') ? list('category') : hashCat ? [hashCat] : []) as CategoryKey[],
        stds: list('standard') as StandardKey[],
        price: params.get('price') ?? '',
        brands: list('brand'),
        inStock: params.get('stock') === '1',
    };
    const sort = params.get('sort') ?? 'popular';

    const update = (patch: Record<string, string | null>) =>
        setParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
                return next;
            },
            { replace: true, preventScrollReset: true },
        );

    const apply = (f: Filters) => {
        update({
            category: f.cats.join(',') || null,
            standard: f.stds.join(',') || null,
            price: f.price || null,
            brand: f.brands.join(',') || null,
            stock: f.inStock ? '1' : null,
        });
        setDrawerOpen(false);
    };
    const reset = () => {
        apply({ cats: [], stds: [], price: '', brands: [], inStock: false });
    };

    const brandsAll = useMemo(() => [...new Set(db.products.map((p) => p.brand))].sort(), [db.products]);

    const results = useMemo(() => {
        const range = PRICE_RANGES.find((r) => r.key === filters.price);
        const filtered = db.products.filter(
            (p) =>
                (!q || matches(`${p.name} ${p.code} ${p.brand} ${categoryLabel(p.category)} ${p.description}`, q)) &&
                (!filters.cats.length || filters.cats.includes(p.category)) &&
                (!filters.brands.length || filters.brands.includes(p.brand)) &&
                filters.stds.every((s) => p.standards.includes(s)) &&
                (!range || (p.price >= range.min && p.price < range.max)) &&
                (!filters.inStock || p.stock > 0),
        );
        const rating = (id: string) => ratingOf(db.reviews, 'product', id);
        const sorters: Record<string, (a: ProductType, b: ProductType) => number> = {
            popular: (a, b) => Number(!!b.featured) - Number(!!a.featured) || rating(b.id).count - rating(a.id).count,
            'price-asc': (a, b) => a.price - b.price,
            'price-desc': (a, b) => b.price - a.price,
            rating: (a, b) => rating(b.id).avg - rating(a.id).avg,
            name: (a, b) => a.name.localeCompare(b.name, 'vi'),
        };
        return [...filtered].sort(sorters[sort] ?? sorters.popular);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db.products, db.reviews, params, hashCat]);

    // Về trang 1 mỗi khi bộ lọc đổi
    const filterKey = `${params.toString()}${hash}`;
    const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
    const page = pageState.key === filterKey ? pageState.page : 1;
    const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const activeCount = filters.cats.length + filters.stds.length + filters.brands.length + (filters.price ? 1 : 0) + (filters.inStock ? 1 : 0);
    const chips = [
        ...filters.cats.map((c) => ({ key: `c-${c}`, label: FILTER_LABELS[c], close: () => update({ category: filters.cats.filter((x) => x !== c).join(',') || null }) })),
        ...filters.stds.map((s) => ({ key: `s-${s}`, label: STANDARDS.find((x) => x.key === s)?.label ?? s, close: () => update({ standard: filters.stds.filter((x) => x !== s).join(',') || null }) })),
        ...filters.brands.map((b) => ({ key: `b-${b}`, label: b, close: () => update({ brand: filters.brands.filter((x) => x !== b).join(',') || null }) })),
        ...(filters.price ? [{ key: 'price', label: PRICE_RANGES.find((r) => r.key === filters.price)?.label ?? '', close: () => update({ price: null }) }] : []),
        ...(filters.inStock ? [{ key: 'stock', label: 'Còn hàng', close: () => update({ stock: null }) }] : []),
    ];

    const title = q
        ? `Kết quả tìm kiếm “${q}”`
        : filters.cats.length === 1
          ? categoryLabel(filters.cats[0])
          : 'Thiết Bị PCCC Kiểm Định BCA';

    const panel = (
        <FilterPanel key={filterKey} initial={filters} products={db.products} brands={brandsAll} onApply={apply} onReset={reset} />
    );

    return (
        <>
            <div className="box-border w-full grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-screen py-5 lg:p-5 items-start">
                <div className="hidden lg:block sticky top-20 h-[calc(100vh-96px)] overflow-hidden bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-solid border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-[#3399CC]/10">

                    <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute top-1/2 -right-24 w-96 h-96 bg-orange-400/10 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                    {panel}
                </div>

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
                                onPressEnter={(e) => update({ q: (e.target as HTMLInputElement).value.trim() || null })}
                                onClear={() => update({ q: null })}
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
                            <Select value={sort} onChange={(v) => update({ sort: v === 'popular' ? null : v })} options={SORTS} className="w-40" />
                        </div>
                    </div>

                    {chips.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {chips.map((c) => (
                                <Tag key={c.key} closable onClose={c.close} color="red" className="m-0">
                                    {c.label}
                                </Tag>
                            ))}
                            <Button type="link" danger size="small" onClick={reset}>
                                Xóa tất cả
                            </Button>
                        </div>
                    )}

                    {paged.length ? (
                        <>
                            <ProductList row={3} products={paged} title={title} subtitle={`${results.length} sản phẩm chính hãng, đạt chuẩn chất lượng.`} />
                            {results.length > PAGE_SIZE && (
                                <div className="flex justify-center mt-8">
                                    <Pagination
                                        current={page}
                                        pageSize={PAGE_SIZE}
                                        total={results.length}
                                        showSizeChanger={false}
                                        onChange={(p) => {
                                            setPageState({ key: filterKey, page: p });
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
                            <Button type="primary" danger className="mt-4" onClick={reset}>
                                Thiết lập lại bộ lọc
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Drawer title="Bộ lọc tìm kiếm" placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} size={320} styles={{ body: { padding: 0 } }}>
                {panel}
            </Drawer>

            <CompareBar />
        </>
    );
};

export default Product;

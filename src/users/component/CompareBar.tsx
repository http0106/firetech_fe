import { Button } from 'antd';
import { FaBalanceScale, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useShop, MAX_COMPARE } from '../../context/ShopContext';
import { useLookup } from '../../context/StoreContext';
import ProductThumb from '../../componentmain/ProductThumb';

/** Thanh so sánh nổi ở cuối màn hình khi đã chọn sản phẩm để so sánh. */
const CompareBar = () => {
    const { compare, toggleCompare, clearCompare } = useShop();
    const lookup = useLookup();
    const navigate = useNavigate();
    if (!compare.length) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[min(720px,calc(100%-112px))] max-sm:left-4 max-sm:translate-x-0 max-sm:w-[calc(100%-96px)]">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2.5">
                <FaBalanceScale className="text-red-600 shrink-0 ml-1 hidden sm:block" />
                <div className="flex gap-2 flex-1 min-w-0 overflow-x-auto">
                    {compare.map((id) => {
                        const p = lookup.product(id);
                        if (!p) return null;
                        return (
                            <div key={id} className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-[var(--border)]" title={p.name}>
                                <ProductThumb product={p} size="sm" />
                                <button
                                    type="button"
                                    aria-label={`Bỏ ${p.name}`}
                                    onClick={() => toggleCompare(id)}
                                    className="absolute top-0 right-0 w-4 h-4 grid place-items-center bg-black/60 text-white border-0 cursor-pointer rounded-bl"
                                >
                                    <FaTimes size={8} />
                                </button>
                            </div>
                        );
                    })}
                    <span className="hidden sm:flex items-center text-xs text-[var(--text)] pl-1">
                        {compare.length}/{MAX_COMPARE} sản phẩm
                    </span>
                </div>
                <Button type="text" size="small" onClick={clearCompare} className="hidden sm:inline-flex">
                    Xóa
                </Button>
                <Button type="primary" danger onClick={() => navigate('/compare')} disabled={compare.length < 2}>
                    So sánh{compare.length < 2 ? ' (chọn ≥ 2)' : ''}
                </Button>
            </div>
        </div>
    );
};

export default CompareBar;

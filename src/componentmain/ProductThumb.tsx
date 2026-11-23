import type { IconType } from 'react-icons';
import { FaBell, FaDoorOpen, FaFaucet, FaFireExtinguisher, FaHardHat } from 'react-icons/fa';
import type { CategoryKey, Product } from '../types';

/**
 * Ảnh minh họa sản phẩm theo danh mục. Khi sản phẩm có `image` thật (Admin tải lên)
 * thì hiển thị ảnh đó; nếu không, dùng biểu tượng — không phụ thuộc ảnh bên ngoài.
 */
const STYLE: Record<CategoryKey, { icon: IconType; color: string }> = {
    'binh-chua-chay': { icon: FaFireExtinguisher, color: '#dc2626' },
    'bao-chay': { icon: FaBell, color: '#ea580c' },
    'voi-tru': { icon: FaFaucet, color: '#2563eb' },
    'bao-ho': { icon: FaHardHat, color: '#ca8a04' },
    'den-exit': { icon: FaDoorOpen, color: '#16a34a' },
};

const SIZES = { sm: 22, md: 44, lg: 88 };

const ProductThumb = ({
    product,
    size = 'md',
    className = '',
}: {
    product: Pick<Product, 'category' | 'code' | 'image' | 'name'>;
    size?: keyof typeof SIZES;
    className?: string;
}) => {
    if (product.image)
        return <img src={product.image} alt={product.name} className={`w-full h-full object-cover ${className}`} />;

    const { icon: Icon, color } = STYLE[product.category];
    return (
        <div
            className={`relative w-full h-full grid place-items-center overflow-hidden ${className}`}
            style={{ background: `linear-gradient(140deg, ${color}14, ${color}33)` }}
            role="img"
            aria-label={product.name}
        >
            <Icon size={SIZES[size]} style={{ color }} />
            {size !== 'sm' && (
                <span
                    className="absolute bottom-2 right-2 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[var(--text)]"
                >
                    {product.code}
                </span>
            )}
        </div>
    );
};

export default ProductThumb;

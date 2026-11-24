import type { ReactNode } from 'react';
import { Button, Card, Empty, Result, Statistic, Tag } from 'antd';
import type { IconType } from 'react-icons';
import { FaBell, FaDoorOpen, FaFaucet, FaFireExtinguisher, FaHardHat } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { CategoryKey, Product } from '../types';

/**
 * CÁC MẢNH GIAO DIỆN DÙNG CHUNG:
 * Logo, ProductThumb (ảnh sản phẩm), StatusTag, StatCard, PageHeader, Panel,
 * SectionTitle, Forbidden (trang 403), EmptyState.
 */

/* ---------- Logo (ảnh logo + chữ FIRE TECH) ---------- */

const LOGO_SRC = 'https://pccctrucbinh.vn/wp-content/themes/truc-binh-pccc/assets/img/logo.png';

export const Logo = ({ small = false }: { small?: boolean }) => (
    <span className="inline-flex items-center select-none">
        <img src={LOGO_SRC} className={`${small ? 'h-8' : 'h-10'} object-contain`} alt="Logo PCCC" />
        <span className="mx-2 tracking-widest font-bold flex items-center">
            <span className={`text-[#FF3333] ${small ? 'text-xl' : 'text-2xl'} -mt-0.5 mr-1 drop-shadow-sm`}>FIRE</span>
            <span className={`text-[#3399FF] ${small ? 'text-xl' : 'text-2xl'} drop-shadow-sm`}>TECH</span>
        </span>
    </span>
);

/* ---------- Ảnh sản phẩm: có link ảnh thì hiện ảnh, không thì hiện biểu tượng theo danh mục ---------- */

const THUMB_STYLE: Record<CategoryKey, { icon: IconType; color: string }> = {
    'binh-chua-chay': { icon: FaFireExtinguisher, color: '#dc2626' },
    'bao-chay': { icon: FaBell, color: '#ea580c' },
    'voi-tru': { icon: FaFaucet, color: '#2563eb' },
    'bao-ho': { icon: FaHardHat, color: '#ca8a04' },
    'den-exit': { icon: FaDoorOpen, color: '#16a34a' },
};
const THUMB_SIZES = { sm: 22, md: 44, lg: 88 };

export const ProductThumb = ({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' | 'lg' }) => {
    if (product.image) return <img src={product.image} alt={product.name} className="w-full h-full object-cover" />;

    const { icon: Icon, color } = THUMB_STYLE[product.category];
    return (
        <div
            className="relative w-full h-full grid place-items-center overflow-hidden"
            style={{ background: `linear-gradient(140deg, ${color}14, ${color}33)` }}
            role="img"
            aria-label={product.name}
        >
            <Icon size={THUMB_SIZES[size]} style={{ color }} />
            {size !== 'sm' && (
                <span className="absolute bottom-2 right-2 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[var(--text)]">
                    {product.code}
                </span>
            )}
        </div>
    );
};

/* ---------- Các khối khác ---------- */

export const StatusTag = ({ map, value }: { map: Record<string, { label: string; color: string }>; value: string }) => (
    <Tag color={map[value]?.color} className="m-0">
        {map[value]?.label ?? value}
    </Tag>
);

export const StatCard = ({
    icon,
    label,
    value,
    hint,
    color = '#FF4D4D',
    onClick,
}: {
    icon: ReactNode;
    label: string;
    value: string | number;
    hint?: ReactNode;
    color?: string;
    onClick?: () => void;
}) => (
    <Card size="small" hoverable={!!onClick} onClick={onClick} className="h-full">
        <Statistic title={label} value={value} prefix={<span style={{ color }} className="mr-1 inline-flex">{icon}</span>} />
        {hint && <div className="text-xs mt-1 text-gray-400 dark:text-slate-500">{hint}</div>}
    </Card>
);

export const PageHeader = ({ title, subtitle, extra }: { title: ReactNode; subtitle?: ReactNode; extra?: ReactNode }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
            <h1 className="m-0 tracking-normal font-bold text-lg sm:text-xl flex items-center gap-2" style={{ color: 'var(--text-h)' }}>
                <span className="w-2 h-5 bg-red-600 rounded-full shrink-0"></span>
                {title}
            </h1>
            {subtitle && <p className="text-xs mt-1 ml-4" style={{ color: 'var(--text)' }}>{subtitle}</p>}
        </div>
        {extra && <div className="flex flex-wrap gap-2">{extra}</div>}
    </div>
);

export const Panel = ({
    title,
    extra,
    children,
    className = '',
    bodyClassName = '',
}: {
    title?: ReactNode;
    extra?: ReactNode;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
}) => (
    <Card
        size="small"
        title={title}
        extra={extra}
        className={className}
        styles={bodyClassName.includes('p-0') ? { body: { padding: 0 } } : undefined}
    >
        {children}
    </Card>
);

/** Tiêu đề khu vực trên website — cùng kiểu tiêu đề danh sách sản phẩm gốc. */
export const SectionTitle = ({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) => (
    <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E48] dark:text-slate-100">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
);

export const Forbidden = () => {
    const navigate = useNavigate();
    return (
        <Result
            status="403"
            title="Không có quyền truy cập"
            subTitle="Tài khoản của bạn chưa được cấp quyền cho chức năng này."
            extra={<Button onClick={() => navigate(-1)}>Quay lại</Button>}
        />
    );
};

export const EmptyState = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
    <Empty
        className="py-8"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
            <span>
                <span className="block font-semibold" style={{ color: 'var(--text-h)' }}>{title}</span>
                {description && <span className="block text-xs mt-1 max-w-md mx-auto">{description}</span>}
            </span>
        }
    >
        {action}
    </Empty>
);

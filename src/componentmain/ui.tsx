import type { ReactNode } from 'react';
import { Button, Card, Empty, Result, Statistic, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * Các mảnh giao diện dùng lại — bám theo thiết kế gốc:
 * - Tiêu đề trang: vạch đỏ đứng + chữ đậm (như "Bộ lọc tìm kiếm" ở trang sản phẩm cũ).
 * - Tiêu đề khu vực: như "Thiết Bị PCCC Kiểm Định BCA" (ProductList cũ).
 * - Khung nội dung / số liệu: Card, Statistic, Empty của Ant Design.
 */

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
export const SectionTitle = ({ title, subtitle }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; center?: boolean }) => (
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

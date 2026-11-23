import type { Invoice, Review } from '../types';
import { daysUntil, formatDate } from './format';

/** Quy tắc nghiệp vụ dùng chung giữa trang khách hàng và trang nội bộ. */

export type InvoiceState = 'paid' | 'partial' | 'unpaid' | 'overdue';

export const invoiceState = (inv: Invoice): InvoiceState => {
    if (inv.paidAmount >= inv.amount) return 'paid';
    if (daysUntil(inv.dueDate) < 0) return 'overdue';
    return inv.paidAmount > 0 ? 'partial' : 'unpaid';
};

/** Trạng thái lịch bảo trì: quá hạn / sắp đến (≤ 14 ngày) / còn xa. */
export const maintenanceInfo = (date: string) => {
    const d = daysUntil(date);
    if (d < 0) return { days: d, color: 'red', label: `Quá hạn ${-d} ngày`, level: 'critical' as const };
    if (d === 0) return { days: d, color: 'red', label: 'Hôm nay', level: 'warning' as const };
    if (d <= 14) return { days: d, color: 'orange', label: `Còn ${d} ngày`, level: 'warning' as const };
    return { days: d, color: 'green', label: `Còn ${d} ngày`, level: 'ok' as const };
};

/** Trạng thái bảo hành thiết bị: hết hạn / sắp hết (≤ 60 ngày) / còn hạn. */
export const warrantyInfo = (until: string) => {
    const d = daysUntil(until);
    if (d < 0) return { days: d, color: 'default', label: 'Hết bảo hành', level: 'expired' as const };
    if (d <= 60) return { days: d, color: 'orange', label: `Còn ${d} ngày`, level: 'soon' as const };
    return { days: d, color: 'green', label: `Đến ${formatDate(until)}`, level: 'ok' as const };
};

export const ratingOf = (reviews: Review[], targetType: Review['targetType'], targetId: string) => {
    const list = reviews.filter((r) => r.targetType === targetType && r.targetId === targetId && !r.hidden);
    const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
    return { avg, count: list.length, list };
};

/** Sinh mã tiếp theo: nextCode('BG', ['BG-301','BG-299']) → 'BG-302'. */
export const nextCode = (prefix: string, codes: string[]) => {
    const max = codes.reduce((m, c) => {
        const n = Number(c.split('-').pop());
        return Number.isFinite(n) && n > m ? n : m;
    }, 0);
    return `${prefix}-${max + 1}`;
};

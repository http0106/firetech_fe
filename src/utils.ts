import type { Invoice, Order, Review } from './types';

/**
 * CÁC HÀM TIỆN ÍCH DÙNG CHUNG
 *  1. Ngày tháng      2. Tiền & số      3. Tìm kiếm      4. Quy tắc nghiệp vụ      5. Thống kê
 * Ngày luôn lưu dạng chuỗi "YYYY-MM-DD" (ví dụ "2026-11-24").
 */

/* ===================== 1. NGÀY THÁNG ===================== */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Date → "2026-11-24" (theo giờ máy). */
const toISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** "2026-11-24" → Date lúc 0 giờ. */
const parseDate = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
};

/** Hôm nay, dạng "2026-11-24". */
export const todayISO = () => toISODate(new Date());

/** Cộng n ngày vào một ngày. */
export const addDays = (iso: string, days: number) => {
    const d = parseDate(iso);
    d.setDate(d.getDate() + days);
    return toISODate(d);
};

/** Cộng n tháng vào một ngày. */
export const addMonths = (iso: string, months: number) => {
    const d = parseDate(iso);
    d.setMonth(d.getMonth() + months);
    return toISODate(d);
};

/** n ngày tính từ hôm nay (n âm = ngày đã qua). Dùng nhiều trong dữ liệu mẫu. */
export const daysFromNow = (n: number) => addDays(todayISO(), n);

/** Còn bao nhiêu ngày nữa tới ngày iso (số âm = đã qua). */
export const daysUntil = (iso: string) => Math.round((parseDate(iso).getTime() - parseDate(todayISO()).getTime()) / DAY_MS);

/** "2026-11-24" → "24/11/2026". */
export const formatDate = (iso?: string) =>
    iso ? parseDate(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

/** Giờ của tin nhắn chat: "14:05" nếu là hôm nay, "14:05 23/11" nếu ngày khác. */
export const formatTime = (iso: string) => {
    const d = new Date(iso);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return toISODate(d) === todayISO() ? time : `${time} ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
};

/** Thời điểm hiện tại, có cả giờ phút giây. */
export const nowISO = () => new Date().toISOString();

/** Thời điểm cách đây h giờ (dùng trong dữ liệu mẫu chat). */
export const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

/** "Vừa xong", "5 phút trước", "3 giờ trước", "2 ngày trước"... */
export const relativeTime = (iso: string) => {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return formatDate(iso);
};

/** n tháng gần nhất (cũ → mới): [{ key: '2026-10', label: 'T10/26' }, ...] */
const lastMonths = (n: number) => {
    const now = new Date();
    return Array.from({ length: n }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
        return { key: toISODate(d).slice(0, 7), label: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}` };
    });
};

/* ===================== 2. TIỀN & SỐ ===================== */

/** 1250000 → "1.250.000 ₫" */
export const formatPrice = (n: number) => `${Math.round(n).toLocaleString('vi-VN')} ₫`;

/** 12500000 → "12,5 tr" (dùng cho thẻ số liệu và trục biểu đồ). */
export const formatCompact = (n: number) => {
    if (n >= 1e9) return `${(n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
    if (n >= 1e6) return `${(n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
    if (n >= 1e3) return `${(n / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} k`;
    return n.toLocaleString('vi-VN');
};

/** Cho ô nhập tiền: <InputNumber formatter={moneyFormatter} parser={moneyParser} /> — 1000000 ↔ "1.000.000". */
export const moneyFormatter = (v?: number | string) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const moneyParser = (v?: string) => Number((v ?? '').replace(/\./g, ''));

/** Tạo id ngẫu nhiên không trùng, ví dụ uid('p') → "p-m3k9x2ab". */
export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ===================== 3. TÌM KIẾM ===================== */

/** Bỏ dấu tiếng Việt + chữ thường: "Bình CO2" → "binh co2". */
const removeAccents = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();

/** Tìm không phân biệt dấu, khớp từng từ: matches("Bình chữa cháy khí CO2", "binh co2") → true. */
export const matches = (text: string, query: string) => {
    const haystack = removeAccents(text);
    return removeAccents(query)
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => haystack.includes(word));
};

/* ===================== 4. QUY TẮC NGHIỆP VỤ ===================== */

export type InvoiceState = 'paid' | 'partial' | 'unpaid' | 'overdue';

/** Trạng thái hóa đơn: đã trả đủ / quá hạn / trả một phần / chưa trả. */
export const invoiceState = (inv: Invoice): InvoiceState => {
    if (inv.paidAmount >= inv.amount) return 'paid';
    if (daysUntil(inv.dueDate) < 0) return 'overdue';
    return inv.paidAmount > 0 ? 'partial' : 'unpaid';
};

/** Lịch bảo trì: quá hạn (đỏ) / sắp đến trong 14 ngày (cam) / còn xa (xanh). */
export const maintenanceInfo = (date: string) => {
    const d = daysUntil(date);
    if (d < 0) return { days: d, color: 'red', label: `Quá hạn ${-d} ngày` };
    if (d === 0) return { days: d, color: 'red', label: 'Hôm nay' };
    if (d <= 14) return { days: d, color: 'orange', label: `Còn ${d} ngày` };
    return { days: d, color: 'green', label: `Còn ${d} ngày` };
};

/** Bảo hành thiết bị: hết hạn / sắp hết trong 60 ngày / còn hạn. */
export const warrantyInfo = (until: string) => {
    const d = daysUntil(until);
    if (d < 0) return { days: d, color: 'default', label: 'Hết bảo hành', level: 'expired' as const };
    if (d <= 60) return { days: d, color: 'orange', label: `Còn ${d} ngày`, level: 'soon' as const };
    return { days: d, color: 'green', label: `Đến ${formatDate(until)}`, level: 'ok' as const };
};

/** Điểm trung bình + số lượt đánh giá (bỏ đánh giá bị ẩn) của 1 sản phẩm / công trình. */
export const ratingOf = (reviews: Review[], targetType: Review['targetType'], targetId: string) => {
    const list = reviews.filter((r) => r.targetType === targetType && r.targetId === targetId && !r.hidden);
    const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
    return { avg, count: list.length, list };
};

/** Sinh mã tiếp theo: nextCode('BG', ['BG-301', 'BG-299']) → 'BG-302'. */
export const nextCode = (prefix: string, codes: string[]) => {
    const numbers = codes.map((c) => Number(c.split('-').pop())).filter((n) => !isNaN(n));
    return `${prefix}-${Math.max(0, ...numbers) + 1}`;
};

/* ===================== 5. THỐNG KÊ ===================== */

/** "2026-11" — tháng này / tháng trước, để lọc ngày bằng startsWith. */
export const thisMonthKey = () => lastMonths(1)[0].key;
export const prevMonthKey = () => lastMonths(2)[0].key;

/** Tổng tiền hóa đơn (hoặc số đã thu) của từng tháng gần đây — dữ liệu cho biểu đồ cột. */
export const monthlySeries = (invoices: Invoice[], months = 6, field: 'amount' | 'paidAmount' = 'amount') =>
    lastMonths(months).map((m) => ({
        label: m.label,
        value: invoices.filter((i) => i.issuedAt.startsWith(m.key)).reduce((s, i) => s + i[field], 0),
    }));

/** Doanh số từng sản phẩm (bỏ đơn đã hủy), sắp xếp từ cao xuống thấp. */
export const productRevenue = (orders: Order[]) => {
    const rows: Record<string, { productId: string; quantity: number; revenue: number }> = {};
    for (const order of orders) {
        if (order.status === 'cancelled') continue;
        for (const item of order.items) {
            const row = rows[item.productId] ?? { productId: item.productId, quantity: 0, revenue: 0 };
            row.quantity += item.quantity;
            row.revenue += item.price * item.quantity;
            rows[item.productId] = row;
        }
    }
    return Object.values(rows).sort((a, b) => b.revenue - a.revenue);
};

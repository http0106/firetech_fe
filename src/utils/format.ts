/** Tiện ích định dạng ngày, tiền và tìm kiếm tiếng Việt. */

const DAY_MS = 86_400_000;

export const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

export const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/** Ngày dạng YYYY-MM-DD → Date theo giờ địa phương. */
export const parseDate = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const todayISO = () => toISODate(startOfToday());

export const daysFromNow = (n: number) => {
    const d = startOfToday();
    d.setDate(d.getDate() + n);
    return toISODate(d);
};

export const addDays = (iso: string, days: number) => {
    const d = parseDate(iso);
    d.setDate(d.getDate() + days);
    return toISODate(d);
};

export const addMonths = (iso: string, months: number) => {
    const d = parseDate(iso);
    d.setMonth(d.getMonth() + months);
    return toISODate(d);
};

/** Số ngày từ hôm nay tới ngày iso (âm = đã qua). */
export const daysUntil = (iso: string) =>
    Math.round((parseDate(iso).getTime() - startOfToday().getTime()) / DAY_MS);

export const formatDate = (iso?: string) =>
    iso
        ? parseDate(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';

/** Giờ:phút nếu là hôm nay, kèm ngày/tháng nếu là ngày khác (dùng cho tin nhắn chat). */
export const formatTime = (iso: string) => {
    const d = new Date(iso);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return toISODate(d) === toISODate(new Date()) ? time : `${time} ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
};

export const formatPrice = (n: number) => `${Math.round(n).toLocaleString('vi-VN')} ₫`;

/** 12.500.000 → "12,5 tr" — dùng cho thẻ số liệu và trục biểu đồ. */
export const formatCompact = (n: number) => {
    if (n >= 1e9) return `${(n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
    if (n >= 1e6) return `${(n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
    if (n >= 1e3) return `${(n / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} k`;
    return n.toLocaleString('vi-VN');
};

export const nowISO = () => new Date().toISOString();

export const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return formatDate(iso);
};

export const uid = (prefix = 'id') =>
    `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Danh sách n tháng gần nhất (tính cả tháng hiện tại), cũ → mới. */
export const lastMonths = (n: number) => {
    const now = startOfToday();
    return Array.from({ length: n }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
        return {
            key: toISODate(d).slice(0, 7),
            label: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`,
        };
    });
};

/** Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu: "binh co2" khớp "Bình CO2". */
export const normalize = (s: string) =>
    s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

/** Khớp theo từng từ, không phân biệt dấu: "binh co2" khớp "Bình chữa cháy khí CO2". */
export const matches = (text: string, query: string) => {
    const haystack = normalize(text);
    return normalize(query)
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => haystack.includes(word));
};

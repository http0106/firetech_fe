import type { CategoryKey, Role, StandardKey } from '../types';

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
    { key: 'binh-chua-chay', label: 'Bình chữa cháy' },
    { key: 'bao-chay', label: 'Hệ thống báo cháy' },
    { key: 'voi-tru', label: 'Vòi, lăng & tủ chữa cháy' },
    { key: 'bao-ho', label: 'Bảo hộ & thoát hiểm' },
    { key: 'den-exit', label: 'Đèn Exit & sự cố' },
];

export const categoryLabel = (key: CategoryKey) =>
    CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const STANDARDS: { key: StandardKey; label: string }[] = [
    { key: 'bca', label: 'Tem kiểm định Bộ Công an' },
    { key: 'coco', label: 'Đầy đủ chứng chỉ CO/CQ' },
    { key: 'tcvn', label: 'Đạt chuẩn TCVN / ISO' },
    { key: 'nhap-khau', label: 'Hàng nhập khẩu chính hãng' },
];

export const PRICE_RANGES = [
    { key: 'lt500', label: 'Dưới 500.000đ', min: 0, max: 500_000 },
    { key: '500-2m', label: '500.000đ – 2.000.000đ', min: 500_000, max: 2_000_000 },
    { key: '2m-5m', label: '2.000.000đ – 5.000.000đ', min: 2_000_000, max: 5_000_000 },
    { key: 'gt5m', label: 'Trên 5.000.000đ', min: 5_000_000, max: Infinity },
];

export const ROLE_LABELS: Record<Role, string> = {
    admin: 'Quản trị viên',
    customer: 'Khách hàng',
    sales: 'Kinh doanh / Tư vấn',
    technician: 'Kỹ thuật & Bảo trì',
    accountant: 'Kế toán',
};

export const ROLE_COLORS: Record<Role, string> = {
    admin: 'red',
    customer: 'default',
    sales: 'blue',
    technician: 'orange',
    accountant: 'green',
};

/* =====================================================================
 * PHÂN QUYỀN — chỉ dựa vào VAI TRÒ, không có quyền riêng từng người.
 *
 * Danh sách trang trong /portal mà mỗi vai trò được mở.
 * Tên trang = phần sau "/portal/", ví dụ 'chat' là /portal/chat.
 * Trang Tổng quan (/portal) và Hồ sơ (/portal/profile): nhân viên nào cũng mở được.
 * Muốn cho vai trò nào thêm/bớt trang → chỉ cần sửa danh sách dưới đây.
 * ===================================================================== */
export const ROLE_PAGES: Record<Role, string[]> = {
    admin: ['chat', 'quotes', 'orders', 'reviews', 'projects', 'schedule', 'invoices', 'reports', 'products', 'documents', 'users', 'settings'],
    sales: ['chat', 'quotes', 'orders', 'reviews', 'projects'],
    technician: ['projects', 'schedule'],
    accountant: ['orders', 'invoices', 'reports'],
    customer: [],
};

/** Vai trò này có được mở trang nội bộ `page` không? */
export const canOpen = (role: Role, page: string) =>
    page === '' || page === 'profile' || ROLE_PAGES[role].includes(page);

/** Trang chính sau khi đăng nhập: khách hàng → /account, nhân viên → /portal. */
export const homePathOf = (user: { role: Role }) => (user.role === 'customer' ? '/account' : '/portal');

type StatusMap = Record<string, { label: string; color: string }>;

export const ORDER_STATUS: StatusMap = {
    pending: { label: 'Chờ xác nhận', color: 'gold' },
    confirmed: { label: 'Đã xác nhận', color: 'blue' },
    shipping: { label: 'Đang giao', color: 'cyan' },
    completed: { label: 'Hoàn thành', color: 'green' },
    cancelled: { label: 'Đã hủy', color: 'default' },
};

export const QUOTE_STATUS: StatusMap = {
    new: { label: 'Mới', color: 'red' },
    processing: { label: 'Đang xử lý', color: 'blue' },
    sent: { label: 'Đã gửi báo giá', color: 'purple' },
    accepted: { label: 'Khách đồng ý', color: 'green' },
    rejected: { label: 'Khách từ chối', color: 'default' },
};

export const WORK_STATUS: StatusMap = {
    pending: { label: 'Chờ thực hiện', color: 'gold' },
    in_progress: { label: 'Đang thực hiện', color: 'blue' },
    done: { label: 'Hoàn thành', color: 'green' },
    cancelled: { label: 'Đã hủy', color: 'default' },
};

export const WORK_TYPE: StatusMap = {
    install: { label: 'Lắp đặt', color: 'geekblue' },
    maintenance: { label: 'Bảo trì định kỳ', color: 'orange' },
    repair: { label: 'Sửa chữa', color: 'volcano' },
    inspection: { label: 'Kiểm tra', color: 'cyan' },
};

export const PROJECT_STATUS: StatusMap = {
    surveying: { label: 'Đang khảo sát', color: 'purple' },
    installing: { label: 'Đang thi công', color: 'blue' },
    active: { label: 'Đã bàn giao', color: 'green' },
    paused: { label: 'Tạm dừng', color: 'default' },
};

export const LOG_RESULT: StatusMap = {
    ok: { label: 'Hoạt động tốt', color: 'green' },
    replaced: { label: 'Đã thay thế / nạp lại', color: 'blue' },
    issue: { label: 'Cần xử lý thêm', color: 'red' },
};

export const INVOICE_STATUS: StatusMap = {
    unpaid: { label: 'Chưa thanh toán', color: 'gold' },
    partial: { label: 'Thanh toán một phần', color: 'blue' },
    paid: { label: 'Đã thanh toán', color: 'green' },
    overdue: { label: 'Quá hạn', color: 'red' },
};

export const DOC_TYPES: StatusMap = {
    guide: { label: 'Hướng dẫn sử dụng', color: 'red' },
    checklist: { label: 'Checklist kiểm tra', color: 'orange' },
    standard: { label: 'Tiêu chuẩn kỹ thuật', color: 'blue' },
    regulation: { label: 'Văn bản pháp quy', color: 'purple' },
};

export const SERVICE_OPTIONS = [
    'Tư vấn & thiết kế hệ thống PCCC',
    'Thẩm duyệt hồ sơ PCCC',
    'Thi công lắp đặt',
    'Nghiệm thu & cấp phép',
    'Bảo trì / sửa chữa',
    'Nạp sạc bình chữa cháy',
    'Huấn luyện nghiệp vụ PCCC',
];

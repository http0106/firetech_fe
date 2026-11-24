/**
 * Kiểu dữ liệu dùng chung cho toàn bộ ứng dụng FireTech.
 * Khi có backend thật, các interface này chính là "hợp đồng" dữ liệu với API.
 */

/**
 * 5 vai trò có tài khoản. Khách vãng lai = chưa đăng nhập (user = null).
 * Vai trò quyết định được vào trang nào — xem ROLE_PAGES trong data/constants.ts.
 */
export type Role = 'admin' | 'customer' | 'sales' | 'technician' | 'accountant';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    /** Chỉ dùng cho bản demo — backend thật phải băm mật khẩu. */
    password: string;
    role: Role;
    /** Chức danh hiển thị, ví dụ "Tư vấn viên", "Kỹ thuật bảo trì". */
    position?: string;
    /** active = đang dùng · pending = nhân viên tự đăng ký, chờ Admin duyệt · locked = bị khóa */
    status: 'active' | 'pending' | 'locked';
    createdAt: string;
    customerType?: 'personal' | 'business';
    company?: string;
    taxCode?: string;
    address?: string;
    /** Mã công trình khách khai báo khi đăng ký, chờ CSKH xác minh để liên kết. */
    pendingProjectCode?: string;
}

export type CategoryKey = 'binh-chua-chay' | 'bao-chay' | 'voi-tru' | 'bao-ho' | 'den-exit';
export type StandardKey = 'bca' | 'coco' | 'tcvn' | 'nhap-khau';

export interface Product {
    id: string;
    code: string;
    name: string;
    category: CategoryKey;
    brand: string;
    price: number;
    oldPrice?: number;
    stock: number;
    standards: StandardKey[];
    warrantyMonths: number;
    /** Để trống → hiển thị ảnh minh họa theo danh mục. */
    image?: string;
    description: string;
    specs: { label: string; value: string }[];
    featured?: boolean;
}

export type WorkType = 'install' | 'maintenance' | 'repair' | 'inspection';

export interface ProjectDevice {
    productId: string;
    quantity: number;
    location: string;
    installedAt: string;
    warrantyUntil: string;
}

export interface MaintenanceLog {
    id: string;
    date: string;
    technicianId: string;
    type: WorkType;
    note: string;
    result: 'ok' | 'replaced' | 'issue';
}

/** Công trình đã/đang thi công cho khách hàng. */
export interface Project {
    id: string;
    code: string;
    name: string;
    customerId: string;
    address: string;
    buildingType: string;
    status: 'surveying' | 'installing' | 'active' | 'paused';
    startedAt: string;
    handoverAt?: string;
    maintenanceCycleMonths: number;
    nextMaintenance: string;
    salesId: string;
    technicianIds: string[];
    devices: ProjectDevice[];
    logs: MaintenanceLog[];
}

/** Phiếu công việc giao cho kỹ thuật viên. */
export interface WorkOrder {
    id: string;
    code: string;
    projectId: string;
    technicianId: string;
    type: WorkType;
    date: string;
    status: 'pending' | 'in_progress' | 'done' | 'cancelled';
    note: string;
    report?: string;
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    code: string;
    customerId: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
    paymentMethod: 'cod' | 'transfer';
    shippingAddress: string;
    note?: string;
    createdAt: string;
}

export interface QuoteItem {
    productId: string;
    quantity: number;
    /** Đơn giá do nhân viên kinh doanh chào (có thể khác giá niêm yết). */
    price?: number;
}

export interface Quote {
    id: string;
    code: string;
    customerId?: string;
    contactName: string;
    phone: string;
    email?: string;
    company?: string;
    kind: 'product' | 'service';
    service?: string;
    projectId?: string;
    items: QuoteItem[];
    message: string;
    status: 'new' | 'processing' | 'sent' | 'accepted' | 'rejected';
    salesId?: string;
    amount?: number;
    salesNote?: string;
    validUntil?: string;
    createdAt: string;
}

export interface Invoice {
    id: string;
    code: string;
    customerId: string;
    refType: 'order' | 'project';
    refId: string;
    description: string;
    amount: number;
    paidAmount: number;
    issuedAt: string;
    dueDate: string;
}

export interface Review {
    id: string;
    userId?: string;
    userName: string;
    targetType: 'product' | 'service';
    /** productId hoặc projectId */
    targetId: string;
    rating: number;
    comment: string;
    createdAt: string;
    reply?: string;
    hidden?: boolean;
}

export interface DocItem {
    id: string;
    title: string;
    type: 'guide' | 'checklist' | 'standard' | 'regulation';
    category?: CategoryKey;
    summary: string;
    steps: string[];
    updatedAt: string;
}

export interface ChatMessage {
    id: string;
    from: 'customer' | 'staff' | 'bot';
    senderName: string;
    text: string;
    at: string;
}

export interface ChatThread {
    id: string;
    customerId?: string;
    guestName: string;
    guestPhone?: string;
    assignedTo?: string;
    messages: ChatMessage[];
    status: 'open' | 'closed';
    unreadByStaff: number;
    unreadByCustomer: number;
    updatedAt: string;
}

export interface Settings {
    companyName: string;
    hotline: string;
    zalo: string;
    email: string;
    address: string;
    workingHours: string;
    defaultMaintenanceMonths: number;
}

/**
 * Toàn bộ dữ liệu của app = dữ liệu backend sẽ trả về (mỗi trường là 1 bảng / 1 đường dẫn API).
 * Chưa có backend thì lấy từ src/data/seed.ts.
 */
export interface Db {
    users: User[];
    products: Product[];
    projects: Project[];
    workOrders: WorkOrder[];
    orders: Order[];
    quotes: Quote[];
    invoices: Invoice[];
    reviews: Review[];
    documents: DocItem[];
    chats: ChatThread[];
    settings: Settings;
}

import type { ChatThread, Db, DocItem, Invoice, Order, Project, Quote, Review, User, WorkOrder } from '../types';
import { addDays, addMonths, daysFromNow, hoursAgo } from '../utils';
import { PRODUCTS } from './products';

/**
 * DỮ LIỆU BAN ĐẦU CỦA APP (thay cho database).
 * App đọc thẳng từ file này mỗi lần mở / tải lại trang — sửa ở đây là thấy ngay.
 * Ngày tháng tính tương đối theo hôm nay (daysFromNow) nên lịch bảo trì, hóa đơn quá hạn...
 * luôn "đúng thời điểm" khi mở app.
 *
 * Sản phẩm nằm riêng ở products.ts. Tài khoản demo (mật khẩu chung 123456): xem DEMO_ACCOUNTS.
 */

const PASSWORD = '123456';

const users: User[] = [
    {
        id: 'u-admin', name: 'Vũ Quang Huy', email: 'admin@firetech.vn', phone: '0962254523', password: PASSWORD,
        role: 'admin', position: 'Quản trị hệ thống', status: 'active',
        createdAt: daysFromNow(-900),
    },
    {
        id: 'u-sales1', name: 'Nguyễn Thu Hà', email: 'tuvan@firetech.vn', phone: '0904111222', password: PASSWORD,
        role: 'sales', position: 'Tư vấn viên', status: 'active',
        createdAt: daysFromNow(-600),
    },
    {
        id: 'u-sales2', name: 'Lê Minh Quân', email: 'kinhdoanh@firetech.vn', phone: '0904333444', password: PASSWORD,
        role: 'sales', position: 'Nhân viên kinh doanh dự án', status: 'active',
        createdAt: daysFromNow(-420),
    },
    {
        id: 'u-tech1', name: 'Trần Văn Hùng', email: 'kythuat@firetech.vn', phone: '0912555666', password: PASSWORD,
        role: 'technician', position: 'Kỹ thuật lắp đặt', status: 'active',
        createdAt: daysFromNow(-800),
    },
    {
        id: 'u-tech2', name: 'Phạm Đức Long', email: 'baotri@firetech.vn', phone: '0912777888', password: PASSWORD,
        role: 'technician', position: 'Kỹ thuật bảo trì', status: 'active',
        createdAt: daysFromNow(-500),
    },
    {
        id: 'u-acc', name: 'Đỗ Thị Mai', email: 'ketoan@firetech.vn', phone: '0913999000', password: PASSWORD,
        role: 'accountant', position: 'Kế toán', status: 'active',
        createdAt: daysFromNow(-700),
    },
    {
        id: 'u-cus1', name: 'Nguyễn Văn Bình', email: 'khachhang@gmail.com', phone: '0988123456', password: PASSWORD,
        role: 'customer', status: 'active', createdAt: daysFromNow(-400),
        customerType: 'business', company: 'Công ty TNHH May Hưng Thịnh', taxCode: '0901234567',
        address: 'KCN Phố Nối A, Văn Lâm, Hưng Yên',
    },
    {
        id: 'u-cus2', name: 'Trần Thị Lan', email: 'lan.tran@gmail.com', phone: '0977222333', password: PASSWORD,
        role: 'customer', status: 'active', createdAt: daysFromNow(-160),
        customerType: 'personal', address: 'Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    },
    {
        id: 'u-cus3', name: 'Hoàng Minh Tuấn', email: 'hotay.hotel@gmail.com', phone: '0243888999', password: PASSWORD,
        role: 'customer', status: 'active', createdAt: daysFromNow(-720),
        customerType: 'business', company: 'Khách sạn Hồ Tây', taxCode: '0102345678',
        address: 'Số 18 Quảng An, Tây Hồ, Hà Nội',
    },
    {
        id: 'u-cus4', name: 'Đặng Quốc Việt', email: 'logistics.donganh@gmail.com', phone: '0966444555', password: PASSWORD,
        role: 'customer', status: 'active', createdAt: daysFromNow(-560),
        customerType: 'business', company: 'Công ty CP Logistics Đông Anh', taxCode: '0108765432',
        address: 'Xã Uy Nỗ, Đông Anh, Hà Nội', pendingProjectCode: 'CT-2022-077',
    },
];

/** Tài khoản dùng thử hiện ở trang đăng nhập (mật khẩu 123456). */
export const DEMO_ACCOUNTS = [
    { label: 'Khách hàng (doanh nghiệp)', email: 'khachhang@gmail.com', staff: false },
    { label: 'Khách hàng (cá nhân)', email: 'lan.tran@gmail.com', staff: false },
    { label: 'Quản trị viên', email: 'admin@firetech.vn', staff: true },
    { label: 'Tư vấn viên', email: 'tuvan@firetech.vn', staff: true },
    { label: 'Kỹ thuật bảo trì', email: 'baotri@firetech.vn', staff: true },
    { label: 'Kế toán', email: 'ketoan@firetech.vn', staff: true },
];

const device = (productId: string, quantity: number, location: string, installedDaysAgo: number, warrantyMonths: number) => {
    const installedAt = daysFromNow(-installedDaysAgo);
    return { productId, quantity, location, installedAt, warrantyUntil: addMonths(installedAt, warrantyMonths) };
};

const projects: Project[] = [
    {
        id: 'pj1', code: 'CT-2024-018', name: 'Nhà xưởng May Hưng Thịnh', customerId: 'u-cus1',
        address: 'KCN Phố Nối A, Văn Lâm, Hưng Yên', buildingType: 'Nhà xưởng sản xuất 2 tầng',
        status: 'active', startedAt: daysFromNow(-380), handoverAt: daysFromNow(-357),
        maintenanceCycleMonths: 6, nextMaintenance: daysFromNow(9), salesId: 'u-sales2', technicianIds: ['u-tech1', 'u-tech2'],
        devices: [
            device('p3', 40, 'Xưởng A, B — mỗi cột 1 bình', 357, 12),
            device('p5', 4, 'Kho nguyên liệu', 357, 12),
            device('p22', 1, 'Phòng bảo vệ', 357, 24),
            device('p20', 36, 'Trần xưởng A, B', 357, 24),
            device('p18', 14, 'Lối thoát nạn', 357, 12),
        ],
        logs: [
            { id: 'l1', date: daysFromNow(-357), technicianId: 'u-tech1', type: 'install', result: 'ok', note: 'Lắp đặt hoàn thiện, bàn giao 40 bình bột, 36 đầu báo khói, tủ trung tâm 10 kênh.' },
            { id: 'l2', date: daysFromNow(-174), technicianId: 'u-tech2', type: 'maintenance', result: 'replaced', note: 'Kiểm tra áp suất 40 bình, nạp lại 3 bình tụt áp tại xưởng B. Vệ sinh đầu báo.' },
            { id: 'l3', date: daysFromNow(-90), technicianId: 'u-tech1', type: 'repair', result: 'replaced', note: 'Thay 2 đầu báo khói tầng 2 xưởng A bị báo giả do bụi vải.' },
        ],
    },
    {
        id: 'pj2', code: 'CT-2025-004', name: 'Văn phòng May Hưng Thịnh – Hà Nội', customerId: 'u-cus1',
        address: 'Tầng 5, 72 Trần Đăng Ninh, Cầu Giấy, Hà Nội', buildingType: 'Văn phòng 400 m²',
        status: 'active', startedAt: daysFromNow(-210), handoverAt: daysFromNow(-200),
        maintenanceCycleMonths: 12, nextMaintenance: daysFromNow(165), salesId: 'u-sales1', technicianIds: ['u-tech1'],
        devices: [
            device('p6', 6, 'Phòng server, tủ điện', 200, 12),
            device('p3', 8, 'Hành lang, pantry', 200, 12),
            device('p18', 12, 'Lối thoát nạn', 200, 12),
        ],
        logs: [
            { id: 'l4', date: daysFromNow(-200), technicianId: 'u-tech1', type: 'install', result: 'ok', note: 'Lắp đặt và hướng dẫn nhân viên văn phòng sử dụng bình CO2.' },
        ],
    },
    {
        id: 'pj3', code: 'CT-2023-031', name: 'Khách sạn Hồ Tây', customerId: 'u-cus3',
        address: 'Số 18 Quảng An, Tây Hồ, Hà Nội', buildingType: 'Khách sạn 9 tầng, 64 phòng',
        status: 'active', startedAt: daysFromNow(-730), handoverAt: daysFromNow(-700),
        maintenanceCycleMonths: 3, nextMaintenance: daysFromNow(-5), salesId: 'u-sales1', technicianIds: ['u-tech2'],
        devices: [
            device('p3', 36, 'Hành lang các tầng', 700, 12),
            device('p9', 64, 'Mỗi phòng nghỉ', 280, 6),
            device('p20', 80, 'Phòng nghỉ, hành lang', 700, 24),
            device('p19', 30, 'Cầu thang bộ', 700, 12),
            device('p13', 9, 'Tủ PCCC mỗi tầng', 700, 12),
        ],
        logs: [
            { id: 'l5', date: daysFromNow(-700), technicianId: 'u-tech1', type: 'install', result: 'ok', note: 'Thi công hệ thống báo cháy và trang bị bình chữa cháy toàn tòa nhà.' },
            { id: 'l6', date: daysFromNow(-280), technicianId: 'u-tech1', type: 'maintenance', result: 'replaced', note: 'Thay mới 64 mặt nạ phòng độc hết hạn.' },
            { id: 'l7', date: daysFromNow(-185), technicianId: 'u-tech2', type: 'maintenance', result: 'ok', note: 'Thử nghiệm toàn bộ đầu báo, chuông, nút ấn. Hệ thống hoạt động tốt.' },
            { id: 'l8', date: daysFromNow(-95), technicianId: 'u-tech2', type: 'maintenance', result: 'issue', note: 'Ắc quy dự phòng tủ trung tâm yếu — đã báo khách, chờ duyệt thay.' },
        ],
    },
    {
        id: 'pj4', code: 'CT-2025-019', name: 'Nhà phố chị Lan', customerId: 'u-cus2',
        address: 'Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội', buildingType: 'Nhà ở riêng lẻ 5 tầng',
        status: 'installing', startedAt: daysFromNow(-6),
        maintenanceCycleMonths: 12, nextMaintenance: daysFromNow(360), salesId: 'u-sales1', technicianIds: ['u-tech1'],
        devices: [
            device('p2', 3, 'Bếp, phòng khách, tầng tum', 0, 12),
            device('p10', 1, 'Bếp', 0, 12),
            device('p9', 5, 'Các phòng ngủ', 0, 6),
            device('p11', 1, 'Ban công tầng 3', 0, 12),
        ],
        logs: [],
    },
    {
        id: 'pj5', code: 'CT-2024-052', name: 'Kho hàng Đông Anh', customerId: 'u-cus4',
        address: 'Xã Uy Nỗ, Đông Anh, Hà Nội', buildingType: 'Kho logistics 3.000 m²',
        status: 'active', startedAt: daysFromNow(-560), handoverAt: daysFromNow(-540),
        maintenanceCycleMonths: 6, nextMaintenance: daysFromNow(3), salesId: 'u-sales2', technicianIds: ['u-tech2'],
        devices: [
            device('p4', 30, 'Dọc các dãy kệ', 540, 12),
            device('p5', 6, 'Khu xuất nhập hàng', 540, 12),
            device('p16', 8, 'Tường kho', 540, 24),
            device('p14', 8, 'Trụ nước ngoài nhà', 540, 12),
        ],
        logs: [
            { id: 'l9', date: daysFromNow(-540), technicianId: 'u-tech1', type: 'install', result: 'ok', note: 'Bàn giao hệ thống chữa cháy vách tường và bình xe đẩy.' },
            { id: 'l10', date: daysFromNow(-357), technicianId: 'u-tech2', type: 'maintenance', result: 'ok', note: 'Kiểm tra áp lực nước họng vách tường đạt yêu cầu.' },
            { id: 'l11', date: daysFromNow(-179), technicianId: 'u-tech1', type: 'maintenance', result: 'replaced', note: 'Nạp lại 5 bình 8kg, thay 2 cuộn vòi D65 bị nứt.' },
        ],
    },
];

const workOrders: WorkOrder[] = [
    { id: 'w1', code: 'CV-1021', projectId: 'pj3', technicianId: 'u-tech2', type: 'maintenance', date: daysFromNow(0), status: 'pending', note: 'Bảo trì quý — đã quá hạn 5 ngày, ưu tiên. Mang ắc quy dự phòng thay cho tủ trung tâm.' },
    { id: 'w2', code: 'CV-1022', projectId: 'pj4', technicianId: 'u-tech1', type: 'install', date: daysFromNow(0), status: 'in_progress', note: 'Lắp đặt thiết bị nhà phố, hướng dẫn gia đình sử dụng thang dây.' },
    { id: 'w3', code: 'CV-1023', projectId: 'pj5', technicianId: 'u-tech2', type: 'maintenance', date: daysFromNow(3), status: 'pending', note: 'Bảo trì 6 tháng: kiểm tra áp lực nước, 30 bình 8kg.' },
    { id: 'w4', code: 'CV-1024', projectId: 'pj1', technicianId: 'u-tech2', type: 'maintenance', date: daysFromNow(9), status: 'pending', note: 'Bảo trì 6 tháng: 40 bình bột, hệ thống báo cháy. Lưu ý khu xưởng B từng tụt áp.' },
    { id: 'w5', code: 'CV-1020', projectId: 'pj2', technicianId: 'u-tech1', type: 'inspection', date: daysFromNow(2), status: 'pending', note: 'Kiểm tra theo yêu cầu: khách báo đèn Exit tầng 5 không sáng.' },
    { id: 'w6', code: 'CV-1019', projectId: 'pj1', technicianId: 'u-tech1', type: 'repair', date: daysFromNow(-90), status: 'done', note: 'Xử lý báo giả tầng 2 xưởng A.', report: 'Thay 2 đầu báo khói.' },
    { id: 'w7', code: 'CV-1018', projectId: 'pj3', technicianId: 'u-tech2', type: 'maintenance', date: daysFromNow(-95), status: 'done', note: 'Bảo trì quý.', report: 'Ắc quy tủ trung tâm yếu.' },
];

const price = (id: string) => PRODUCTS.find((p) => p.id === id)?.price ?? 0;

const makeOrder = (
    n: number, customerId: string, items: [string, number][], daysAgo: number, status: Order['status'],
): Order => {
    const lines = items.map(([productId, quantity]) => ({ productId, quantity, price: price(productId) }));
    return {
        id: `o${n}`, code: `DH-${2400 + n}`, customerId, items: lines,
        total: lines.reduce((s, l) => s + l.price * l.quantity, 0),
        status, paymentMethod: n % 2 ? 'transfer' : 'cod',
        shippingAddress: users.find((u) => u.id === customerId)?.address ?? '',
        createdAt: daysFromNow(-daysAgo),
    };
};

const orders: Order[] = [
    makeOrder(1, 'u-cus2', [['p2', 2], ['p10', 1]], 1, 'pending'),
    makeOrder(2, 'u-cus1', [['p3', 20]], 12, 'confirmed'),
    makeOrder(3, 'u-cus3', [['p18', 10], ['p19', 6]], 25, 'shipping'),
    makeOrder(4, 'u-cus4', [['p4', 10], ['p6', 4]], 40, 'completed'),
    makeOrder(5, 'u-cus3', [['p6', 8]], 47, 'completed'),
    makeOrder(6, 'u-cus1', [['p13', 5], ['p15', 5]], 55, 'completed'),
    makeOrder(7, 'u-cus2', [['p9', 4]], 70, 'completed'),
    makeOrder(8, 'u-cus3', [['p3', 15], ['p6', 5]], 85, 'completed'),
    makeOrder(9, 'u-cus4', [['p16', 2], ['p22', 1]], 100, 'completed'),
    makeOrder(10, 'u-cus1', [['p5', 2], ['p8', 1]], 115, 'completed'),
    makeOrder(11, 'u-cus3', [['p20', 6], ['p23', 2]], 130, 'completed'),
    makeOrder(12, 'u-cus4', [['p3', 30]], 150, 'completed'),
    makeOrder(13, 'u-cus2', [['p1', 1], ['p12', 2]], 160, 'cancelled'),
    makeOrder(14, 'u-cus1', [['p17', 2], ['p13', 4]], 172, 'completed'),
];

let invoiceNo = 500;
const invoices: Invoice[] = [
    ...orders
        .filter((o) => ['confirmed', 'shipping', 'completed'].includes(o.status))
        .map((o): Invoice => {
            invoiceNo += 1;
            return {
                id: `i-${o.id}`, code: `HD-${invoiceNo}`, customerId: o.customerId, refType: 'order', refId: o.id,
                description: `Đơn hàng ${o.code}`, amount: o.total,
                paidAmount: o.status === 'completed' ? o.total : 0,
                issuedAt: o.createdAt, dueDate: addDays(o.createdAt, 30),
            };
        }),
    { id: 'i-p1', code: 'HD-480', customerId: 'u-cus1', refType: 'project', refId: 'pj1', description: 'Phí bảo trì 6 tháng – CT-2024-018', amount: 6_800_000, paidAmount: 6_800_000, issuedAt: daysFromNow(-174), dueDate: daysFromNow(-144) },
    { id: 'i-p2', code: 'HD-470', customerId: 'u-cus1', refType: 'project', refId: 'pj2', description: 'Thi công PCCC văn phòng – CT-2025-004', amount: 32_000_000, paidAmount: 32_000_000, issuedAt: daysFromNow(-160), dueDate: daysFromNow(-130) },
    { id: 'i-p3', code: 'HD-490', customerId: 'u-cus3', refType: 'project', refId: 'pj3', description: 'Phí bảo trì quý – CT-2023-031', amount: 4_200_000, paidAmount: 4_200_000, issuedAt: daysFromNow(-95), dueDate: daysFromNow(-65) },
    { id: 'i-p4', code: 'HD-515', customerId: 'u-cus3', refType: 'project', refId: 'pj3', description: 'Thay ắc quy tủ trung tâm – CT-2023-031', amount: 2_600_000, paidAmount: 0, issuedAt: daysFromNow(-40), dueDate: daysFromNow(-10) },
    { id: 'i-p5', code: 'HD-485', customerId: 'u-cus4', refType: 'project', refId: 'pj5', description: 'Phí bảo trì 6 tháng – CT-2024-052', amount: 5_500_000, paidAmount: 5_500_000, issuedAt: daysFromNow(-179), dueDate: daysFromNow(-149) },
    { id: 'i-p6', code: 'HD-520', customerId: 'u-cus2', refType: 'project', refId: 'pj4', description: 'Thi công PCCC nhà phố – CT-2025-019 (đợt 1)', amount: 18_500_000, paidAmount: 9_250_000, issuedAt: daysFromNow(-6), dueDate: daysFromNow(24) },
];

const quotes: Quote[] = [
    { id: 'q1', code: 'BG-301', contactName: 'Anh Tuấn', phone: '0912345678', company: 'Trường mầm non Hoa Sen', kind: 'service', service: 'Tư vấn & thiết kế hệ thống PCCC', items: [], message: 'Cần tư vấn hệ thống báo cháy cho trường 3 tầng, mỗi tầng khoảng 300 m².', status: 'new', createdAt: daysFromNow(-1) },
    { id: 'q2', code: 'BG-302', customerId: 'u-cus1', contactName: 'Nguyễn Văn Bình', phone: '0988123456', company: 'Công ty TNHH May Hưng Thịnh', kind: 'service', service: 'Bảo trì / sửa chữa', projectId: 'pj1', items: [], message: 'Bình chữa cháy khu xưởng B có hiện tượng tụt áp, nhờ kỹ thuật kiểm tra sớm.', status: 'new', createdAt: daysFromNow(0) },
    { id: 'q3', code: 'BG-300', customerId: 'u-cus2', contactName: 'Trần Thị Lan', phone: '0977222333', kind: 'product', items: [{ productId: 'p6', quantity: 1, price: 430_000 }, { productId: 'p18', quantity: 2, price: 140_000 }], message: 'Báo giá giúp em bình CO2 và đèn Exit cho tầng 1.', status: 'sent', salesId: 'u-sales1', amount: 710_000, salesNote: 'Đã áp dụng chiết khấu 5% cho khách đang thi công.', validUntil: daysFromNow(10), createdAt: daysFromNow(-4) },
    { id: 'q4', code: 'BG-299', contactName: 'Chị Hoa', phone: '0936888111', company: 'Nhà hàng Sen Vàng', kind: 'product', items: [{ productId: 'p3', quantity: 10 }, { productId: 'p10', quantity: 3 }, { productId: 'p21', quantity: 4 }], message: 'Nhà hàng 2 tầng cần trang bị đủ để kiểm tra PCCC.', status: 'processing', salesId: 'u-sales2', createdAt: daysFromNow(-6) },
    { id: 'q5', code: 'BG-295', contactName: 'Anh Dũng', phone: '0909555777', kind: 'product', items: [{ productId: 'p16', quantity: 1, price: 1_200_000 }], message: 'Tủ PCCC trong nhà.', status: 'accepted', salesId: 'u-sales1', amount: 1_200_000, validUntil: daysFromNow(-6), createdAt: daysFromNow(-20) },
    { id: 'q6', code: 'BG-290', customerId: 'u-cus4', contactName: 'Đặng Quốc Việt', phone: '0966444555', company: 'Công ty CP Logistics Đông Anh', kind: 'product', items: [{ productId: 'p4', quantity: 20, price: 400_000 }], message: 'Bổ sung bình cho kho mới.', status: 'rejected', salesId: 'u-sales2', amount: 8_000_000, validUntil: daysFromNow(-20), createdAt: daysFromNow(-35) },
];

const reviews: Review[] = [
    { id: 'r1', userId: 'u-cus1', userName: 'Nguyễn Văn Bình', targetType: 'service', targetId: 'pj1', rating: 5, comment: 'Đội kỹ thuật đến đúng giờ, bảo trì kỹ, có biên bản rõ ràng từng bình.', createdAt: daysFromNow(-170), reply: 'Cảm ơn anh Bình và Công ty May Hưng Thịnh đã tin tưởng FireTech!' },
    { id: 'r2', userId: 'u-cus3', userName: 'Hoàng Minh Tuấn', targetType: 'service', targetId: 'pj3', rating: 4, comment: 'Bảo trì tốt, kỹ thuật nhiệt tình. Mong lịch hẹn ổn định hơn.', createdAt: daysFromNow(-90) },
    { id: 'r3', userId: 'u-cus2', userName: 'Trần Thị Lan', targetType: 'product', targetId: 'p2', rating: 5, comment: 'Bình nhỏ gọn, có tem kiểm định, giao trong ngày.', createdAt: daysFromNow(-60) },
    { id: 'r4', userId: 'u-cus4', userName: 'Đặng Quốc Việt', targetType: 'product', targetId: 'p3', rating: 5, comment: 'Giá tốt khi mua số lượng lớn, đủ CO/CQ để làm hồ sơ.', createdAt: daysFromNow(-140) },
    { id: 'r5', userName: 'Minh Anh', targetType: 'product', targetId: 'p18', rating: 4, comment: 'Đèn sáng rõ, lắp đặt dễ.', createdAt: daysFromNow(-30) },
    { id: 'r6', userId: 'u-cus1', userName: 'Nguyễn Văn Bình', targetType: 'product', targetId: 'p13', rating: 4, comment: 'Vòi chắc chắn, đúng thông số.', createdAt: daysFromNow(-50) },
    { id: 'r7', userId: 'u-cus3', userName: 'Hoàng Minh Tuấn', targetType: 'product', targetId: 'p6', rating: 5, comment: 'Bình CO2 chất lượng, nhân viên hướng dẫn dùng rất kỹ.', createdAt: daysFromNow(-44) },
    { id: 'r8', userId: 'u-cus4', userName: 'Đặng Quốc Việt', targetType: 'service', targetId: 'pj5', rating: 5, comment: 'Thay vòi hỏng nhanh, báo giá minh bạch.', createdAt: daysFromNow(-175) },
];

const chats: ChatThread[] = [
    {
        id: 'c1', guestName: 'Anh Tuấn', guestPhone: '0912345678', assignedTo: 'u-sales1', status: 'open',
        unreadByStaff: 1, unreadByCustomer: 0, updatedAt: hoursAgo(3),
        messages: [
            { id: 'm1', from: 'customer', senderName: 'Anh Tuấn', text: 'Chào shop, mình cần tư vấn hệ thống báo cháy cho trường mầm non 3 tầng.', at: hoursAgo(26) },
            { id: 'm2', from: 'staff', senderName: 'Nguyễn Thu Hà', text: 'Dạ em chào anh. Anh cho em xin diện tích mỗi tầng và số phòng học để em tư vấn ạ.', at: hoursAgo(25) },
            { id: 'm3', from: 'customer', senderName: 'Anh Tuấn', text: 'Mỗi tầng khoảng 300 m², 6 phòng học và 1 bếp ăn.', at: hoursAgo(3) },
        ],
    },
    {
        id: 'c2', customerId: 'u-cus2', guestName: 'Trần Thị Lan', guestPhone: '0977222333', status: 'open',
        unreadByStaff: 1, unreadByCustomer: 0, updatedAt: hoursAgo(1),
        messages: [
            { id: 'm4', from: 'customer', senderName: 'Trần Thị Lan', text: 'Bình bột 2kg có dùng được cho cháy bếp gas không ạ?', at: hoursAgo(1) },
        ],
    },
    {
        id: 'c3', customerId: 'u-cus1', guestName: 'Nguyễn Văn Bình', guestPhone: '0988123456', assignedTo: 'u-sales2', status: 'closed',
        unreadByStaff: 0, unreadByCustomer: 0, updatedAt: hoursAgo(120),
        messages: [
            { id: 'm5', from: 'customer', senderName: 'Nguyễn Văn Bình', text: 'Cho mình hỏi lịch bảo trì xưởng tháng này?', at: hoursAgo(122) },
            { id: 'm6', from: 'staff', senderName: 'Lê Minh Quân', text: 'Dạ anh có thể xem trực tiếp trong mục "Công trình của tôi" ạ. Kỹ thuật sẽ gọi xác nhận trước 2 ngày.', at: hoursAgo(120) },
        ],
    },
];

const documents: DocItem[] = [
    {
        id: 'd1', type: 'guide', category: 'binh-chua-chay', updatedAt: daysFromNow(-12),
        title: 'Hướng dẫn sử dụng bình chữa cháy bột ABC (quy tắc 4 bước)',
        summary: 'Thao tác chuẩn với bình bột xách tay — áp dụng cho bình 1kg đến 8kg.',
        steps: [
            'Xách bình đến gần đám cháy, đứng ở đầu gió, cách đám cháy 1,5 – 2 m.',
            'Lắc bình vài lần để bột tơi, sau đó rút chốt an toàn.',
            'Một tay cầm vòi, hướng loa phun vào gốc lửa (không phun vào ngọn lửa).',
            'Bóp cò phun và quét qua lại cho đến khi lửa tắt hẳn.',
            'Sau khi dùng, gửi bình đi nạp lại — bình đã phun dù một ít cũng phải nạp lại.',
        ],
    },
    {
        id: 'd2', type: 'guide', category: 'binh-chua-chay', updatedAt: daysFromNow(-30),
        title: 'Sử dụng bình khí CO2 an toàn',
        summary: 'Lưu ý quan trọng để tránh bỏng lạnh và ngạt khí khi dùng bình CO2.',
        steps: [
            'Ngắt điện khu vực cháy nếu có thể.',
            'Rút chốt, cầm vào tay cầm cách nhiệt — không cầm trực tiếp vào loa phun (nhiệt độ rất thấp, gây bỏng lạnh).',
            'Hướng loa vào gốc lửa, bóp cò và phun dứt điểm.',
            'Trong phòng kín, rời khỏi phòng ngay sau khi dập lửa và thông gió trước khi quay lại.',
        ],
    },
    {
        id: 'd3', type: 'guide', category: 'bao-ho', updatedAt: daysFromNow(-45),
        title: 'Cách dùng chăn chiên dập lửa trong bếp',
        summary: 'Xử lý cháy chảo dầu, cháy nhỏ trong bếp gia đình.',
        steps: [
            'Kéo mạnh hai dây vải để rút chăn ra khỏi túi.',
            'Cầm hai góc chăn, cuộn mép chăn che tay.',
            'Trùm kín đám cháy, đẩy chăn ra xa người.',
            'Tắt bếp, khóa van gas; giữ chăn ít nhất 15 phút cho nguội hẳn.',
        ],
    },
    {
        id: 'd4', type: 'guide', category: 'bao-ho', updatedAt: daysFromNow(-60),
        title: 'Hướng dẫn đeo mặt nạ phòng độc thoát hiểm',
        summary: 'Đeo đúng cách trong 30 giây để thoát qua vùng khói.',
        steps: [
            'Xé túi, lấy mặt nạ và tháo hai nút bịt ở bộ lọc.',
            'Kéo mặt nạ trùm qua đầu, chỉnh dây cho kín cổ.',
            'Thở bình thường, cúi thấp và di chuyển theo đèn Exit ra lối thoát.',
        ],
    },
    {
        id: 'd5', type: 'guide', category: 'voi-tru', updatedAt: daysFromNow(-75),
        title: 'Triển khai vòi & lăng chữa cháy vách tường',
        summary: 'Thao tác 2 người với họng nước chữa cháy trong nhà.',
        steps: [
            'Mở tủ, lấy cuộn vòi và lăng phun.',
            'Lăn vòi theo hướng đám cháy, tránh để vòi bị gập.',
            'Lắp một đầu vòi vào họng nước, đầu còn lại vào lăng phun.',
            'Người cầm lăng ra hiệu, người còn lại mở van họng nước từ từ.',
        ],
    },
    {
        id: 'd6', type: 'checklist', updatedAt: daysFromNow(-20),
        title: 'Checklist tự kiểm tra thiết bị PCCC hằng tháng',
        summary: 'Danh sách việc khách hàng nên tự kiểm tra giữa các kỳ bảo trì.',
        steps: [
            'Kim đồng hồ bình bột nằm trong vùng xanh.',
            'Chốt an toàn và kẹp chì còn nguyên.',
            'Đèn Exit và đèn sự cố sáng khi nhấn nút TEST.',
            'Tủ trung tâm báo cháy không có đèn báo lỗi.',
            'Lối thoát nạn, cửa thoát hiểm không bị khóa hoặc chắn.',
        ],
    },
    {
        id: 'd7', type: 'standard', category: 'binh-chua-chay', updatedAt: daysFromNow(-120),
        title: 'TCVN 7435-2 – Kiểm tra và bảo dưỡng bình chữa cháy xách tay',
        summary: 'Tóm tắt yêu cầu kiểm tra định kỳ bình chữa cháy. Nội dung mang tính tham khảo — đối chiếu văn bản gốc khi lập hồ sơ.',
        steps: [
            'Kiểm tra bên ngoài định kỳ: vỏ bình, đồng hồ áp suất, vòi phun, nhãn.',
            'Bảo dưỡng định kỳ theo khuyến cáo nhà sản xuất và tiêu chuẩn.',
            'Lập sổ theo dõi, ghi ngày kiểm tra và người thực hiện cho từng bình.',
        ],
    },
    {
        id: 'd8', type: 'standard', category: 'bao-chay', updatedAt: daysFromNow(-150),
        title: 'TCVN 5738:2021 – Hệ thống báo cháy tự động',
        summary: 'Tóm tắt yêu cầu thiết kế, lắp đặt hệ thống báo cháy. Nội dung mang tính tham khảo.',
        steps: [
            'Lựa chọn loại đầu báo phù hợp đặc điểm khu vực bảo vệ.',
            'Bố trí nút ấn báo cháy tại lối thoát nạn, chân cầu thang.',
            'Tủ trung tâm đặt nơi có người trực 24/24, có nguồn dự phòng.',
        ],
    },
    {
        id: 'd9', type: 'regulation', updatedAt: daysFromNow(-200),
        title: 'QCVN 06:2022/BXD – An toàn cháy cho nhà và công trình',
        summary: 'Quy chuẩn về lối thoát nạn, ngăn cháy lan, phân loại công trình. Nội dung mang tính tham khảo.',
        steps: [
            'Yêu cầu về số lượng và kích thước lối thoát nạn.',
            'Giải pháp ngăn cháy, chống cháy lan giữa các khoang.',
            'Yêu cầu về hệ thống chiếu sáng sự cố và chỉ dẫn thoát nạn.',
        ],
    },
    {
        id: 'd10', type: 'regulation', updatedAt: daysFromNow(-90),
        title: 'Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ 2024',
        summary: 'Trách nhiệm của chủ cơ sở về PCCC. Nội dung mang tính tham khảo — đối chiếu văn bản gốc.',
        steps: [
            'Trách nhiệm trang bị phương tiện PCCC và duy trì hoạt động.',
            'Tổ chức huấn luyện, diễn tập cho lực lượng PCCC cơ sở.',
            'Kiểm tra, bảo dưỡng phương tiện PCCC định kỳ.',
        ],
    },
];

export const SEED_DATA: Db = {
    users,
    products: PRODUCTS,
    projects,
    workOrders,
    orders,
    quotes,
    invoices,
    reviews,
    documents,
    chats,
    settings: {
        companyName: 'Công ty CP Công nghệ PCCC Fire Tech',
        hotline: '0962.254.523',
        zalo: '0962254523',
        email: 'lienhe@firetech.vn',
        address: 'Số 25 Lê Văn Lương, Thanh Xuân, Hà Nội',
        workingHours: '8:00 – 17:30 (Thứ 2 – Thứ 7) · Cứu hộ 24/7',
        defaultMaintenanceMonths: 6,
    },
};

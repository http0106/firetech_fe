import type { Product } from '../types';

/**
 * DANH SÁCH SẢN PHẨM.
 * Muốn thêm sản phẩm: chép 1 khối { ... } bên dưới, đổi id (không trùng), lưu file → web hiện ngay.
 * - price: giá bán (số, đơn vị VNĐ). image: để trống thì dùng ảnh minh họa theo danh mục.
 * - category: 'binh-chua-chay' | 'bao-chay' | 'voi-tru' | 'bao-ho' | 'den-exit'
 */
export const PRODUCTS: Product[] = [
    // --- Bình chữa cháy bột ABC ---
    {
        id: 'p1', code: 'MFZL1', name: 'Bình chữa cháy bột ABC 1kg MFZL1 – mini ô tô',
        category: 'binh-chua-chay', brand: 'Dragon', price: 165_000, stock: 120,
        standards: ['bca', 'coco', 'tcvn'], warrantyMonths: 12,
        description: 'Nhỏ gọn, đặt vừa hộc cửa ô tô. Dập được đám cháy chất rắn, lỏng, khí (A, B, C).',
        specs: [
            { label: 'Khối lượng chất chữa cháy', value: '1 kg' },
            { label: 'Thời gian phun', value: '≥ 6 giây' },
            { label: 'Tầm phun', value: '2 – 3 m' },
            { label: 'Áp suất làm việc', value: '12 – 14 bar' },
        ],
    },
    {
        id: 'p2', code: 'MFZL2', name: 'Bình chữa cháy bột ABC 2kg MFZL2 – gia đình',
        category: 'binh-chua-chay', brand: 'Dragon', price: 210_000, oldPrice: 240_000, stock: 86,
        standards: ['bca', 'coco', 'tcvn'], warrantyMonths: 12, featured: true,
        description: 'Lựa chọn phổ biến cho căn hộ, nhà phố, bếp gia đình. Có đồng hồ báo áp suất.',
        specs: [
            { label: 'Khối lượng chất chữa cháy', value: '2 kg' },
            { label: 'Thời gian phun', value: '≥ 8 giây' },
            { label: 'Tầm phun', value: '3 – 4 m' },
            { label: 'Chiều cao bình', value: '38 cm' },
        ],
    },
    {
        id: 'p3', code: 'MFZL4', name: 'Bình chữa cháy bột ABC 4kg MFZL4',
        category: 'binh-chua-chay', brand: 'Dragon', price: 285_000, stock: 240,
        standards: ['bca', 'coco', 'tcvn'], warrantyMonths: 12, featured: true,
        description: 'Trang bị tiêu chuẩn cho văn phòng, cửa hàng, hành lang nhà xưởng.',
        specs: [
            { label: 'Khối lượng chất chữa cháy', value: '4 kg' },
            { label: 'Thời gian phun', value: '≥ 9 giây' },
            { label: 'Tầm phun', value: '4 – 5 m' },
            { label: 'Áp suất làm việc', value: '12 – 14 bar' },
        ],
    },
    {
        id: 'p4', code: 'MFZL8', name: 'Bình chữa cháy bột ABC 8kg MFZL8 – công nghiệp',
        category: 'binh-chua-chay', brand: 'Tomoken', price: 420_000, stock: 95,
        standards: ['bca', 'coco'], warrantyMonths: 12,
        description: 'Dung tích lớn cho kho hàng, nhà xưởng, bãi xe.',
        specs: [
            { label: 'Khối lượng chất chữa cháy', value: '8 kg' },
            { label: 'Thời gian phun', value: '≥ 15 giây' },
            { label: 'Tầm phun', value: '5 – 6 m' },
        ],
    },
    {
        id: 'p5', code: 'MFZBT35', name: 'Bình xe đẩy chữa cháy bột ABC 35kg',
        category: 'binh-chua-chay', brand: 'Dragon', price: 1_450_000, stock: 18,
        standards: ['bca', 'coco'], warrantyMonths: 12,
        description: 'Dùng cho trạm xăng, kho hóa chất, nhà xưởng diện tích lớn.',
        specs: [
            { label: 'Khối lượng chất chữa cháy', value: '35 kg' },
            { label: 'Chiều dài vòi', value: '5 m' },
            { label: 'Tầm phun', value: '8 – 10 m' },
        ],
    },
    // --- Bình khí CO2 ---
    {
        id: 'p6', code: 'MT3', name: 'Bình chữa cháy khí CO2 MT3 – thiết bị điện',
        category: 'binh-chua-chay', brand: 'Tomoken', price: 450_000, stock: 64,
        standards: ['bca', 'coco', 'nhap-khau'], warrantyMonths: 12, featured: true,
        description: 'Không để lại cặn, phù hợp tủ điện, phòng máy, thiết bị điện tử.',
        specs: [
            { label: 'Khối lượng khí CO2', value: '3 kg' },
            { label: 'Thời gian phun', value: '≥ 8 giây' },
            { label: 'Tầm phun', value: '2 – 3 m' },
        ],
    },
    {
        id: 'p7', code: 'MT5', name: 'Bình chữa cháy khí CO2 MT5 – phòng server',
        category: 'binh-chua-chay', brand: 'Yamato', price: 650_000, stock: 40,
        standards: ['bca', 'coco', 'nhap-khau'], warrantyMonths: 12,
        description: 'Dung tích lớn cho phòng server, trạm biến áp, phòng thí nghiệm.',
        specs: [
            { label: 'Khối lượng khí CO2', value: '5 kg' },
            { label: 'Thời gian phun', value: '≥ 10 giây' },
            { label: 'Xuất xứ', value: 'Nhật Bản' },
        ],
    },
    {
        id: 'p8', code: 'MT24', name: 'Bình xe đẩy chữa cháy khí CO2 24kg',
        category: 'binh-chua-chay', brand: 'Tomoken', price: 3_800_000, stock: 6,
        standards: ['bca', 'coco'], warrantyMonths: 12,
        description: 'Dùng cho trạm điện, nhà máy, khu vực có thiết bị điện công suất lớn.',
        specs: [
            { label: 'Khối lượng khí CO2', value: '24 kg' },
            { label: 'Chiều dài vòi', value: '5 m' },
        ],
    },
    // --- Hệ thống báo cháy ---
    {
        id: 'p20', code: 'HC-SMK', name: 'Đầu báo khói quang điện Hochiki',
        category: 'bao-chay', brand: 'Hochiki', price: 480_000, stock: 150,
        standards: ['bca', 'coco', 'nhap-khau'], warrantyMonths: 24, featured: true,
        description: 'Phát hiện khói sớm cho phòng ngủ, văn phòng, hành lang. Dùng với tủ trung tâm thường.',
        specs: [
            { label: 'Điện áp', value: '24 VDC' },
            { label: 'Diện tích bảo vệ', value: '≈ 60 m²' },
            { label: 'Xuất xứ', value: 'Nhật Bản' },
        ],
    },
    {
        id: 'p21', code: 'HC-HEAT', name: 'Đầu báo nhiệt cố định Hochiki',
        category: 'bao-chay', brand: 'Hochiki', price: 390_000, stock: 110,
        standards: ['bca', 'coco', 'nhap-khau'], warrantyMonths: 24,
        description: 'Phù hợp bếp, nhà để xe — nơi có hơi nóng/khói thường xuyên dễ gây báo giả.',
        specs: [
            { label: 'Ngưỡng nhiệt', value: '70 °C' },
            { label: 'Điện áp', value: '24 VDC' },
        ],
    },
    {
        id: 'p22', code: 'NM-PNL10', name: 'Tủ trung tâm báo cháy 10 kênh Nohmi',
        category: 'bao-chay', brand: 'Nohmi', price: 9_800_000, stock: 8,
        standards: ['bca', 'coco', 'nhap-khau'], warrantyMonths: 24,
        description: 'Tủ trung tâm cho công trình vừa: văn phòng, khách sạn, nhà xưởng.',
        specs: [
            { label: 'Số kênh', value: '10 kênh' },
            { label: 'Nguồn dự phòng', value: 'Ắc quy 24V' },
        ],
    },
    {
        id: 'p23', code: 'NM-BELL', name: 'Chuông báo cháy 6 inch Nohmi',
        category: 'bao-chay', brand: 'Nohmi', price: 320_000, stock: 75,
        standards: ['bca', 'coco'], warrantyMonths: 24,
        description: 'Chuông báo động âm lượng lớn, lắp hành lang và khu vực chung.',
        specs: [{ label: 'Âm lượng', value: '≥ 90 dB' }],
    },
    {
        id: 'p24', code: 'NM-MCP', name: 'Nút ấn báo cháy khẩn cấp Nohmi',
        category: 'bao-chay', brand: 'Nohmi', price: 280_000, stock: 90,
        standards: ['bca', 'coco'], warrantyMonths: 24,
        description: 'Lắp tại lối thoát nạn, chân cầu thang để kích hoạt báo cháy thủ công.',
        specs: [{ label: 'Kiểu', value: 'Nhấn kính, có thể reset' }],
    },
    // --- Vòi, lăng, tủ ---
    {
        id: 'p13', code: 'VC-D50', name: 'Cuộn vòi chữa cháy D50 – 20m kèm khớp nối',
        category: 'voi-tru', brand: 'Tomoken', price: 750_000, stock: 60,
        standards: ['bca', 'coco', 'nhap-khau'], warrantyMonths: 12,
        description: 'Vòi tráng cao su chịu áp, dùng cho họng nước vách tường trong nhà.',
        specs: [
            { label: 'Đường kính', value: 'D50' },
            { label: 'Chiều dài', value: '20 m' },
            { label: 'Áp suất làm việc', value: '13 bar' },
        ],
    },
    {
        id: 'p14', code: 'VC-D65', name: 'Cuộn vòi chữa cháy D65 – 20m (13 bar)',
        category: 'voi-tru', brand: 'Dragon', price: 850_000, stock: 45,
        standards: ['bca', 'coco'], warrantyMonths: 12,
        description: 'Dùng cho trụ nước ngoài nhà và xe chữa cháy.',
        specs: [
            { label: 'Đường kính', value: 'D65' },
            { label: 'Chiều dài', value: '20 m' },
        ],
    },
    {
        id: 'p15', code: 'LP-D50', name: 'Lăng phun chữa cháy D50/D65',
        category: 'voi-tru', brand: 'Dragon', price: 120_000, stock: 130,
        standards: ['coco'], warrantyMonths: 6,
        description: 'Lăng phun hợp kim nhôm, khớp nối nhanh tiêu chuẩn.',
        specs: [{ label: 'Chất liệu', value: 'Hợp kim nhôm' }],
    },
    {
        id: 'p16', code: 'TC-6080', name: 'Tủ đựng thiết bị PCCC trong nhà 600×800×200',
        category: 'voi-tru', brand: 'Dragon', price: 1_250_000, stock: 22,
        standards: ['tcvn'], warrantyMonths: 24,
        description: 'Tủ sơn tĩnh điện đỏ, chứa vòi, lăng và bình chữa cháy.',
        specs: [
            { label: 'Kích thước', value: '600 × 800 × 200 mm' },
            { label: 'Độ dày tôn', value: '0,8 mm' },
        ],
    },
    {
        id: 'p17', code: 'TC-OT', name: 'Tủ đựng thiết bị PCCC ngoài trời có mái che',
        category: 'voi-tru', brand: 'Dragon', price: 1_650_000, stock: 12,
        standards: ['tcvn'], warrantyMonths: 24,
        description: 'Có mái che mưa, đặt cạnh trụ nước ngoài nhà.',
        specs: [{ label: 'Kích thước', value: '500 × 1200 × 300 mm' }],
    },
    // --- Bảo hộ & thoát hiểm ---
    {
        id: 'p9', code: 'XHZLC40', name: 'Mặt nạ phòng độc thoát hiểm XHZLC40',
        category: 'bao-ho', brand: 'SRT', price: 180_000, stock: 200,
        standards: ['coco', 'tcvn'], warrantyMonths: 6, featured: true,
        description: 'Lọc khói độc khi thoát nạn, dùng được khoảng 40 phút. Nên có ở mỗi phòng ngủ.',
        specs: [
            { label: 'Thời gian sử dụng', value: '≈ 40 phút' },
            { label: 'Hạn dùng', value: '3 năm (chưa mở hộp)' },
        ],
    },
    {
        id: 'p10', code: 'CC-ST', name: 'Chăn chiên dập lửa sợi thủy tinh 1,8m',
        category: 'bao-ho', brand: 'SRT', price: 250_000, stock: 140,
        standards: ['coco', 'tcvn'], warrantyMonths: 12, featured: true,
        description: 'Trùm kín đám cháy dầu mỡ ở bếp, hoặc quấn người khi thoát qua lửa.',
        specs: [
            { label: 'Kích thước', value: '1,8 × 1,8 m' },
            { label: 'Chịu nhiệt', value: '≈ 550 °C' },
        ],
    },
    {
        id: 'p11', code: 'TD-10M', name: 'Thang dây thoát hiểm chống cháy 10m',
        category: 'bao-ho', brand: 'SRT', price: 650_000, stock: 30,
        standards: ['coco'], warrantyMonths: 12,
        description: 'Móc vào bậu cửa sổ để thoát hiểm từ tầng 2 – 4.',
        specs: [
            { label: 'Chiều dài', value: '10 m' },
            { label: 'Tải trọng', value: '≤ 150 kg' },
        ],
    },
    {
        id: 'p12', code: 'BTH-01', name: 'Búa phá kính thoát hiểm khẩn cấp',
        category: 'bao-ho', brand: 'SRT', price: 65_000, stock: 300,
        standards: ['coco'], warrantyMonths: 6,
        description: 'Tích hợp dao cắt dây an toàn, dùng trên ô tô và tòa nhà kính.',
        specs: [{ label: 'Chất liệu đầu búa', value: 'Thép tôi cứng' }],
    },
    {
        id: 'p25', code: 'QA-TT56', name: 'Bộ quần áo chữa cháy tiêu chuẩn Thông tư 56 BCA',
        category: 'bao-ho', brand: 'SRT', price: 780_000, stock: 40,
        standards: ['bca', 'tcvn'], warrantyMonths: 12,
        description: 'Trang phục cho đội PCCC cơ sở gồm quần, áo, mũ, găng tay, ủng.',
        specs: [{ label: 'Bộ gồm', value: 'Quần, áo, mũ, găng tay, ủng' }],
    },
    // --- Đèn exit & sự cố ---
    {
        id: 'p18', code: 'EXIT-LED', name: 'Đèn Exit thoát hiểm LED 2 mặt',
        category: 'den-exit', brand: 'Kentom', price: 145_000, stock: 180,
        standards: ['coco', 'tcvn'], warrantyMonths: 12, featured: true,
        description: 'Chỉ dẫn lối thoát nạn, tự sáng bằng pin khi mất điện.',
        specs: [
            { label: 'Thời gian sáng khi mất điện', value: '≥ 2 giờ' },
            { label: 'Kiểu', value: '2 mặt, treo trần' },
        ],
    },
    {
        id: 'p19', code: 'EM-LIGHT', name: 'Đèn chiếu sáng sự cố tự động',
        category: 'den-exit', brand: 'Kentom', price: 220_000, stock: 160,
        standards: ['coco', 'tcvn'], warrantyMonths: 12,
        description: 'Tự bật khi mất điện, chiếu sáng cầu thang và hành lang thoát nạn.',
        specs: [{ label: 'Thời gian sáng', value: '≥ 2 giờ' }],
    },
     {
        id: 'p30', code: 'EM-LIGHT', name: 'Đèn chiếu sáng sự cố tự động X2',
        category: 'den-exit', brand: 'Kentom', price: 220_000, stock: 160,
        standards: ['coco', 'tcvn'], warrantyMonths: 12,
        description: 'Tự bật khi mất điện, chiếu sáng cầu thang và hành lang thoát nạn.',
        specs: [{ label: 'Thời gian sáng', value: '≥ 2 giờ' }],
    },
];

import type { CategoryKey, DocItem } from '../types';

/**
 * Nội dung tĩnh: tình huống cháy thường gặp (trang Giới thiệu) và
 * thư viện tài liệu (trang Tài liệu). Admin quản lý tài liệu trong /portal/documents.
 */

export interface FireScenario {
    key: string;
    title: string;
    place: string;
    causes: string[];
    /** Sản phẩm gợi ý (id) */
    productIds: string[];
    tips: string[];
}

export const FIRE_SCENARIOS: FireScenario[] = [
    {
        key: 'bep',
        title: 'Cháy bếp & rò rỉ gas',
        place: 'Hộ gia đình, nhà hàng, bếp ăn tập thể',
        causes: ['Rò rỉ gas, dây dẫn gas lão hóa', 'Dầu mỡ quá nhiệt bắt lửa', 'Quên tắt bếp, để vật dễ cháy gần lửa'],
        productIds: ['p10', 'p2', 'p21', 'p6'],
        tips: [
            'Khóa van bình gas trước khi xử lý.',
            'Không dùng nước dập chảo dầu đang cháy — trùm chăn chiên kín miệng chảo.',
            'Bếp nên dùng đầu báo nhiệt thay đầu báo khói để tránh báo giả.',
        ],
    },
    {
        key: 'dien',
        title: 'Chập điện & cháy thiết bị điện',
        place: 'Văn phòng, phòng server, tủ điện tòa nhà',
        causes: ['Quá tải ổ cắm, dây dẫn xuống cấp', 'Thiết bị sạc để qua đêm', 'Tủ điện ẩm, bụi bẩn'],
        productIds: ['p6', 'p7', 'p20', 'p22'],
        tips: [
            'Ngắt cầu dao/aptomat trước khi chữa cháy.',
            'Ưu tiên bình CO2 — không để lại cặn, không dẫn điện.',
            'Không dùng nước hoặc bình bọt cho đám cháy điện đang có điện.',
        ],
    },
    {
        key: 'nha-xuong',
        title: 'Cháy nhà xưởng & kho hàng',
        place: 'Xưởng may, kho vải, giấy, gỗ, kho logistics',
        causes: ['Hàng hóa dễ cháy chất cao sát trần, sát đèn', 'Hàn cắt kim loại không che chắn', 'Hút thuốc trong kho'],
        productIds: ['p4', 'p5', 'p13', 'p16', 'p18'],
        tips: [
            'Giữ lối thoát nạn thông thoáng, không chất hàng chắn tủ PCCC.',
            'Bố trí bình chữa cháy ở vị trí dễ thấy, cách nhau không quá 15 – 20 m.',
            'Tổ chức diễn tập PCCC ít nhất mỗi năm một lần.',
        ],
    },
    {
        key: 'cao-tang',
        title: 'Cháy chung cư & nhà cao tầng',
        place: 'Chung cư, khách sạn, nhà phố nhiều tầng',
        causes: ['Cháy lan từ căn hộ, kho chứa đồ ở hành lang', 'Khói độc lan qua thang bộ, giếng kỹ thuật', 'Lối thoát bị khóa hoặc chắn'],
        productIds: ['p9', 'p11', 'p19', 'p12'],
        tips: [
            'Dùng thang bộ, tuyệt đối không dùng thang máy khi có cháy.',
            'Đeo mặt nạ phòng độc hoặc che mũi bằng khăn ướt, cúi thấp người khi di chuyển.',
            'Nhà phố nên có lối thoát thứ hai (cửa sổ, ban công) và thang dây.',
        ],
    },
    {
        key: 'xe',
        title: 'Cháy ô tô & xe máy',
        place: 'Xe cá nhân, bãi đỗ xe, hầm gửi xe',
        causes: ['Chập điện do độ chế thiết bị', 'Rò rỉ nhiên liệu', 'Sạc xe điện sai cách trong hầm'],
        productIds: ['p1', 'p12', 'p4'],
        tips: [
            'Dừng xe, tắt máy, đưa mọi người ra khỏi xe trước.',
            'Chỉ chữa cháy khi đám cháy nhỏ; đứng đầu gió, cách 1,5 – 2 m.',
            'Không mở nắp capo khi đang cháy lớn — oxy sẽ làm lửa bùng lên.',
        ],
    },
];

export const SEED_DOCUMENTS: (Omit<DocItem, 'updatedAt'> & { daysAgo: number })[] = [
    {
        id: 'd1', type: 'guide', category: 'binh-chua-chay' as CategoryKey, daysAgo: 12,
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
        id: 'd2', type: 'guide', category: 'binh-chua-chay' as CategoryKey, daysAgo: 30,
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
        id: 'd3', type: 'guide', category: 'bao-ho' as CategoryKey, daysAgo: 45,
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
        id: 'd4', type: 'guide', category: 'bao-ho' as CategoryKey, daysAgo: 60,
        title: 'Hướng dẫn đeo mặt nạ phòng độc thoát hiểm',
        summary: 'Đeo đúng cách trong 30 giây để thoát qua vùng khói.',
        steps: [
            'Xé túi, lấy mặt nạ và tháo hai nút bịt ở bộ lọc.',
            'Kéo mặt nạ trùm qua đầu, chỉnh dây cho kín cổ.',
            'Thở bình thường, cúi thấp và di chuyển theo đèn Exit ra lối thoát.',
        ],
    },
    {
        id: 'd5', type: 'guide', category: 'voi-tru' as CategoryKey, daysAgo: 75,
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
        id: 'd6', type: 'checklist', daysAgo: 20,
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
        id: 'd7', type: 'standard', category: 'binh-chua-chay' as CategoryKey, daysAgo: 120,
        title: 'TCVN 7435-2 – Kiểm tra và bảo dưỡng bình chữa cháy xách tay',
        summary: 'Tóm tắt yêu cầu kiểm tra định kỳ bình chữa cháy. Nội dung mang tính tham khảo — đối chiếu văn bản gốc khi lập hồ sơ.',
        steps: [
            'Kiểm tra bên ngoài định kỳ: vỏ bình, đồng hồ áp suất, vòi phun, nhãn.',
            'Bảo dưỡng định kỳ theo khuyến cáo nhà sản xuất và tiêu chuẩn.',
            'Lập sổ theo dõi, ghi ngày kiểm tra và người thực hiện cho từng bình.',
        ],
    },
    {
        id: 'd8', type: 'standard', category: 'bao-chay' as CategoryKey, daysAgo: 150,
        title: 'TCVN 5738:2021 – Hệ thống báo cháy tự động',
        summary: 'Tóm tắt yêu cầu thiết kế, lắp đặt hệ thống báo cháy. Nội dung mang tính tham khảo.',
        steps: [
            'Lựa chọn loại đầu báo phù hợp đặc điểm khu vực bảo vệ.',
            'Bố trí nút ấn báo cháy tại lối thoát nạn, chân cầu thang.',
            'Tủ trung tâm đặt nơi có người trực 24/24, có nguồn dự phòng.',
        ],
    },
    {
        id: 'd9', type: 'regulation', daysAgo: 200,
        title: 'QCVN 06:2022/BXD – An toàn cháy cho nhà và công trình',
        summary: 'Quy chuẩn về lối thoát nạn, ngăn cháy lan, phân loại công trình. Nội dung mang tính tham khảo.',
        steps: [
            'Yêu cầu về số lượng và kích thước lối thoát nạn.',
            'Giải pháp ngăn cháy, chống cháy lan giữa các khoang.',
            'Yêu cầu về hệ thống chiếu sáng sự cố và chỉ dẫn thoát nạn.',
        ],
    },
    {
        id: 'd10', type: 'regulation', daysAgo: 90,
        title: 'Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ 2024',
        summary: 'Trách nhiệm của chủ cơ sở về PCCC. Nội dung mang tính tham khảo — đối chiếu văn bản gốc.',
        steps: [
            'Trách nhiệm trang bị phương tiện PCCC và duy trì hoạt động.',
            'Tổ chức huấn luyện, diễn tập cho lực lượng PCCC cơ sở.',
            'Kiểm tra, bảo dưỡng phương tiện PCCC định kỳ.',
        ],
    },
];

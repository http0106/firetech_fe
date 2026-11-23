import { useState } from 'react';
import { Button, Card, Collapse, Modal } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { FaPhoneAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import QuoteForm from '../componentmain/QuoteForm';
import { SectionTitle } from '../componentmain/ui';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

/** Trang Giám sát & Cứu hộ: gói bảo trì định kỳ, hotline sự cố, câu hỏi thường gặp. */
const PLANS = [
    { name: 'Cơ bản', cycle: '12 tháng/lần', price: 'Từ 1.500.000đ/năm', fit: 'Hộ gia đình, cửa hàng', features: ['Kiểm tra, nạp sạc bình chữa cháy', 'Kiểm tra đèn Exit, đèn sự cố', 'Biên bản bảo trì'] },
    { name: 'Tiêu chuẩn', cycle: '6 tháng/lần', price: 'Từ 4.500.000đ/năm', fit: 'Văn phòng, nhà xưởng', features: ['Gồm gói Cơ bản', 'Thử đầu báo, chuông, nút ấn', 'Đo ắc quy tủ trung tâm', 'Ưu tiên xử lý sự cố trong 4 giờ'] },
    { name: 'Toàn diện', cycle: '3 tháng/lần', price: 'Báo giá theo công trình', fit: 'Khách sạn, chung cư, nhà máy', features: ['Gồm gói Tiêu chuẩn', 'Kiểm tra áp lực họng nước vách tường', 'Huấn luyện PCCC cơ sở hằng năm', 'Hỗ trợ sự cố 24/7 trong 2 giờ'] },
];

const Monitoring = () => {
    const { settings } = useStore().db;
    const { user } = useAuth();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<string | null>(null);

    return (
        <div className="py-8">
            <SectionTitle title="Giám Sát & Cứu Hộ" subtitle="Bảo trì định kỳ và hỗ trợ sự cố hệ thống PCCC cho công trình." />

            <Card size="small" className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="font-bold text-gray-800 dark:text-slate-100">Hệ thống báo cháy gặp sự cố?</div>
                        <div className="text-sm text-slate-500">Báo giả, tủ trung tâm báo lỗi, mất nguồn dự phòng... gọi ngay cho kỹ thuật trực.</div>
                    </div>
                    <Button type="primary" danger size="large" icon={<FaPhoneAlt />} href={`tel:${settings.hotline.replace(/\D/g, '')}`}>
                        {settings.hotline}
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((p) => (
                    <Card key={p.name} size="small" title={`Gói ${p.name}`} extra={<span className="text-xs text-slate-500">{p.cycle}</span>}>
                        <div className="text-base font-extrabold text-red-600">{p.price}</div>
                        <div className="text-xs text-slate-500 mb-3">{p.fit}</div>
                        <div className="space-y-2 mb-4">
                            {p.features.map((f) => (
                                <div key={f} className="flex items-start gap-2">
                                    <CheckCircleFilled className="text-red-600 mt-1 shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
                                </div>
                            ))}
                        </div>
                        <Button block onClick={() => setPlan(p.name)}>Đăng ký</Button>
                    </Card>
                ))}
            </div>

            <Card size="small" title="Theo dõi bảo trì trong tài khoản" className="mt-6">
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <li>Xem ngày bảo trì kế tiếp của từng công trình, được nhắc trước 14 ngày.</li>
                    <li>Xem lịch sử các lần bảo trì, sửa chữa và kỹ thuật viên đã thực hiện.</li>
                    <li>Gửi yêu cầu bảo trì, sửa chữa trực tuyến.</li>
                </ul>
                <Button type="primary" danger onClick={() => navigate(user ? '/account/projects' : '/register')}>
                    {user ? 'Xem lịch bảo trì của tôi' : 'Đăng ký tài khoản'}
                </Button>
            </Card>

            <SectionTitle title="Câu Hỏi Thường Gặp" />
            <Collapse
                items={[
                    { key: '1', label: 'Bao lâu cần bảo trì hệ thống PCCC một lần?', children: <p className="text-sm text-slate-600 dark:text-slate-300">Tùy loại công trình và thiết bị, thường từ 3 đến 12 tháng. Kỹ sư sẽ đề xuất chu kỳ phù hợp khi khảo sát.</p> },
                    { key: '2', label: 'Bình chữa cháy bao lâu phải nạp lại?', children: <p className="text-sm text-slate-600 dark:text-slate-300">Nạp lại ngay sau khi đã sử dụng, khi kim đồng hồ ra khỏi vùng xanh, hoặc theo định kỳ kiểm tra của nhà sản xuất.</p> },
                    { key: '3', label: 'Công trình không do Fire Tech thi công có nhận bảo trì không?', children: <p className="text-sm text-slate-600 dark:text-slate-300">Có. Kỹ thuật sẽ khảo sát, lập danh sách thiết bị và đưa công trình vào lịch bảo trì.</p> },
                ]}
            />

            <Modal title={`Đăng ký gói ${plan ?? ''}`} open={!!plan} onCancel={() => setPlan(null)} footer={null} destroyOnHidden width={560}>
                <QuoteForm defaultKind="service" defaultService="Bảo trì / sửa chữa" compact />
            </Modal>
        </div>
    );
};

export default Monitoring;

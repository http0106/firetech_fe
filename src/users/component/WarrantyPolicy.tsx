import { Card, Steps } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { SectionTitle } from '../../componentmain/ui';

/** Chế độ bảo hành & hậu mãi (trang Giới thiệu). */
const POLICIES = [
    'Bảo hành chính hãng từ 6 đến 24 tháng tùy thiết bị, tra cứu theo từng thiết bị trong tài khoản.',
    'Đổi mới trong 7 ngày nếu thiết bị lỗi do nhà sản xuất, còn nguyên tem kiểm định.',
    'Nhắc lịch bảo trì trước 14 ngày và nhắc hết hạn bảo hành trước 60 ngày.',
    'Kỹ thuật hỗ trợ sự cố 24/7, có mặt trong 2 giờ tại nội thành Hà Nội.',
];

const STEPS = [
    { title: 'Tiếp nhận', content: 'Qua tài khoản, chat, hotline hoặc Zalo' },
    { title: 'Kiểm tra', content: 'Kỹ thuật xem lịch sử công trình, kiểm tra tại chỗ' },
    { title: 'Xử lý', content: 'Sửa chữa, nạp sạc hoặc thay thiết bị' },
    { title: 'Nghiệm thu', content: 'Lưu biên bản vào lịch sử công trình' },
];

const WarrantyPolicy = () => (
    <section id="bao-hanh" className="py-12 scroll-mt-36">
        <SectionTitle title="Chế Độ Bảo Hành & Hậu Mãi" subtitle="Áp dụng cho thiết bị mua và công trình thi công tại Fire Tech." />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card size="small" title="Chính sách bảo hành">
                <div className="space-y-3">
                    {POLICIES.map((p) => (
                        <div key={p} className="flex items-start gap-3">
                            <CheckCircleFilled className="text-red-600 text-base mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{p}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-4 mb-0">
                    Không bảo hành khi thiết bị đã qua sử dụng, hư hỏng do va đập, tự ý tháo lắp hoặc mất tem kiểm định.
                </p>
            </Card>

            <Card size="small" title="Quy trình xử lý bảo hành">
                <Steps orientation="vertical" size="small" current={-1} items={STEPS} />
            </Card>
        </div>
    </section>
);

export default WarrantyPolicy;

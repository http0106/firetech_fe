import { Card, Steps } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import QuoteForm from '../components/QuoteForm';
import { SectionTitle } from '../components/ui';

/**
 * Trang Tư vấn & Thiết kế.
 * Các mục #approval, #design, #acceptance khớp với submenu trên Header.
 */
const SERVICES = [
    {
        id: 'approval',
        title: 'Thẩm duyệt PCCC',
        text: 'Hoàn thiện hồ sơ và làm việc với cơ quan Cảnh sát PCCC để được thẩm duyệt thiết kế trước khi thi công.',
        items: ['Chuẩn bị hồ sơ theo quy định hiện hành', 'Chỉnh sửa theo ý kiến thẩm duyệt', 'Bàn giao văn bản thẩm duyệt'],
    },
    {
        id: 'design',
        title: 'Thiết kế hệ thống',
        text: 'Khảo sát hiện trạng, lập bản vẽ hệ thống báo cháy, chữa cháy, thoát nạn phù hợp với công trình và ngân sách.',
        items: ['Khảo sát miễn phí nội thành Hà Nội', 'Bản vẽ thiết kế cơ sở và thiết kế kỹ thuật', 'Dự toán chi tiết theo hạng mục'],
    },
    {
        id: 'acceptance',
        title: 'Nghiệm thu & Cấp phép',
        text: 'Thi công theo thiết kế được duyệt, chạy thử, nghiệm thu với cơ quan chức năng và bàn giao hồ sơ hoàn công.',
        items: ['Đội thi công có chứng chỉ hành nghề', 'Biên bản nghiệm thu, hồ sơ hoàn công', 'Lập lịch bảo trì định kỳ cho công trình'],
    },
];

const PROCESS = ['Tiếp nhận yêu cầu', 'Khảo sát', 'Thiết kế & báo giá', 'Thẩm duyệt', 'Thi công', 'Nghiệm thu'];

const Services = () => (
    <div className="py-8">
        <SectionTitle title="Tư Vấn & Thiết Kế PCCC" subtitle="Thẩm duyệt, thiết kế, thi công và nghiệm thu hệ thống phòng cháy chữa cháy." />

        <Card size="small" title="Quy trình làm việc" className="mb-6">
            <div className="overflow-x-auto">
                <Steps size="small" current={-1} items={PROCESS.map((p) => ({ title: p }))} className="min-w-[640px]" />
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
                <Card key={s.id} id={s.id} size="small" title={s.title} className="scroll-mt-36">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{s.text}</p>
                    <div className="space-y-2">
                        {s.items.map((i) => (
                            <div key={i} className="flex items-start gap-2">
                                <CheckCircleFilled className="text-red-600 mt-1 shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{i}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </div>

        <Card size="small" title="Đăng ký tư vấn" className="mt-6">
            <QuoteForm defaultKind="service" />
        </Card>
    </div>
);

export default Services;

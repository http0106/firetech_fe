import { Card, Descriptions } from 'antd';
import QuoteForm from '../componentmain/QuoteForm';
import { PageHeader } from '../componentmain/ui';
import { useStore } from '../context/StoreContext';

/** Trang Nhận báo giá (nút "Nhận Báo Giá" trên Header). */
const Contact = () => {
    const { settings } = useStore().db;

    return (
        <div className="py-8">
            <PageHeader title="Nhận báo giá" subtitle="Tư vấn viên phản hồi trong giờ hành chính. Báo giá dự án có chiết khấu cho nhà thầu." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card size="small" title="Thông tin liên hệ">
                    <Descriptions
                        size="small"
                        column={1}
                        items={[
                            { key: 'hotline', label: 'Hotline', children: <a href={`tel:${settings.hotline.replace(/\D/g, '')}`} className="font-semibold text-red-600">{settings.hotline}</a> },
                            { key: 'zalo', label: 'Zalo', children: <a href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noreferrer" className="text-blue-600">{settings.zalo}</a> },
                            { key: 'email', label: 'Email', children: settings.email },
                            { key: 'address', label: 'Địa chỉ', children: settings.address },
                            { key: 'hours', label: 'Giờ làm việc', children: settings.workingHours },
                        ]}
                    />
                </Card>
                <Card size="small" title="Gửi yêu cầu" className="lg:col-span-2">
                    <QuoteForm />
                </Card>
            </div>
        </div>
    );
};

export default Contact;

import { useState } from 'react';
import { Button, Form, Input, Result, Segmented, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { Quote, QuoteItem } from '../types';
import { useStore, useLookup } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { SERVICE_OPTIONS } from '../data/constants';
import { nextCode } from '../utils/business';
import { formatPrice, todayISO, uid } from '../utils/format';

/**
 * Form "Nhận báo giá / Đăng ký tư vấn" — dùng cho cả khách vãng lai và khách hàng.
 * Yêu cầu được đẩy vào hàng chờ của Tư vấn viên (/portal/quotes).
 * Khách đã đăng nhập theo dõi trạng thái trong /account/quotes.
 */
interface Props {
    defaultKind?: Quote['kind'];
    defaultService?: string;
    items?: QuoteItem[];
    projectId?: string;
    compact?: boolean;
    onDone?: (quote: Quote) => void;
}

interface FormValues {
    contactName: string;
    phone: string;
    email?: string;
    company?: string;
    service?: string;
    message: string;
}

const QuoteForm = ({ defaultKind = 'product', defaultService, items = [], projectId, compact, onDone }: Props) => {
    const { db, update } = useStore();
    const lookup = useLookup();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [kind, setKind] = useState<Quote['kind']>(items.length ? 'product' : defaultKind);
    const [created, setCreated] = useState<Quote | null>(null);

    const isCustomer = user?.role === 'customer';

    const submit = (values: FormValues) => {
        const quote: Quote = {
            id: uid('q'),
            code: nextCode('BG', db.quotes.map((q) => q.code)),
            customerId: isCustomer ? user.id : undefined,
            contactName: values.contactName,
            phone: values.phone,
            email: values.email,
            company: values.company,
            kind,
            service: kind === 'service' ? values.service : undefined,
            projectId,
            items: kind === 'product' ? items : [],
            message: values.message,
            status: 'new',
            createdAt: todayISO(),
        };
        update('quotes', (list) => [quote, ...list]);
        setCreated(quote);
        onDone?.(quote);
    };

    if (created)
        return (
            <Result
                status="success"
                title={`Đã gửi yêu cầu ${created.code}`}
                subTitle={
                    isCustomer
                        ? 'Tư vấn viên sẽ liên hệ trong giờ làm việc. Bạn có thể theo dõi trạng thái trong mục Báo giá của tài khoản.'
                        : 'Tư vấn viên sẽ gọi lại cho bạn trong vòng 30 phút (giờ hành chính). Đăng ký tài khoản để theo dõi báo giá trực tuyến.'
                }
                extra={
                    isCustomer ? (
                        <Button type="primary" danger onClick={() => navigate('/account/quotes')}>Xem báo giá của tôi</Button>
                    ) : (
                        <Button onClick={() => setCreated(null)}>Gửi yêu cầu khác</Button>
                    )
                }
            />
        );

    return (
        <Form<FormValues>
            layout="vertical"
            requiredMark={false}
            onFinish={submit}
            initialValues={{
                contactName: user?.name,
                phone: user?.phone,
                email: user?.email,
                company: user?.company,
                service: defaultService ?? SERVICE_OPTIONS[0],
            }}
        >
            {!items.length && (
                <Form.Item label="Bạn cần">
                    <Segmented
                        block
                        value={kind}
                        onChange={(v) => setKind(v as Quote['kind'])}
                        options={[
                            { label: 'Báo giá thiết bị', value: 'product' },
                            { label: 'Tư vấn / dịch vụ', value: 'service' },
                        ]}
                    />
                </Form.Item>
            )}

            {items.length > 0 && (
                <div className="mb-4 rounded-xl border border-[var(--border)] p-3 text-sm">
                    <div className="font-semibold text-[var(--text-h)] mb-2">Sản phẩm cần báo giá ({items.length})</div>
                    {items.map((i) => {
                        const p = lookup.product(i.productId);
                        return (
                            <div key={i.productId} className="flex justify-between gap-3 py-1 text-[var(--text)]">
                                <span className="truncate">{i.quantity} × {p?.name}</span>
                                <span className="shrink-0">{p ? formatPrice(p.price * i.quantity) : ''}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className={compact ? '' : 'grid sm:grid-cols-2 gap-x-4'}>
                <Form.Item name="contactName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                    <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        { pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ' },
                    ]}
                >
                    <Input placeholder="09xx xxx xxx" inputMode="tel" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input placeholder="ban@congty.vn" />
                </Form.Item>
                <Form.Item name="company" label="Công ty / công trình">
                    <Input placeholder="Không bắt buộc" />
                </Form.Item>
            </div>

            {kind === 'service' && (
                <Form.Item name="service" label="Dịch vụ">
                    <Select options={SERVICE_OPTIONS.map((s) => ({ label: s, value: s }))} />
                </Form.Item>
            )}

            <Form.Item
                name="message"
                label="Mô tả nhu cầu"
                rules={[{ required: true, message: 'Vui lòng mô tả ngắn nhu cầu' }]}
            >
                <Input.TextArea
                    rows={compact ? 3 : 4}
                    placeholder="Ví dụ: Văn phòng 300 m², 2 tầng, cần trang bị bình chữa cháy và đèn exit để kiểm tra PCCC."
                />
            </Form.Item>

            <Button type="primary" danger htmlType="submit" block size="large">
                Gửi yêu cầu
            </Button>
        </Form>
    );
};

export default QuoteForm;

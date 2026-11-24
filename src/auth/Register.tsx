import { useState } from 'react';
import { Alert, App, Button, Card, Checkbox, Form, Input, Segmented, Tooltip } from 'antd';
import { FaInfoCircle } from 'react-icons/fa';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';

/**
 * Đăng ký tài khoản KHÁCH HÀNG (/register). Nhân viên đăng ký ở trang riêng: /portal/register.
 * - Chọn Cá nhân / Doanh nghiệp (doanh nghiệp có thêm tên công ty, mã số thuế để xuất hóa đơn).
 * - Khách cũ có thể khai báo mã công trình đã thi công → CSKH xác minh và liên kết,
 *   sau đó khách xem được lịch bảo trì, bảo hành của công trình cũ.
 */
interface Values {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirm: string;
    company?: string;
    taxCode?: string;
    address?: string;
    projectCode?: string;
    agree: boolean;
}

const Register = () => {
    const { register } = useStore();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { message } = App.useApp();
    const [type, setType] = useState<'personal' | 'business'>('personal');
    const [error, setError] = useState<string | null>(null);

    const submit = (v: Values) => {
        const res = register({
            name: v.name.trim(),
            phone: v.phone,
            email: v.email,
            password: v.password,
            role: 'customer',
            customerType: type,
            company: type === 'business' ? v.company : undefined,
            taxCode: type === 'business' ? v.taxCode : undefined,
            address: v.address,
            pendingProjectCode: v.projectCode?.trim().toUpperCase() || undefined,
        });
        if (!res.user) {
            setError(res.error ?? '');
            return;
        }
        message.success('Đăng ký thành công! Chào mừng bạn đến với FireTech.');
        const redirect = params.get('redirect');
        navigate(redirect?.startsWith('/') ? redirect : '/account', { replace: true });
    };

    return (
        <Card className="max-w-[460px] mx-auto my-10">
            <h3 className="font-bold text-base text-gray-800 dark:text-slate-100 m-0 flex items-center gap-2">
                <span className="w-2 h-5 bg-red-600 rounded-full"></span>
                Đăng ký tài khoản
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">Dành cho khách hàng cá nhân và doanh nghiệp.</p>

            <Form<Values> layout="vertical" requiredMark={false} onFinish={submit} onValuesChange={() => setError(null)}>
                {error && <Alert type="error" showIcon title={error} className="mb-4" />}

                <Form.Item label="Bạn là">
                    <Segmented
                        block
                        value={type}
                        onChange={(v) => setType(v as 'personal' | 'business')}
                        options={[
                            { label: 'Cá nhân / gia đình', value: 'personal' },
                            { label: 'Doanh nghiệp', value: 'business' },
                        ]}
                    />
                </Form.Item>

                {type === 'business' && (
                    <div className="grid sm:grid-cols-[1fr_160px] gap-x-3">
                        <Form.Item name="company" label="Tên công ty" rules={[{ required: true, message: 'Nhập tên công ty' }]}>
                            <Input placeholder="Công ty TNHH ..." />
                        </Form.Item>
                        <Form.Item name="taxCode" label="Mã số thuế" rules={[{ pattern: /^\d{10}(\d{3})?$/, message: 'MST gồm 10 hoặc 13 số' }]}>
                            <Input placeholder="0101234567" />
                        </Form.Item>
                    </div>
                )}

                <Form.Item name="name" label={type === 'business' ? 'Người liên hệ' : 'Họ và tên'} rules={[{ required: true, message: 'Nhập họ tên' }]}>
                    <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <div className="grid sm:grid-cols-2 gap-x-3">
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ' }]}
                    >
                        <Input inputMode="tel" placeholder="09xx xxx xxx" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input placeholder="ban@gmail.com" />
                    </Form.Item>
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="confirm"
                        label="Nhập lại mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Nhập lại mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator: (_, value) =>
                                    !value || getFieldValue('password') === value
                                        ? Promise.resolve()
                                        : Promise.reject(new Error('Mật khẩu không khớp')),
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </div>
                <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" />
                </Form.Item>
                <Form.Item
                    name="projectCode"
                    label={
                        <span className="flex items-center gap-1.5">
                            Mã công trình đã thi công với FireTech (nếu có)
                            <Tooltip title="Mã in trên biên bản nghiệm thu, dạng CT-2024-018. CSKH sẽ xác minh và liên kết công trình vào tài khoản của bạn.">
                                <FaInfoCircle className="text-[var(--text)]" />
                            </Tooltip>
                        </span>
                    }
                >
                    <Input placeholder="CT-2024-018" />
                </Form.Item>
                <Form.Item
                    name="agree"
                    valuePropName="checked"
                    rules={[{ validator: (_, v) => (v ? Promise.resolve() : Promise.reject(new Error('Bạn cần đồng ý điều khoản'))) }]}
                >
                    <Checkbox>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của FireTech</Checkbox>
                </Form.Item>
                <Button type="primary" danger htmlType="submit" size="large" block>
                    Đăng ký
                </Button>
            </Form>

            <p className="text-center text-sm text-[var(--text)] mt-6">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-semibold text-red-600">
                    Đăng nhập
                </Link>
            </p>
        </Card>
    );
};

export default Register;

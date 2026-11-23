import { useState } from 'react';
import { Alert, App, Button, Checkbox, Form, Input, Radio } from 'antd';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { safeRedirect, useAuth, type RegisterInput } from '../context/AuthContext';

interface RegisterValues extends RegisterInput {
    confirm: string;
    agree: boolean;
}

/**
 * Đăng ký tài khoản khách hàng. Khách đã thi công với FireTech có thể khai báo mã công trình
 * để CSKH xác minh và liên kết (hiện lịch bảo trì, bảo hành trong /account).
 * Đăng ký xong tự đăng nhập và quay lại trang trước đó (?redirect=).
 */
const Register = () => {
    const { user, homePath, register } = useAuth();
    const { message } = App.useApp();
    const [params] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const redirect = safeRedirect(params.get('redirect'), homePath);

    if (user) return <Navigate to={redirect} replace />;

    const onFinish = ({ confirm: _confirm, agree: _agree, ...v }: RegisterValues) => {
        const input: RegisterInput = {
            ...v,
            name: v.name.trim(),
            phone: v.phone.replace(/\s/g, ''),
            company: v.customerType === 'business' ? v.company?.trim() : undefined,
            taxCode: v.customerType === 'business' ? v.taxCode?.trim() : undefined,
            pendingProjectCode: v.pendingProjectCode?.trim().toUpperCase() || undefined,
        };
        const res = register(input);
        if (!res.ok) {
            setError(res.error);
            return;
        }
        message.success('Đăng ký thành công. Chào mừng bạn đến với FireTech!');
    };

    return (
        <div>
            <h1 className="m-0 tracking-normal text-2xl font-extrabold text-[var(--text-h)]">Đăng ký tài khoản</h1>
            <p className="text-sm text-[var(--text)] mt-1 mb-5">Đặt hàng nhanh, theo dõi báo giá và nhận nhắc lịch bảo trì.</p>

            {error && <Alert type="error" showIcon title={error} className="mb-4" closable={{ onClose: () => setError(null) }} />}

            <Form<RegisterValues>
                layout="vertical"
                requiredMark={false}
                initialValues={{ customerType: 'personal' }}
                onFinish={onFinish}
                onValuesChange={() => error && setError(null)}
            >
                <Form.Item name="customerType" label="Loại khách hàng">
                    <Radio.Group
                        optionType="button"
                        buttonStyle="solid"
                        options={[
                            { value: 'personal', label: 'Cá nhân / hộ gia đình' },
                            { value: 'business', label: 'Doanh nghiệp' },
                        ]}
                    />
                </Form.Item>
                <Form.Item name="name" label="Họ và tên" rules={[{ required: true, whitespace: true, message: 'Nhập họ và tên' }]}>
                    <Input autoComplete="name" />
                </Form.Item>
                <div className="grid sm:grid-cols-2 gap-x-3">
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, pattern: /^0\d{9,10}$/, transform: (v?: string) => v?.replace(/\s/g, ''), message: 'Số điện thoại không hợp lệ' }]}
                    >
                        <Input inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input autoComplete="email" />
                    </Form.Item>
                </div>

                <Form.Item noStyle dependencies={['customerType']}>
                    {({ getFieldValue }) =>
                        getFieldValue('customerType') === 'business' && (
                            <div className="grid sm:grid-cols-2 gap-x-3">
                                <Form.Item name="company" label="Tên công ty" rules={[{ required: true, whitespace: true, message: 'Nhập tên công ty' }]}>
                                    <Input autoComplete="organization" />
                                </Form.Item>
                                <Form.Item name="taxCode" label="Mã số thuế">
                                    <Input />
                                </Form.Item>
                            </div>
                        )
                    }
                </Form.Item>

                <Form.Item name="address" label="Địa chỉ">
                    <Input autoComplete="street-address" placeholder="Dùng làm địa chỉ giao hàng mặc định" />
                </Form.Item>
                <Form.Item
                    name="pendingProjectCode"
                    label="Mã công trình (không bắt buộc)"
                    tooltip="Nếu FireTech đã thi công cho bạn, nhập mã công trình trên biên bản bàn giao để xem lịch bảo trì và bảo hành."
                >
                    <Input placeholder="VD: CT-2023-015" />
                </Form.Item>
                <div className="grid sm:grid-cols-2 gap-x-3">
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item
                        name="confirm"
                        label="Nhập lại mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Nhập lại mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator: (_, value) =>
                                    !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Mật khẩu nhập lại không khớp')),
                            }),
                        ]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                </div>
                <Form.Item
                    name="agree"
                    valuePropName="checked"
                    rules={[{ validator: (_, v) => (v ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý điều khoản'))) }]}
                >
                    <Checkbox>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của FireTech</Checkbox>
                </Form.Item>
                <Button type="primary" danger htmlType="submit" block size="large">
                    Đăng ký
                </Button>
            </Form>

            <p className="text-sm text-center text-[var(--text)] mt-4 mb-0">
                Đã có tài khoản?{' '}
                <Link to={`/login${params.get('redirect') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-red-600 font-semibold">
                    Đăng nhập
                </Link>
            </p>
        </div>
    );
};

export default Register;

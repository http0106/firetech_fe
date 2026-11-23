import { useState } from 'react';
import { Alert, App, Button, Checkbox, Form, Input } from 'antd';
import { FaLock, FaUser } from 'react-icons/fa';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { safeRedirect, useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../data/seed';

interface LoginValues {
    identifier: string;
    password: string;
    remember: boolean;
}

/**
 * Đăng nhập khách hàng (email hoặc số điện thoại). Sau khi đăng nhập quay về trang trước đó
 * (?redirect=, ví dụ /cart), nên giỏ hàng, thông báo, menu tài khoản trên Header cập nhật ngay.
 */
const Login = () => {
    const { user, homePath, login } = useAuth();
    const { message } = App.useApp();
    const [params] = useSearchParams();
    const [form] = Form.useForm<LoginValues>();
    const [error, setError] = useState<string | null>(null);
    const redirect = safeRedirect(params.get('redirect'), homePath);

    // Đã đăng nhập (kể cả ngay sau khi bấm Đăng nhập) → chuyển về trang đích
    if (user) return <Navigate to={redirect} replace />;

    const onFinish = (v: LoginValues) => {
        const res = login(v.identifier, v.password, v.remember);
        if (!res.ok) {
            setError(res.error);
            return;
        }
        message.success(`Xin chào ${res.user.name}!`);
    };

    const demo = DEMO_ACCOUNTS.filter((a) => a.role === 'customer');

    return (
        <div>
            <h1 className="m-0 tracking-normal text-2xl font-extrabold text-[var(--text-h)]">Đăng nhập</h1>
            <p className="text-sm text-[var(--text)] mt-1 mb-5">Theo dõi đơn hàng, báo giá, lịch bảo trì và bảo hành thiết bị.</p>

            {error && <Alert type="error" showIcon title={error} className="mb-4" closable={{ onClose: () => setError(null) }} />}

            <Form<LoginValues>
                form={form}
                layout="vertical"
                requiredMark={false}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onValuesChange={() => error && setError(null)}
            >
                <Form.Item name="identifier" label="Email hoặc số điện thoại" rules={[{ required: true, message: 'Nhập email hoặc số điện thoại' }]}>
                    <Input prefix={<FaUser className="opacity-50 mr-1" />} autoComplete="username" placeholder="email@congty.vn / 09xx xxx xxx" />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
                    <Input.Password prefix={<FaLock className="opacity-50 mr-1" />} autoComplete="current-password" />
                </Form.Item>
                <Form.Item name="remember" valuePropName="checked">
                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Button type="primary" danger htmlType="submit" block size="large">
                    Đăng nhập
                </Button>
            </Form>

            <p className="text-sm text-center text-[var(--text)] mt-4 mb-0">
                Chưa có tài khoản?{' '}
                <Link to={`/register${params.get('redirect') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-red-600 font-semibold">
                    Đăng ký ngay
                </Link>
            </p>

            {demo.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[var(--border)]">
                    <div className="text-xs text-[var(--text)] mb-2">Tài khoản dùng thử (mật khẩu 123456):</div>
                    <div className="flex flex-wrap gap-2">
                        {demo.map((a) => (
                            <Button key={a.email} size="small" onClick={() => form.setFieldsValue({ identifier: a.email, password: '123456' })}>
                                {a.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;

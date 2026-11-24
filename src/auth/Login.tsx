import { useState } from 'react';
import { Alert, App, Button, Card, Form, Input, Modal, Result } from 'antd';
import { FaLock, FaUser } from 'react-icons/fa';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { homePathOf } from '../data/constants';
import { DEMO_ACCOUNTS } from '../data/seed';

/**
 * ĐĂNG NHẬP — 1 component dùng cho 2 trang:
 *   /login          <Login />        khách hàng
 *   /portal/login   <Login staff />  nhân viên nội bộ
 * Đăng nhập nhầm trang (khách vào trang nhân viên hoặc ngược lại) sẽ báo lỗi.
 * Xong: quay lại trang trước đó (?redirect=...), không có thì khách → /account, nhân viên → /portal.
 */
interface Values {
    identifier: string;
    password: string;
}

const Login = ({ staff = false }: { staff?: boolean }) => {
    const [params] = useSearchParams();
    const redirect = params.get('redirect');
    const { user, login, logout } = useStore();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [form] = Form.useForm<Values>();
    const [error, setError] = useState('');
    const [forgotOpen, setForgotOpen] = useState(false);

    // Chữ và link khác nhau giữa 2 trang
    const page = staff
        ? {
              title: 'Đăng nhập nội bộ',
              subtitle: 'Quản trị · Kinh doanh · Kỹ thuật · Kế toán',
              registerLink: '/portal/register',
              otherLabel: 'Khách hàng đăng nhập',
              otherLink: '/login',
          }
        : {
              title: 'Đăng nhập',
              subtitle: 'Theo dõi đơn hàng, báo giá, lịch bảo trì và bảo hành thiết bị.',
              registerLink: `/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`,
              otherLabel: 'Nhân viên FireTech đăng nhập',
              otherLink: '/portal/login',
          };

    // Đang đăng nhập rồi → hỏi muốn vào tài khoản hay đổi tài khoản
    if (user)
        return (
            <Card className="max-w-[460px] mx-auto my-10">
                <Result
                    status="info"
                    title={`Bạn đang đăng nhập với tài khoản ${user.name}`}
                    extra={[
                        <Button key="home" type="primary" danger onClick={() => navigate(homePathOf(user))}>
                            Vào tài khoản của tôi
                        </Button>,
                        <Button key="out" onClick={logout}>
                            Đăng xuất để đổi tài khoản
                        </Button>,
                    ]}
                />
            </Card>
        );

    const submit = (v: Values) => {
        const result = login(v.identifier, v.password, staff);
        if (!result.user) {
            setError(result.error ?? '');
            return;
        }
        message.success(`Xin chào ${result.user.name}!`);
        navigate(redirect?.startsWith('/') ? redirect : homePathOf(result.user), { replace: true });
    };

    return (
        <Card className="max-w-[460px] mx-auto my-10">
            <h3 className="font-bold text-base text-gray-800 dark:text-slate-100 m-0 flex items-center gap-2">
                <span className="w-2 h-5 bg-red-600 rounded-full"></span>
                {page.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">{page.subtitle}</p>

            <Form<Values> form={form} layout="vertical" requiredMark={false} onFinish={submit} onValuesChange={() => setError('')}>
                {error && <Alert type="error" showIcon className="mb-4" title={error} />}
                <Form.Item name="identifier" label="Email hoặc số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập email hoặc số điện thoại' }]}>
                    <Input prefix={<FaUser className="opacity-60" />} placeholder="Email hoặc số điện thoại đã đăng ký" autoComplete="username" />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                    <Input.Password prefix={<FaLock className="opacity-60" />} autoComplete="current-password" />
                </Form.Item>
                <div className="flex justify-end mb-4">
                    <Button type="link" className="p-0" onClick={() => setForgotOpen(true)}>
                        Quên mật khẩu?
                    </Button>
                </div>
                <Button type="primary" danger htmlType="submit" size="large" block>
                    Đăng nhập
                </Button>
            </Form>

            <p className="text-center text-sm mt-5 mb-0">
                Chưa có tài khoản?{' '}
                <Link to={page.registerLink} className="font-semibold text-red-600">
                    Đăng ký
                </Link>
            </p>
            <p className="text-center text-xs mt-2 mb-0">
                {page.otherLabel}{' '}
                <Link to={page.otherLink} className="text-blue-600 hover:underline">tại đây</Link>.
            </p>

            {/* Tài khoản dùng thử — xóa khi triển khai thật */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400">
                Tài khoản dùng thử (mật khẩu 123456):{' '}
                {DEMO_ACCOUNTS.filter((a) => a.staff === staff).map((a, i) => (
                    <span key={a.email}>
                        {i > 0 && ', '}
                        <a className="text-blue-600 hover:underline cursor-pointer" onClick={() => form.setFieldsValue({ identifier: a.email, password: '123456' })}>
                            {a.label}
                        </a>
                    </span>
                ))}
            </div>

            <Modal title="Quên mật khẩu" open={forgotOpen} onCancel={() => setForgotOpen(false)} footer={null} destroyOnHidden>
                <Form
                    layout="vertical"
                    onFinish={() => {
                        setForgotOpen(false);
                        message.success('Đã ghi nhận yêu cầu đặt lại mật khẩu.');
                    }}
                >
                    <p className="text-sm text-[var(--text)] mb-3">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input placeholder="ban@gmail.com" />
                    </Form.Item>
                    <Button type="primary" danger htmlType="submit" block>
                        Gửi liên kết
                    </Button>
                </Form>
            </Modal>
        </Card>
    );
};

export default Login;

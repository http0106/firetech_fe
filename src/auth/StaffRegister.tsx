import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Result, Select } from 'antd';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { ROLE_LABELS } from '../data/constants';
import type { Role } from '../types';

/**
 * ĐĂNG KÝ NHÂN VIÊN NỘI BỘ (/portal/register).
 * Đăng ký xong tài khoản ở trạng thái "Chờ duyệt" → Admin duyệt trong /portal/users mới đăng nhập được.
 * Không cho tự chọn vai trò Quản trị viên.
 */
interface Values {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirm: string;
    role: Role;
    position: string;
}

const ROLE_OPTIONS = (['sales', 'technician', 'accountant'] as Role[]).map((r) => ({ value: r, label: ROLE_LABELS[r] }));

const StaffRegister = () => {
    const { register } = useStore();
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const submit = (v: Values) => {
        const result = register({ name: v.name.trim(), phone: v.phone, email: v.email, password: v.password, role: v.role, position: v.position });
        if (!result.user) {
            setError(result.error ?? '');
            return;
        }
        setDone(true);
    };

    if (done)
        return (
            <Card className="max-w-[460px] mx-auto my-10">
                <Result
                    status="success"
                    title="Đăng ký thành công"
                    subTitle="Tài khoản đang chờ Quản trị viên duyệt. Sau khi được duyệt, bạn đăng nhập tại trang nội bộ."
                    extra={
                        <Link to="/portal/login">
                            <Button type="primary" danger>Về trang đăng nhập nội bộ</Button>
                        </Link>
                    }
                />
            </Card>
        );

    return (
        <Card className="max-w-[460px] mx-auto my-10">
            <h3 className="font-bold text-base text-gray-800 dark:text-slate-100 m-0 flex items-center gap-2">
                <span className="w-2 h-5 bg-red-600 rounded-full"></span>
                Đăng ký nhân viên
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-5">Dành cho nhân viên FireTech. Tài khoản cần Quản trị viên duyệt.</p>

            <Form<Values> layout="vertical" requiredMark={false} onFinish={submit} onValuesChange={() => setError('')} initialValues={{ role: 'sales' }}>
                {error && <Alert type="error" showIcon title={error} className="mb-4" />}
                <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                    <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <div className="grid sm:grid-cols-2 gap-x-3">
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ' }]}>
                        <Input inputMode="tel" placeholder="09xx xxx xxx" />
                    </Form.Item>
                    <Form.Item name="email" label="Email công ty" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input placeholder="ten@firetech.vn" />
                    </Form.Item>
                    <Form.Item name="role" label="Bộ phận">
                        <Select options={ROLE_OPTIONS} />
                    </Form.Item>
                    <Form.Item name="position" label="Chức danh" rules={[{ required: true, message: 'Nhập chức danh' }]}>
                        <Input placeholder="Tư vấn viên, Kỹ thuật bảo trì..." />
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
                                    !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Mật khẩu không khớp')),
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </div>
                <Button type="primary" danger htmlType="submit" size="large" block>
                    Đăng ký
                </Button>
            </Form>

            <p className="text-center text-sm mt-5 mb-0">
                Đã có tài khoản?{' '}
                <Link to="/portal/login" className="font-semibold text-red-600">
                    Đăng nhập nội bộ
                </Link>
            </p>
        </Card>
    );
};

export default StaffRegister;

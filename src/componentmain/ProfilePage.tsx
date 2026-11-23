import { App, Button, Form, Input, Tag } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { PERMISSION_GROUPS, ROLE_LABELS } from '../data/constants';
import { PageHeader, Panel } from './ui';

/**
 *  Hồ sơ cá nhân (dùng chung khách hàng /account/profile và nhân viên /portal/profile).
 * Nhân viên xem được danh sách quyền đang có nhưng không tự sửa (do Admin cấp).
 */
const ProfilePage = () => {
    const { user, can } = useAuth();
    const { update } = useStore();
    const { message } = App.useApp();
    if (!user) return null;
    const isCustomer = user.role === 'customer';

    const saveInfo = (v: { name: string; phone: string; company?: string; taxCode?: string; address?: string }) => {
        update('users', (list) => list.map((u) => (u.id === user.id ? { ...u, ...v } : u)));
        message.success('Đã cập nhật thông tin');
    };

    const changePassword = (v: { current: string; next: string }) => {
        if (v.current !== user.password) {
            message.error('Mật khẩu hiện tại không đúng');
            return;
        }
        update('users', (list) => list.map((u) => (u.id === user.id ? { ...u, password: v.next } : u)));
        message.success('Đã đổi mật khẩu');
    };

    return (
        <div className="flex flex-col gap-5 max-w-3xl">
            <PageHeader title="Thông tin tài khoản" subtitle={`${ROLE_LABELS[user.role]}${user.position ? ` · ${user.position}` : ''}`} />

            <Panel title="Thông tin cá nhân">
                <Form layout="vertical" initialValues={user} onFinish={saveInfo} requiredMark={false}>
                    <div className="grid sm:grid-cols-2 gap-x-4">
                        <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ' }]}><Input /></Form.Item>
                        <Form.Item name="email" label="Email (dùng để đăng nhập)"><Input disabled /></Form.Item>
                        {isCustomer && <Form.Item name="company" label="Công ty"><Input /></Form.Item>}
                        {isCustomer && <Form.Item name="taxCode" label="Mã số thuế"><Input /></Form.Item>}
                        {isCustomer && <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>}
                    </div>
                    <Button type="primary" danger htmlType="submit">Lưu thay đổi</Button>
                </Form>
            </Panel>

            <Panel title="Đổi mật khẩu">
                <Form layout="vertical" onFinish={changePassword} requiredMark={false} className="max-w-sm">
                    <Form.Item name="current" label="Mật khẩu hiện tại" rules={[{ required: true }]}><Input.Password /></Form.Item>
                    <Form.Item name="next" label="Mật khẩu mới" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}><Input.Password /></Form.Item>
                    <Form.Item
                        name="confirm"
                        label="Nhập lại mật khẩu mới"
                        dependencies={['next']}
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator: (_, v) => (!v || v === getFieldValue('next') ? Promise.resolve() : Promise.reject(new Error('Không khớp'))),
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Button htmlType="submit">Đổi mật khẩu</Button>
                </Form>
            </Panel>

            {!isCustomer && (
                <Panel title="Quyền được cấp">
                    <p className="text-sm text-[var(--text)] mb-3">Quyền do Quản trị viên phân. Cần thêm quyền? Liên hệ quản trị hệ thống.</p>
                    <div className="flex flex-col gap-3">
                        {PERMISSION_GROUPS.map((g) => (
                            <div key={g.group}>
                                <div className="text-xs font-semibold text-[var(--text)] mb-1">{g.group}</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {g.items.map((i) => (
                                        <Tag key={i.key} color={can(i.key) ? 'green' : 'default'} className={can(i.key) ? '' : 'opacity-50 line-through'}>
                                            {i.label}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}
        </div>
    );
};

export default ProfilePage;

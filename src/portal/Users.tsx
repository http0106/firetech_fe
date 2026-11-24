import { useState } from 'react';
import { App, Button, Form, Input, Modal, Popconfirm, Select, Table, Tabs, Tag } from 'antd';
import { FaLink, FaLock, FaLockOpen, FaUserPlus } from 'react-icons/fa';
import { PageHeader } from '../components/ui';
import { useStore } from '../store';
import { ROLE_COLORS, ROLE_LABELS } from '../data/constants';
import { formatDate, nowISO, uid } from '../utils';
import type { Role, User } from '../types';

/**
 * TÀI KHOẢN & PHÂN QUYỀN (chỉ Admin).
 * - Phân quyền = chọn VAI TRÒ cho nhân viên. Vai trò được vào trang nào: xem ROLE_PAGES (data/constants.ts).
 * - Tạo tài khoản nhân viên, khóa/mở khóa, đặt lại mật khẩu.
 * - Khách hàng: xem danh sách, liên kết công trình theo mã khách khai báo khi đăng ký.
 */
const STAFF_ROLES: Role[] = ['sales', 'technician', 'accountant', 'admin'];
const roleOptions = STAFF_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));

/** Mật khẩu ngẫu nhiên 8 ký tự. */
const randomPassword = () => Math.random().toString(36).slice(2, 10);

type NewStaff = Pick<User, 'name' | 'email' | 'phone' | 'role' | 'position' | 'password'>;

const tableBox = 'rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden';
const STATUS_TAG = { active: <Tag color="green">Hoạt động</Tag>, pending: <Tag color="gold">Chờ duyệt</Tag>, locked: <Tag>Đã khóa</Tag> };
const statusTag = (s: User['status']) => STATUS_TAG[s];

/** Nút đổi trạng thái: đang hoạt động → "Khóa", chờ duyệt → "Duyệt", đã khóa → "Mở khóa". */
const STATUS_ACTION = { active: 'Khóa', pending: 'Duyệt', locked: 'Mở khóa' };

const Users = () => {
    const { db, add, edit, user: me } = useStore();
    const { message, modal } = App.useApp();
    const [createOpen, setCreateOpen] = useState(false);

    const staff = db.users.filter((u) => u.role !== 'customer');
    const customers = db.users.filter((u) => u.role === 'customer');

    /** Sửa một vài trường của 1 tài khoản. */
    const patch = (id: string, changes: Partial<User>) => edit('users', id, changes);

    const toggleLock = (u: User) => {
        patch(u.id, { status: u.status === 'active' ? 'locked' : 'active' });
        message.success(`Đã ${STATUS_ACTION[u.status].toLowerCase()} ${u.name}`);
    };

    const resetPassword = (u: User) => {
        const password = randomPassword();
        patch(u.id, { password });
        modal.success({ title: `Mật khẩu mới cho ${u.name}`, content: <span>Gửi cho nhân viên qua kênh nội bộ: <b className="font-mono">{password}</b></span> });
    };

    const createStaff = (v: NewStaff) => {
        if (db.users.some((u) => u.email.toLowerCase() === v.email.toLowerCase())) {
            message.error('Email đã được sử dụng');
            return;
        }
        add('users', { ...v, id: uid('u'), status: 'active', createdAt: nowISO() });
        setCreateOpen(false);
        modal.success({
            title: `Đã tạo tài khoản cho ${v.name}`,
            content: <span>Đăng nhập với email <b>{v.email}</b> và mật khẩu <b className="font-mono">{v.password}</b>. Nhân viên nên đổi mật khẩu ở lần đăng nhập đầu.</span>,
        });
    };

    /** Gắn công trình (theo mã khách khai báo khi đăng ký) vào tài khoản khách hàng. */
    const linkProject = (u: User) => {
        const project = db.projects.find((p) => p.code.toUpperCase() === u.pendingProjectCode?.toUpperCase());
        if (!project) {
            modal.confirm({
                title: `Không tìm thấy công trình ${u.pendingProjectCode}`,
                content: 'Mã này chưa có trong hệ thống. Bỏ yêu cầu liên kết?',
                okText: 'Bỏ yêu cầu',
                cancelText: 'Để sau',
                onOk: () => patch(u.id, { pendingProjectCode: undefined }),
            });
            return;
        }
        edit('projects', project.id, { customerId: u.id });
        patch(u.id, { pendingProjectCode: undefined });
        message.success(`Đã liên kết ${project.code} vào tài khoản ${u.name}`);
    };

    const staffTable = (
        <div className={tableBox}>
            <Table
                rowKey="id"
                dataSource={staff}
                scroll={{ x: 900 }}
                columns={[
                    { title: 'Nhân viên', render: (_, u) => <span><b>{u.name}</b><br /><span className="text-xs text-[var(--text)]">{u.email} · {u.phone}</span></span> },
                    { title: 'Chức danh', dataIndex: 'position' },
                    {
                        title: 'Vai trò',
                        render: (_, u) =>
                            // Không tự đổi vai trò của chính mình (tránh Admin tự mất quyền)
                            u.id === me?.id ? (
                                <Tag color={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Tag>
                            ) : (
                                <Select
                                    size="small"
                                    className="w-44"
                                    value={u.role}
                                    options={roleOptions}
                                    onChange={(role) => {
                                        patch(u.id, { role });
                                        message.success(`${u.name} → ${ROLE_LABELS[role]}`);
                                    }}
                                />
                            ),
                    },
                    { title: 'Trạng thái', dataIndex: 'status', render: statusTag },
                    { title: 'Ngày tạo', dataIndex: 'createdAt', render: formatDate },
                    {
                        title: '',
                        render: (_, u) => (
                            <div className="flex flex-wrap gap-2 justify-end">
                                <Popconfirm title={`Đặt lại mật khẩu cho ${u.name}?`} okText="Đặt lại" cancelText="Hủy" onConfirm={() => resetPassword(u)}>
                                    <Button size="small">Đặt lại MK</Button>
                                </Popconfirm>
                                {u.id !== me?.id && (
                                    <Button
                                        size="small"
                                        type={u.status === 'pending' ? 'primary' : 'default'}
                                        danger={u.status === 'active'}
                                        icon={u.status === 'active' ? <FaLock /> : <FaLockOpen />}
                                        onClick={() => toggleLock(u)}
                                    >
                                        {STATUS_ACTION[u.status]}
                                    </Button>
                                )}
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );

    const customerTable = (
        <div className={tableBox}>
            <Table
                rowKey="id"
                dataSource={customers}
                scroll={{ x: 960 }}
                columns={[
                    { title: 'Khách hàng', render: (_, u) => <span><b>{u.company ?? u.name}</b><br /><span className="text-xs text-[var(--text)]">{u.name} · {u.email} · {u.phone}</span></span> },
                    { title: 'Loại', dataIndex: 'customerType', render: (t?: string) => (t === 'business' ? <Tag color="blue">Doanh nghiệp</Tag> : <Tag>Cá nhân</Tag>) },
                    { title: 'Công trình', render: (_, u) => db.projects.filter((p) => p.customerId === u.id).length },
                    { title: 'Đơn hàng', render: (_, u) => db.orders.filter((o) => o.customerId === u.id).length },
                    { title: 'Ngày đăng ký', dataIndex: 'createdAt', render: formatDate },
                    { title: 'Trạng thái', dataIndex: 'status', render: statusTag },
                    {
                        title: '',
                        render: (_, u) => (
                            <div className="flex flex-wrap gap-2 justify-end">
                                {u.pendingProjectCode && (
                                    <Button size="small" type="primary" ghost icon={<FaLink />} onClick={() => linkProject(u)}>
                                        Liên kết {u.pendingProjectCode}
                                    </Button>
                                )}
                                <Button size="small" danger={u.status === 'active'} onClick={() => toggleLock(u)}>
                                    {STATUS_ACTION[u.status]}
                                </Button>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Tài khoản & phân quyền"
                subtitle="Quyền của nhân viên theo vai trò: đổi vai trò ở cột “Vai trò”."
                extra={<Button type="primary" icon={<FaUserPlus />} onClick={() => setCreateOpen(true)}>Tạo tài khoản nhân viên</Button>}
            />
            <Tabs
                items={[
                    { key: 'staff', label: `Nhân viên (${staff.length})`, children: staffTable },
                    { key: 'customers', label: `Khách hàng (${customers.length})`, children: customerTable },
                ]}
            />

            <Modal title="Tạo tài khoản nhân viên" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} destroyOnHidden width={680}>
                <Form<NewStaff> layout="vertical" requiredMark={false} initialValues={{ role: 'sales', password: randomPassword() }} onFinish={createStaff}>
                    <div className="grid sm:grid-cols-2 gap-x-3">
                        <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, pattern: /^0\d{9,10}$/, message: 'Không hợp lệ' }]}><Input /></Form.Item>
                        <Form.Item name="email" label="Email công ty (tên đăng nhập)" rules={[{ required: true, type: 'email' }]}><Input placeholder="ten@firetech.vn" /></Form.Item>
                        <Form.Item name="password" label="Mật khẩu tạm" rules={[{ required: true, min: 6 }]}><Input /></Form.Item>
                        <Form.Item name="role" label="Vai trò"><Select options={roleOptions} /></Form.Item>
                        <Form.Item name="position" label="Chức danh" rules={[{ required: true }]}><Input placeholder="Tư vấn viên, Kỹ thuật bảo trì..." /></Form.Item>
                    </div>
                    <Button type="primary" htmlType="submit" block>Tạo tài khoản</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;

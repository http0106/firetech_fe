import { Avatar, Grid, Menu } from 'antd';
import { FaBuilding, FaClipboardList, FaFileSignature, FaHome, FaStar, FaUserEdit } from 'react-icons/fa';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Forbidden } from '../components/ui';
import { useStore } from '../store';

/**
 * Khu vực tài khoản khách hàng (/account), nằm trong website công khai
 * để khách vẫn dùng được Header (tìm kiếm, giỏ hàng).
 * Chỉ tài khoản KHÁCH HÀNG được vào.
 */
const ITEMS = [
    { key: '/account', label: 'Tổng quan', icon: <FaHome /> },
    { key: '/account/projects', label: 'Công trình & bảo trì', icon: <FaBuilding /> },
    { key: '/account/orders', label: 'Đơn hàng', icon: <FaClipboardList /> },
    { key: '/account/quotes', label: 'Báo giá', icon: <FaFileSignature /> },
    { key: '/account/reviews', label: 'Đánh giá của tôi', icon: <FaStar /> },
    { key: '/account/profile', label: 'Thông tin tài khoản', icon: <FaUserEdit /> },
];

const AccountLayout = () => {
    const { user } = useStore();
    const location = useLocation();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();

    // Chưa đăng nhập → về trang đăng nhập. Nhân viên không có trang này.
    if (!user) return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
    if (user.role !== 'customer') return <Forbidden />;

    // /account/projects/pj1 → mục "/account/projects"
    const selected = '/' + location.pathname.split('/').slice(1, 3).join('/');

    return (
        <div className="py-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] items-start">
            <aside className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:sticky lg:top-36 overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
                    <Avatar size={44} className="shrink-0" style={{ backgroundColor: 'var(--text-h)', color: 'var(--bg)' }}>
                        {user.name.split(' ').pop()?.[0]}
                    </Avatar>
                    <div className="min-w-0">
                        <div className="font-semibold text-[var(--text-h)] truncate">{user.name}</div>
                        <div className="text-xs text-[var(--text)] truncate">{user.company ?? user.email}</div>
                    </div>
                </div>
                <Menu
                    mode={screens.lg ? 'inline' : 'horizontal'}
                    selectedKeys={[selected]}
                    items={ITEMS}
                    onClick={({ key }) => navigate(key)}
                    className="border-0 bg-transparent"
                />
            </aside>
            <section className="min-w-0">
                <Outlet />
            </section>
        </div>
    );
};

export default AccountLayout;

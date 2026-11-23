import { useMemo, useState, type ReactNode } from 'react';
import { Badge, Button, Drawer, Grid, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
    FaBars,
    FaBook,
    FaBoxOpen,
    FaBuilding,
    FaCalendarCheck,
    FaChartBar,
    FaCog,
    FaComments,
    FaFileInvoiceDollar,
    FaFileSignature,
    FaGlobeAsia,
    FaShoppingBag,
    FaStar,
    FaTachometerAlt,
    FaUserCog,
    FaUserShield,
} from 'react-icons/fa';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { Permission } from '../types';
import Logo from '../componentmain/Logo';
import NotificationDropdown from '../users/component/Notification';
import { AccountMenu } from './HeaderParts';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { NotificationProvider } from '../context/NotificationContext';
import { ROLE_LABELS } from '../data/constants';

/**
 * GIAO DIỆN MỚI — Bố cục trang nội bộ (/portal) cho Admin, Kinh doanh, Kỹ thuật, Kế toán.
 * Menu trái được lọc theo QUYỀN của tài khoản (Admin cấp trong "Tài khoản & phân quyền"),
 * nên cùng một vai trò có thể thấy menu khác nhau tùy quyền được cấp.
 */
interface NavItem {
    key: string;
    label: string;
    icon: ReactNode;
    perm?: Permission;
    badge?: number;
}

const PortalLayoutInner = () => {
    const { user, can } = useAuth();
    const { db } = useStore();
    const location = useLocation();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const groups = useMemo<{ title?: string; items: NavItem[] }[]>(
        () => [
            { items: [{ key: '/portal', label: 'Tổng quan', icon: <FaTachometerAlt />, perm: 'dashboard.view' }] },
            {
                title: 'Kinh doanh & CSKH',
                items: [
                    {
                        key: '/portal/chat', label: 'Tư vấn trực tuyến', icon: <FaComments />, perm: 'chat.reply',
                        badge: db.chats.filter((c) => c.status === 'open' && c.unreadByStaff > 0).length,
                    },
                    {
                        key: '/portal/quotes', label: 'Yêu cầu báo giá', icon: <FaFileSignature />, perm: 'quotes.manage',
                        badge: db.quotes.filter((q) => q.status === 'new').length,
                    },
                    {
                        key: '/portal/orders', label: 'Đơn hàng', icon: <FaShoppingBag />, perm: 'orders.manage',
                        badge: db.orders.filter((o) => o.status === 'pending').length,
                    },
                    { key: '/portal/reviews', label: 'Đánh giá', icon: <FaStar />, perm: 'reviews.manage' },
                ],
            },
            {
                title: 'Kỹ thuật & Bảo trì',
                items: [
                    { key: '/portal/projects', label: 'Công trình', icon: <FaBuilding />, perm: 'projects.view' },
                    {
                        key: '/portal/schedule', label: 'Lịch công việc', icon: <FaCalendarCheck />, perm: 'maintenance.update',
                        badge: db.workOrders.filter((w) => w.technicianId === user?.id && w.status === 'pending').length,
                    },
                ],
            },
            {
                title: 'Kế toán',
                items: [
                    { key: '/portal/invoices', label: 'Hóa đơn & công nợ', icon: <FaFileInvoiceDollar />, perm: 'invoices.manage' },
                    { key: '/portal/reports', label: 'Thống kê', icon: <FaChartBar />, perm: 'reports.view' },
                ],
            },
            {
                title: 'Hệ thống',
                items: [
                    { key: '/portal/products', label: 'Sản phẩm', icon: <FaBoxOpen />, perm: 'products.manage' },
                    { key: '/portal/documents', label: 'Tài liệu', icon: <FaBook />, perm: 'documents.manage' },
                    { key: '/portal/users', label: 'Tài khoản & phân quyền', icon: <FaUserShield />, perm: 'users.manage' },
                    { key: '/portal/settings', label: 'Cài đặt hệ thống', icon: <FaCog />, perm: 'settings.manage' },
                ],
            },
            { items: [{ key: '/portal/profile', label: 'Hồ sơ cá nhân', icon: <FaUserCog /> }] },
        ],
        [db.chats, db.quotes, db.orders, db.workOrders, user?.id],
    );

    const menuItems: MenuProps['items'] = groups
        .map((g) => ({ ...g, items: g.items.filter((i) => !i.perm || can(i.perm)) }))
        .filter((g) => g.items.length)
        .map((g, idx) => {
            const children = g.items.map((i) => ({
                key: i.key,
                icon: i.icon,
                label: (
                    <span className="flex items-center justify-between gap-2">
                        {i.label}
                        {!!i.badge && <Badge count={i.badge} size="small" />}
                    </span>
                ),
            }));
            return g.title ? { type: 'group' as const, key: `g${idx}`, label: g.title, children } : children;
        })
        .flat();

    const allKeys = groups.flatMap((g) => g.items.map((i) => i.key));
    const selectedKey =
        allKeys
            .filter((k) => location.pathname === k || location.pathname.startsWith(`${k}/`))
            .sort((a, b) => b.length - a.length)[0] ?? '/portal';

    const menu = (
        <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => {
                navigate(key);
                setDrawerOpen(false);
            }}
            className="border-0 bg-transparent"
        />
    );

    const sidebarHeader = (
        <div className="px-4 py-4 border-b border-[var(--border)]">
            <Link to="/portal">
                <Logo size={32} small />
            </Link>
            <div className="mt-3 text-xs text-[var(--text)]">
                Khu vực nội bộ · <b className="text-[var(--text-h)]">{user ? ROLE_LABELS[user.role] : ''}</b>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-[var(--bg)]">
            {screens.lg ? (
                <aside className="w-[250px] shrink-0 border-r border-[var(--border)] bg-white dark:bg-slate-900 sticky top-0 h-screen overflow-y-auto">
                    {sidebarHeader}
                    <div className="p-2">{menu}</div>
                </aside>
            ) : (
                <Drawer
                    placement="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    size={270}
                    styles={{ body: { padding: 0 } }}
                    title={null}
                    closable={false}
                >
                    {sidebarHeader}
                    <div className="p-2">{menu}</div>
                </Drawer>
            )}

            <div className="flex-1 min-w-0 flex flex-col">
                <header className="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 shadow-md border-b backdrop-blur-md bg-opacity-90" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
                    {!screens.lg && (
                        <Button type="text" aria-label="Mở menu" icon={<FaBars className="text-[var(--text-h)]" />} onClick={() => setDrawerOpen(true)} />
                    )}
                    <div className="flex-1" />
                    <Button type="text" icon={<FaGlobeAsia />} onClick={() => navigate('/')}>
                        <span className="hidden sm:inline">Xem website</span>
                    </Button>
                    <NotificationDropdown />
                    <AccountMenu />
                </header>
                <main className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

/** Thông báo trong trang nội bộ tính theo phiên NHÂN VIÊN. */
const PortalLayout = () => (
    <NotificationProvider>
        <PortalLayoutInner />
    </NotificationProvider>
);

export default PortalLayout;

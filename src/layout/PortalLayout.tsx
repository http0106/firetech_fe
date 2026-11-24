import { useState, type ReactNode } from 'react';
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
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo, Forbidden } from '../components/ui';
import NotificationDropdown from '../users/component/Notification';
import AccountMenu from './AccountMenu';
import { useStore } from '../store';
import { ROLE_LABELS, canOpen } from '../data/constants';

/**
 * Bố cục trang nội bộ /portal (Admin, Kinh doanh, Kỹ thuật, Kế toán).
 * PHÂN QUYỀN nằm ở 2 chỗ trong file này, cùng dùng hàm canOpen():
 *   1. Menu trái chỉ hiện các trang vai trò được mở.
 *   2. Gõ thẳng địa chỉ trang không được mở → hiện trang 403.
 */
type MenuItem = { page: string; label: string; icon: ReactNode };

/** Menu trái. `page` = phần sau "/portal/" ('' là trang Tổng quan). */
const MENU: { title?: string; items: MenuItem[] }[] = [
    { items: [{ page: '', label: 'Tổng quan', icon: <FaTachometerAlt /> }] },
    {
        title: 'Kinh doanh & CSKH',
        items: [
            { page: 'chat', label: 'Tư vấn trực tuyến', icon: <FaComments /> },
            { page: 'quotes', label: 'Yêu cầu báo giá', icon: <FaFileSignature /> },
            { page: 'orders', label: 'Đơn hàng', icon: <FaShoppingBag /> },
            { page: 'reviews', label: 'Đánh giá', icon: <FaStar /> },
        ],
    },
    {
        title: 'Kỹ thuật & Bảo trì',
        items: [
            { page: 'projects', label: 'Công trình', icon: <FaBuilding /> },
            { page: 'schedule', label: 'Lịch công việc', icon: <FaCalendarCheck /> },
        ],
    },
    {
        title: 'Kế toán',
        items: [
            { page: 'invoices', label: 'Hóa đơn & công nợ', icon: <FaFileInvoiceDollar /> },
            { page: 'reports', label: 'Thống kê', icon: <FaChartBar /> },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { page: 'products', label: 'Sản phẩm', icon: <FaBoxOpen /> },
            { page: 'documents', label: 'Tài liệu', icon: <FaBook /> },
            { page: 'users', label: 'Tài khoản & phân quyền', icon: <FaUserShield /> },
            { page: 'settings', label: 'Cài đặt hệ thống', icon: <FaCog /> },
        ],
    },
    { items: [{ page: 'profile', label: 'Hồ sơ cá nhân', icon: <FaUserCog /> }] },
];

const pathOf = (page: string) => (page ? `/portal/${page}` : '/portal');

const PortalLayout = () => {
    const { db, user } = useStore();
    const location = useLocation();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Chưa đăng nhập → về trang đăng nhập. Khách hàng không được vào khu nội bộ.
    if (!user) return <Navigate to={`/portal/login?redirect=${location.pathname}`} replace />;
    if (user.role === 'customer') return <Forbidden />;

    // Trang hiện tại, ví dụ /portal/chat → 'chat'
    const currentPage = location.pathname.split('/')[2] ?? '';

    // Số việc đang chờ, hiện thành chấm đỏ cạnh menu
    const badges: Record<string, number> = {
        chat: db.chats.filter((c) => c.status === 'open' && c.unreadByStaff > 0).length,
        quotes: db.quotes.filter((q) => q.status === 'new').length,
        orders: db.orders.filter((o) => o.status === 'pending').length,
        schedule: db.workOrders.filter((w) => w.technicianId === user.id && w.status === 'pending').length,
    };

    // Dựng menu antd từ MENU, bỏ các trang vai trò này không được mở
    const menuItems: MenuProps['items'] = [];
    for (const group of MENU) {
        const items = group.items
            .filter((item) => canOpen(user.role, item.page))
            .map((item) => ({
                key: pathOf(item.page),
                icon: item.icon,
                label: (
                    <span className="flex items-center justify-between gap-2">
                        {item.label}
                        {!!badges[item.page] && <Badge count={badges[item.page]} size="small" />}
                    </span>
                ),
            }));
        if (items.length === 0) continue;
        if (group.title) menuItems.push({ type: 'group', key: group.title, label: group.title, children: items });
        else menuItems.push(...items);
    }

    const menu = (
        <Menu
            mode="inline"
            selectedKeys={[pathOf(currentPage)]}
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
                <Logo small />
            </Link>
            <div className="mt-3 text-xs text-[var(--text)]">
                Khu vực nội bộ · <b className="text-[var(--text-h)]">{ROLE_LABELS[user.role]}</b>
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
                    {/* Trang không thuộc vai trò này → 403 */}
                    {canOpen(user.role, currentPage) ? <Outlet /> : <Forbidden />}
                </main>
            </div>
        </div>
    );
};

export default PortalLayout;

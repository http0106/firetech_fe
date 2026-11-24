import type { ReactNode } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    FaBuilding,
    FaCalendarCheck,
    FaClipboardList,
    FaCog,
    FaComments,
    FaFileInvoiceDollar,
    FaFileSignature,
    FaHome,
    FaMoon,
    FaSignInAlt,
    FaSignOutAlt,
    FaSun,
    FaTachometerAlt,
    FaUser,
    FaUserCog,
    FaUserPlus,
    FaUserShield,
    FaUserTie,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ROLE_LABELS } from '../data/constants';
import type { Role } from '../types';

/**
 * NÚT TÀI KHOẢN (hình người) trên Header website và trang nội bộ.
 * Bấm vào → mở menu. Menu khác nhau theo từng đối tượng (xem LINKS bên dưới),
 * cuối menu luôn có nút đổi giao diện sáng / tối, đã đăng nhập thì có thêm "Đăng xuất".
 */
type Link = { path: string; label: string; icon: ReactNode };

/** Các trang trong menu của từng đối tượng. Muốn thêm/bớt → sửa ở đây. */
const LINKS: Record<Role | 'guest', Link[]> = {
    // Chưa đăng nhập
    guest: [
        { path: '/login', label: 'Đăng nhập', icon: <FaSignInAlt /> },
        { path: '/register', label: 'Đăng ký tài khoản', icon: <FaUserPlus /> },
        { path: '/portal/login', label: 'Nhân viên đăng nhập', icon: <FaUserTie /> },
    ],
    customer: [
        { path: '/account', label: 'Tổng quan tài khoản', icon: <FaHome /> },
        { path: '/account/orders', label: 'Đơn hàng của tôi', icon: <FaClipboardList /> },
        { path: '/account/projects', label: 'Công trình & bảo trì', icon: <FaBuilding /> },
        { path: '/account/quotes', label: 'Báo giá của tôi', icon: <FaFileSignature /> },
        { path: '/account/profile', label: 'Thông tin tài khoản', icon: <FaUserCog /> },
    ],
    // Nhân viên: trang quản lý + lối tắt tới việc chính của vai trò + hồ sơ
    admin: [
        { path: '/portal', label: 'Trang quản lý', icon: <FaTachometerAlt /> },
        { path: '/portal/users', label: 'Tài khoản & phân quyền', icon: <FaUserShield /> },
        { path: '/portal/settings', label: 'Cài đặt hệ thống', icon: <FaCog /> },
        { path: '/portal/profile', label: 'Hồ sơ cá nhân', icon: <FaUserCog /> },
    ],
    sales: [
        { path: '/portal', label: 'Trang quản lý', icon: <FaTachometerAlt /> },
        { path: '/portal/chat', label: 'Tư vấn trực tuyến', icon: <FaComments /> },
        { path: '/portal/quotes', label: 'Yêu cầu báo giá', icon: <FaFileSignature /> },
        { path: '/portal/profile', label: 'Hồ sơ cá nhân', icon: <FaUserCog /> },
    ],
    technician: [
        { path: '/portal', label: 'Trang quản lý', icon: <FaTachometerAlt /> },
        { path: '/portal/schedule', label: 'Lịch công việc', icon: <FaCalendarCheck /> },
        { path: '/portal/profile', label: 'Hồ sơ cá nhân', icon: <FaUserCog /> },
    ],
    accountant: [
        { path: '/portal', label: 'Trang quản lý', icon: <FaTachometerAlt /> },
        { path: '/portal/invoices', label: 'Hóa đơn & công nợ', icon: <FaFileInvoiceDollar /> },
        { path: '/portal/profile', label: 'Hồ sơ cá nhân', icon: <FaUserCog /> },
    ],
};

const AccountMenu = () => {
    const { user, logout, dark, toggleDark } = useStore();
    const navigate = useNavigate();

    // Dựng menu từng phần
    const items: NonNullable<MenuProps['items']> = [];

    // 1. Đã đăng nhập: dòng đầu là tên + chức danh
    if (user) {
        items.push({
            key: 'who',
            disabled: true,
            label: (
                <div className="leading-tight py-1">
                    <b className="text-[var(--text-h)]">{user.name}</b>
                    <div className="text-xs">{user.position ?? ROLE_LABELS[user.role]}</div>
                </div>
            ),
        });
        items.push({ type: 'divider' });
    }

    // 2. Các trang theo đối tượng
    for (const link of LINKS[user?.role ?? 'guest']) {
        items.push({ key: link.path, label: link.label, icon: link.icon, onClick: () => navigate(link.path) });
    }

    // 3. Đổi giao diện sáng / tối
    items.push({ type: 'divider' });
    items.push({ key: 'theme', label: dark ? 'Giao diện sáng' : 'Giao diện tối', icon: dark ? <FaSun /> : <FaMoon />, onClick: toggleDark });

    // 4. Đã đăng nhập: đăng xuất
    if (user) {
        items.push({
            key: 'logout',
            label: 'Đăng xuất',
            icon: <FaSignOutAlt />,
            danger: true,
            onClick: () => {
                // Về trang chủ TRƯỚC rồi mới đăng xuất — nếu không, trang đang đứng
                // (/portal, /account) sẽ thấy "chưa đăng nhập" và tự chuyển sang trang đăng nhập.
                navigate('/', { flushSync: true });
                logout();
            },
        });
    }

    return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <button
                type="button"
                aria-label="Menu tài khoản"
                title={user?.name ?? 'Tài khoản'}
                className="w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-[#FF3333]/50 shadow-sm border-0 cursor-pointer transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--text-h)', color: 'var(--bg)' }}
            >
                <FaUser className="w-4 h-4" />
            </button>
        </Dropdown>
    );
};

export default AccountMenu;

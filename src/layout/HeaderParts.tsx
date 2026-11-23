import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { FaUser } from 'react-icons/fa';
import { IoSettings } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Nút tài khoản khi đã đăng nhập — đúng Dropdown tài khoản trong Header gốc (đoạn từng bị comment),
 * giữ nguyên các mục My Account / Profile / Billing / Settings, nối vào trang thật và thêm Log out.
 * Dùng chung cho website (khách hàng) và trang nội bộ (nhân viên).
 */
export const AccountMenu = () => {
    const { user, scope, homePath, loginPath, logout, can } = useAuth();
    const navigate = useNavigate();
    if (!user) return null;

    const billingPath = scope === 'customer' ? '/account/orders' : can('invoices.manage') ? '/portal/invoices' : homePath;
    const settingsPath = scope === 'staff' && can('settings.manage') ? '/portal/settings' : `${homePath}/profile`;

    // Dropdown tài khoản
    const accountItems: MenuProps['items'] = [
        { key: '1', label: 'My Account', disabled: true },
        { type: 'divider' },
        { key: '2', label: 'Profile', onClick: () => navigate(`${homePath}/profile`) },
        { key: '3', label: 'Billing', onClick: () => navigate(billingPath) },
        {
            key: '4',
            label: 'Settings',
            icon: <IoSettings />,
            onClick: () => navigate(settingsPath)
        },
        { type: 'divider' },
        {
            key: '5',
            label: 'Log out',
            danger: true,
            onClick: () => {
                logout();
                navigate(scope === 'customer' ? '/' : loginPath);
            }
        }
    ];

    return (
        <Dropdown menu={{ items: accountItems }}>
            <a
                onClick={(e) => { e.preventDefault(); navigate(homePath); }}
                className="no-underline"
                title={user.name}
            >
                <div className="flex items-center cursor-pointer group pl-1">
                    <div
                        className="
                            w-9 h-9 rounded-full
                            flex items-center justify-center
                            font-bold text-sm ring-2
                            ring-[#FF3333]/50
                            transition-all shadow-sm
                        "
                        style={{
                            backgroundColor: 'var(--text-h)',
                            color: 'var(--bg)'
                        }}
                    >
                        <FaUser className="w-4 h-4" />
                    </div>
                </div>
            </a>
        </Dropdown>
    );
};

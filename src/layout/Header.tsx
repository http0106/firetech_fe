import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from 'antd';
import type { IconType } from 'react-icons';
import {
    FaSearch,
    FaBars,
    FaTimes,
    FaHome,
    FaFireExtinguisher,
    FaDraftingCompass,
    FaShieldAlt,
    FaChevronDown,
    FaFileInvoiceDollar,
} from 'react-icons/fa';
import { HiMiniInformationCircle } from 'react-icons/hi2';
import NotificationDropdown from '../users/component/Notification';
import CartDropdown from '../users/component/CartDropdown';
import AccountMenu from './AccountMenu';
import { useStore } from '../store';

const LOGO_SRC = 'https://pccctrucbinh.vn/wp-content/themes/truc-binh-pccc/assets/img/logo.png';

type MenuItem = { name: string; href: string; icon: IconType; submenu?: { name: string; href: string }[] };

// Menu điều hướng
const MENU: MenuItem[] = [
    { name: 'Trang chủ', href: '/', icon: FaHome },
    {
        name: 'Thiết bị PCCC',
        href: '/products',
        icon: FaFireExtinguisher,
        submenu: [
            { name: 'Bình chữa cháy', href: '/products?category=binh-chua-chay' },
            { name: 'Hệ thống báo cháy', href: '/products?category=bao-chay' },
            { name: 'Vòi & Trụ chữa cháy', href: '/products?category=voi-tru' },
            { name: 'Trang thiết bị bảo hộ', href: '/products?category=bao-ho' },
        ],
    },
    {
        name: 'Tư vấn & Thiết kế',
        href: '/services',
        icon: FaDraftingCompass,
        submenu: [
            { name: 'Thẩm duyệt PCCC', href: '/services#approval' },
            { name: 'Thiết kế hệ thống', href: '/services#design' },
            { name: 'Nghiệm thu & Cấp phép', href: '/services#acceptance' },
        ],
    },
    { name: 'Giám sát & Cứu hộ', href: '/monitoring', icon: FaShieldAlt },
    { name: 'Giới thiệu', href: '/introduction', icon: HiMiniInformationCircle },
];

const inputStyle = { backgroundColor: 'var(--bg)', color: 'var(--text-h)', borderColor: 'var(--border)' };

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useStore();

    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Cuộn xuống thì ẩn hàng trên (logo, tìm kiếm), chỉ giữ hàng menu
    const [isTopVisible, setIsTopVisible] = useState(true);

    useEffect(() => {
        const onScroll = () => {
            // Ẩn khi > 180px, hiện lại khi < 80px (2 mốc khác nhau để Header không bị nháy)
            if (window.scrollY > 180) {
                setIsTopVisible(false);
                setMobileSearchOpen(false);
                setMobileMenuOpen(false);
            } else if (window.scrollY < 80) {
                setIsTopVisible(true);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Menu đang chọn: so đường dẫn hiện tại với href (bỏ phần ?... và #...)
    const isActive = (href: string) => {
        const path = href.split(/[?#]/)[0];
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Tìm kiếm: Enter → trang sản phẩm với từ khóa
    const search = (value: string) => {
        setMobileSearchOpen(false);
        navigate(value.trim() ? `/products?q=${encodeURIComponent(value.trim())}` : '/products');
    };

    const renderMenuItem = (item: MenuItem, mobile = false) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
            <div key={item.name} className={mobile ? 'flex flex-col' : 'relative group'}>
                <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-1.5 ${mobile ? 'px-3 py-2 rounded-lg' : 'px-3 py-2.5 rounded-lg my-1'} transition-all duration-200 no-underline ${
                        active ? 'text-[#FF4D4D] font-semibold bg-red-500/10' : 'hover:text-[#FF4D4D] hover:bg-neutral-500/5'
                    }`}
                    style={{ color: active ? '#FF4D4D' : 'var(--text-h)', textDecoration: 'none' }}
                >
                    <Icon className={`w-3.5 h-3.5 transition-colors ${active ? 'text-[#FF4D4D]' : 'opacity-70 group-hover:opacity-100'}`} />
                    <span>{item.name}</span>
                    {item.submenu && (
                        <FaChevronDown className={`w-2.5 h-2.5 ml-0.5 opacity-60 ${mobile ? '' : 'group-hover:rotate-180'} transition-transform duration-200`} />
                    )}
                </Link>

                {/* Menu con — máy tính: hiện khi rê chuột */}
                {!mobile && item.submenu && (
                    <div
                        className="absolute top-full left-0 mt-1 w-52 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5 border backdrop-blur-xl"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                    >
                        {item.submenu.map((sub) => (
                            <Link
                                key={sub.href}
                                to={sub.href}
                                className="block px-3 py-2 text-xs font-medium rounded-lg transition-colors hover:text-[#FF4D4D] hover:bg-red-500/10 no-underline"
                                style={{ color: 'var(--text-h)', textDecoration: 'none' }}
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Menu con — điện thoại: luôn hiện bên dưới */}
                {mobile && item.submenu && (
                    <div className="pl-7 flex flex-col gap-1 my-0.5">
                        {item.submenu.map((sub) => (
                            <Link
                                key={sub.href}
                                to={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 text-xs transition-colors hover:text-[#FF4D4D] no-underline"
                                style={{ color: 'var(--text)', textDecoration: 'none' }}
                            >
                                - {sub.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <header
            className="w-full sticky top-0 z-50 shadow-md border-b backdrop-blur-md bg-opacity-90"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
            <div className="max-w-[1280px] mx-auto px-3 sm:px-4">
                {/* HÀNG TRÊN: LOGO VÀ CÔNG CỤ (trên điện thoại luôn hiển thị) */}
                <div className={isTopVisible ? 'block' : 'block md:hidden'}>
                    <div className="h-16 flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/" className="h-full flex items-center cursor-pointer no-underline">
                            <img src={LOGO_SRC} className="h-10 object-contain" alt="Logo PCCC" />
                            <div className="mx-1 sm:mx-2 tracking-widest font-bold flex items-center">
                                <span className="text-[#FF3333] text-base sm:text-2xl -mt-0.5 mr-1 drop-shadow-sm">FIRE</span>
                                <span className="text-[#3399FF] text-base sm:text-2xl drop-shadow-sm">TECH</span>
                            </div>
                        </Link>

                        {/* Công cụ */}
                        <div className="flex items-center gap-1 sm:gap-5">
                            {/* Tìm kiếm — máy tính */}
                            <div className="hidden sm:block w-52 lg:w-72">
                                <Input
                                    placeholder="Tìm kiếm thiết bị, giải pháp..."
                                    prefix={<FaSearch className="w-3.5 h-3.5 mr-1.5 opacity-60" style={{ color: 'var(--text)' }} />}
                                    allowClear
                                    onPressEnter={(e) => search(e.currentTarget.value)}
                                    className="rounded-full py-1.5 px-4 text-xs transition-all shadow-inner"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Tìm kiếm — điện thoại: nút mở ô tìm kiếm */}
                            <div className="sm:hidden flex items-center">
                                <Button
                                    type="text"
                                    shape="circle"
                                    icon={<FaSearch className="w-4 h-4" style={{ color: 'var(--text-h)' }} />}
                                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                />
                            </div>

                            <CartDropdown />
                            <NotificationDropdown />

                            {/* Chưa đăng nhập: nút Đăng nhập (màn hình lớn) */}
                            {!user && (
                                <Button type="primary" danger className="hidden sm:inline-flex" onClick={() => navigate('/login')}>
                                    <span className="flex items-center gap-1">Đăng nhập</span>
                                </Button>
                            )}

                            {/* Menu tài khoản: luôn hiện (có nút sáng/tối; khách vãng lai có Đăng nhập / Đăng ký) */}
                            <AccountMenu />

                            {/* Nút mở menu — điện thoại */}
                            <Button
                                type="text"
                                shape="circle"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                icon={
                                    mobileMenuOpen ? (
                                        <FaTimes className="w-5 h-5" style={{ color: 'var(--text-h)' }} />
                                    ) : (
                                        <FaBars className="w-5 h-5" style={{ color: 'var(--text-h)' }} />
                                    )
                                }
                                className="md:hidden flex items-center justify-center transition-all"
                            />
                        </div>
                    </div>

                    {/* Ô tìm kiếm — điện thoại */}
                    {mobileSearchOpen && (
                        <div className="sm:hidden px-2 pb-3 pt-1 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                            <Input
                                placeholder="Tìm kiếm thiết bị, giải pháp PCCC..."
                                prefix={<FaSearch className="mr-1 opacity-60" style={{ color: 'var(--text)' }} />}
                                allowClear
                                autoFocus
                                onPressEnter={(e) => search(e.currentTarget.value)}
                                className="rounded-full py-1.5 text-xs shadow-inner"
                                style={inputStyle}
                            />
                            <Button type="text" shape="circle" icon={<FaTimes style={{ color: 'var(--text)' }} />} onClick={() => setMobileSearchOpen(false)} />
                        </div>
                    )}
                </div>

                {/* HÀNG DƯỚI: MENU — máy tính */}
                <nav
                    className={`${isTopVisible ? '' : 'py-2'} hidden md:flex items-center justify-between text-xs font-medium border-t`}
                    style={{ borderColor: 'var(--border)' }}
                >
                    <Link to="/">
                        <img src={LOGO_SRC} className={`h-10 object-contain mr-5 ${isTopVisible ? 'hidden' : 'block'}`} alt="Logo PCCC" />
                    </Link>

                    <div className="flex items-center gap-1">{MENU.map((item) => renderMenuItem(item))}</div>

                    <div className="flex justify-between items-center">
                        {/* Khi hàng trên bị ẩn: đưa giỏ hàng & thông báo xuống hàng menu */}
                        {!isTopVisible && (
                            <div className="mx-5 flex gap-2">
                                <CartDropdown />
                                <NotificationDropdown />
                            </div>
                        )}
                        <Button type="primary" danger onClick={() => navigate('/contact')}>
                            <span>
                                <FaFileInvoiceDollar className="w-3.5 h-3.5" />
                                <span>Nhận Báo Giá</span>
                            </span>
                        </Button>
                    </div>
                </nav>

                {/* MENU — điện thoại */}
                {mobileMenuOpen && (
                    <nav className="md:hidden py-3 border-t flex flex-col gap-1 text-xs font-semibold" style={{ borderColor: 'var(--border)' }}>
                        {MENU.map((item) => renderMenuItem(item, true))}
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;

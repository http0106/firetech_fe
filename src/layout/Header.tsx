
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
    FaSearch,
    FaUser,
    FaBars,
    FaTimes,
    FaHome,
    FaFireExtinguisher,
    FaDraftingCompass,
    FaShieldAlt,
    FaChevronDown,
    FaFileInvoiceDollar,
} from 'react-icons/fa';

import { Button, Input } from 'antd';
import { HiMiniInformationCircle } from 'react-icons/hi2';
import NotificationDropdown from '../users/component/Notification';
import CartDropdown from '../users/component/CartDropdown';
import { AccountMenu } from './HeaderParts';
import { useAuth } from '../context/AuthContext';

/** Nút tài khoản: đã đăng nhập → menu tài khoản; chưa → "Đăng nhập" (quay lại đúng trang sau khi đăng nhập). */
const AccountButton = () => {
    const { user, loginPath } = useAuth();
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    if (user) return <AccountMenu />;
    return (
        <Button
            type="primary"
            danger
            aria-label="Đăng nhập"
            icon={<FaUser className="sm:hidden" />}
            onClick={() => navigate(`${loginPath}?redirect=${encodeURIComponent(pathname + search)}`)}
        >
            {/* Màn hình nhỏ chỉ hiện biểu tượng để Header không bị tràn */}
            <span className="hidden sm:inline">Đăng nhập</span>
        </Button>
    );
};

// Menu điều hướng
const menuItems = [
    {
        name: 'Trang chủ',
        href: '/',
        icon: FaHome,
        hasDropdown: false
    },
    {
        name: 'Thiết bị PCCC',
        href: '/products',
        icon: FaFireExtinguisher,
        hasDropdown: true,
        submenu: [
            { name: 'Bình chữa cháy', href: '/products#fire-extinguishers' },
            { name: 'Hệ thống báo cháy', href: '/products#fire-alarm' },
            { name: 'Vòi & Trụ chữa cháy', href: '/products#fire-hydrant' },
            { name: 'Trang thiết bị bảo hộ', href: '/products#protective-equipment' }
        ]
    },
    {
        name: 'Tư vấn & Thiết kế',
        href: '/services',
        icon: FaDraftingCompass,
        hasDropdown: true,
        submenu: [
            { name: 'Thẩm duyệt PCCC', href: '/services#approval' },
            { name: 'Thiết kế hệ thống', href: '/services#design' },
            { name: 'Nghiệm thu & Cấp phép', href: '/services#acceptance' }
        ]
    },
    {
        name: 'Giám sát & Cứu hộ',
        href: '/monitoring',
        icon: FaShieldAlt,
        hasDropdown: false
    },
    {
        name: 'Giới thiệu',
        href: '/introduction',
        icon: HiMiniInformationCircle,
        hasDropdown: false
    }
];

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    // Ô tìm kiếm hiển thị đúng từ khóa đang lọc khi ở trang sản phẩm
    const currentQuery = location.pathname === '/products' ? params.get('q') ?? '' : '';

    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isTopVisible, setIsTopVisible] = useState(true);

    const search = (value: string) => {
        const q = value.trim();
        navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
        setMobileSearchOpen(false);
    };

    const ticking = useRef(false);

    // Tự động xác định menu đang được chọn dựa trên URL
    const isActive = (href: string) => {
        const path = href.split('#')[0];

        if (path === '/') {
            return location.pathname === '/';
        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(path + '/')
        );
    };

    // Đóng menu mobile khi chuyển trang
    useEffect(() => {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
    }, [location.pathname]);

    // Xử lý ẩn/hiện Header khi cuộn
    useEffect(() => {
        const handleScroll = () => {
            if (ticking.current) return;

            ticking.current = true;

            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                if (currentScrollY > 180) {
                    setIsTopVisible(false);
                    setMobileSearchOpen(false);
                    setMobileMenuOpen(false);
                } else if (currentScrollY < 80) {
                    setIsTopVisible(true);
                }

                ticking.current = false;
            });
        };

        window.addEventListener('scroll', handleScroll, {
            passive: true
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Component hiển thị một menu item
    const renderMenuItem = (item: typeof menuItems[number], mobile = false) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
            <div
                key={item.name}
                className={mobile ? 'flex flex-col' : 'relative group'}
            >
                <Link
                    to={item.href}
                    onClick={() => {
                        if (mobile) {
                            setMobileMenuOpen(false);
                        }
                    }}
                    className={`
                        relative flex items-center gap-1.5
                        ${mobile
                            ? 'px-3 py-2 rounded-lg'
                            : 'px-3 py-2.5 rounded-lg my-1'
                        }
                        transition-all duration-200 no-underline
                        ${active
                            ? 'text-[#FF4D4D] font-semibold bg-red-500/10'
                            : 'hover:text-[#FF4D4D] hover:bg-neutral-500/5'
                        }
                    `}
                    style={{
                        color: active ? '#FF4D4D' : 'var(--text-h)',
                        textDecoration: 'none'
                    }}
                >
                    <Icon
                        className={`
                            w-3.5 h-3.5 transition-colors
                            ${active
                                ? 'text-[#FF4D4D]'
                                : 'opacity-70 group-hover:opacity-100'
                            }
                        `}
                    />

                    <span>{item.name}</span>

                    {item.hasDropdown && (
                        <FaChevronDown
                            className={`
                                w-2.5 h-2.5 ml-0.5 opacity-60
                                ${mobile ? '' : 'group-hover:rotate-180'}
                                transition-transform duration-200
                            `}
                        />
                    )}
                </Link>

                {/* Submenu Desktop */}
                {!mobile && item.hasDropdown && item.submenu && (
                    <div
                        className="
                            absolute top-full left-0 mt-1 w-52
                            rounded-xl shadow-2xl
                            opacity-0 invisible
                            group-hover:opacity-100
                            group-hover:visible
                            transition-all duration-200
                            z-50 p-1.5 border backdrop-blur-xl
                        "
                        style={{
                            backgroundColor: 'var(--bg)',
                            borderColor: 'var(--border)'
                        }}
                    >
                        {item.submenu.map((sub) => (
                            <Link
                                key={sub.href}
                                to={sub.href}
                                className="
                                    block px-3 py-2 text-xs font-medium
                                    rounded-lg transition-colors
                                    hover:text-[#FF4D4D]
                                    hover:bg-red-500/10 no-underline
                                "
                                style={{
                                    color: 'var(--text-h)',
                                    textDecoration: 'none'
                                }}
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Submenu Mobile */}
                {mobile && item.hasDropdown && item.submenu && (
                    <div className="pl-7 flex flex-col gap-1 my-0.5">
                        {item.submenu.map((sub) => (
                            <Link
                                key={sub.href}
                                to={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="
                                    py-1 text-xs transition-colors
                                    hover:text-[#FF4D4D] no-underline
                                "
                                style={{
                                    color: 'var(--text)',
                                    textDecoration: 'none'
                                }}
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
            className="
                w-full sticky top-0 z-50 shadow-md
                border-b backdrop-blur-md bg-opacity-90
            "
            style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)'
            }}
        >
            <div className="max-w-[1280px] mx-auto px-4">

                {/* HÀNG TRÊN: LOGO VÀ CÔNG CỤ */}
                <div className={isTopVisible ? 'block' : 'hidden'}>
                    <div className="h-16 flex justify-between items-center">

                        {/* Logo */}
                        <Link
                            to="/"
                            className="h-full flex items-center cursor-pointer no-underline"
                        >
                            <img
                                src="https://pccctrucbinh.vn/wp-content/themes/truc-binh-pccc/assets/img/logo.png"
                                className="h-8 sm:h-10 object-contain"
                                alt="Logo PCCC"
                            />

                            <div className="mx-1.5 sm:mx-2 tracking-wide sm:tracking-widest font-bold flex items-center">
                                <span className="text-[#FF3333] text-lg sm:text-2xl -mt-0.5 mr-1 drop-shadow-sm">
                                    FIRE
                                </span>
                                <span className="text-[#3399FF] text-lg sm:text-2xl drop-shadow-sm">
                                    TECH
                                </span>
                            </div>
                        </Link>

                        {/* Công cụ */}
                        <div className="flex items-center gap-1 sm:gap-5">

                            {/* Search Desktop */}
                            <div className="hidden sm:block w-52 lg:w-72">
                                <Input
                                    key={currentQuery}
                                    defaultValue={currentQuery}
                                    onPressEnter={(e) => search(e.currentTarget.value)}
                                    aria-label="Tìm kiếm sản phẩm"
                                    placeholder="Tìm kiếm thiết bị, giải pháp..."
                                    prefix={
                                        <FaSearch
                                            className="w-3.5 h-3.5 mr-1.5 opacity-60"
                                            style={{ color: 'var(--text)' }}
                                        />
                                    }
                                    allowClear
                                    className="rounded-full py-1.5 px-4 text-xs transition-all shadow-inner"
                                    style={{
                                        backgroundColor: 'var(--bg)',
                                        color: 'var(--text-h)',
                                        borderColor: 'var(--border)'
                                    }}
                                />
                            </div>

                            {/* Search Mobile */}
                            <div className="sm:hidden flex items-center">
                                <Button
                                    type="text"
                                    shape="circle"
                                    icon={
                                        <FaSearch
                                            className="w-4 h-4"
                                            style={{ color: 'var(--text-h)' }}
                                        />
                                    }
                                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                />
                            </div>

                            {/* Cart */}
                            <CartDropdown />

                            {/* Notification */}
                            <NotificationDropdown />

                            {/* Account */}
                            <AccountButton />

                            {/* Mobile Menu Button */}
                            <Button
                                type="text"
                                shape="circle"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                icon={
                                    mobileMenuOpen
                                        ? <FaTimes className="w-5 h-5" style={{ color: 'var(--text-h)' }} />
                                        : <FaBars className="w-5 h-5" style={{ color: 'var(--text-h)' }} />
                                }
                                className="md:hidden flex items-center justify-center transition-all"
                            />
                        </div>
                    </div>

                    {/* Mobile Search */}
                    {mobileSearchOpen && (
                        <div
                            className="
                                sm:hidden px-2 pb-3 pt-1
                                border-b flex items-center gap-2
                            "
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <Input
                                key={currentQuery}
                                defaultValue={currentQuery}
                                onPressEnter={(e) => search(e.currentTarget.value)}
                                aria-label="Tìm kiếm sản phẩm"
                                placeholder="Tìm kiếm thiết bị, giải pháp PCCC..."
                                prefix={
                                    <FaSearch
                                        className="mr-1 opacity-60"
                                        style={{ color: 'var(--text)' }}
                                    />
                                }
                                allowClear
                                autoFocus
                                className="rounded-full py-1.5 text-xs shadow-inner"
                                style={{
                                    backgroundColor: 'var(--bg)',
                                    color: 'var(--text-h)',
                                    borderColor: 'var(--border)'
                                }}
                            />

                            <Button
                                type="text"
                                shape="circle"
                                icon={<FaTimes style={{ color: 'var(--text)' }} />}
                                onClick={() => setMobileSearchOpen(false)}
                            />
                        </div>
                    )}
                </div>

                {/* HÀNG DƯỚI: MENU DESKTOP */}
                <nav
                    className={`
                        ${isTopVisible ? '' : 'py-2'}
                        hidden md:flex items-center justify-between
                        text-xs font-medium border-t
                    `}
                    style={{ borderColor: 'var(--border)' }}
                >
                    <Link to="/">
                        <img
                            src="https://pccctrucbinh.vn/wp-content/themes/truc-binh-pccc/assets/img/logo.png"
                            className={`h-10 object-contain mr-5 ${isTopVisible ? 'hidden' : 'block'}`}
                            alt="Logo PCCC"
                        />
                    </Link>

                    <div className="flex items-center gap-1">
                        {menuItems.map((item) => renderMenuItem(item))}
                    </div>

                    <div className="flex justify-between items-center">
                        {!isTopVisible && (
                            <div className="mx-5 flex items-center gap-2">
                                <CartDropdown />
                                <NotificationDropdown />
                                <AccountButton />
                            </div>
                        )}
                        <Button type="primary" danger icon={<FaFileInvoiceDollar className="w-3.5 h-3.5" />} onClick={() => navigate('/contact')}>
                            Nhận Báo Giá
                        </Button>

                    </div>
                </nav>

                {/* MENU MOBILE */}
                {mobileMenuOpen && (
                    <nav
                        className="
                            md:hidden py-3 border-t
                            flex flex-col gap-1 text-xs font-semibold
                        "
                        style={{ borderColor: 'var(--border)' }}
                    >
                        {menuItems.map((item) => renderMenuItem(item, true))}
                    </nav>
                )}

            </div>
        </header>
    );
};

export default Header;

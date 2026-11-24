import { Link } from 'react-router-dom';
import { FaClock, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { Logo } from '../components/ui';
import { useStore } from '../store';
import { CATEGORIES } from '../data/constants';

const YEAR = new Date().getFullYear();

/** Chân trang. Thông tin công ty lấy từ Cài đặt hệ thống (Admin chỉnh trong /portal/settings). */
const Footer = () => {
    const { settings } = useStore().db;

    const columns = [
        {
            title: 'Thiết bị PCCC',
            links: CATEGORIES.map((c) => ({ label: c.label, to: `/products?category=${c.key}` })),
        },
        {
            title: 'Dịch vụ',
            links: [
                { label: 'Tư vấn & thiết kế', to: '/services#design' },
                { label: 'Thẩm duyệt PCCC', to: '/services#approval' },
                { label: 'Nghiệm thu & cấp phép', to: '/services#acceptance' },
                { label: 'Giám sát & cứu hộ', to: '/monitoring' },
            ],
        },
        {
            title: 'Hỗ trợ khách hàng',
            links: [
                { label: 'Hướng dẫn sử dụng thiết bị', to: '/documents?type=guide' },
                { label: 'Bảo hành & hậu mãi', to: '/introduction#bao-hanh' },
                { label: 'Tra cứu lịch bảo trì', to: '/account/projects' },
                { label: 'So sánh sản phẩm', to: '/compare' },
                { label: 'Nhận báo giá', to: '/contact' },
            ],
        },
    ];

    return (
        <footer className="border-t mt-10" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <div className="max-w-[1280px] mx-auto px-4 py-10 grid gap-8 md:grid-cols-2 lg:grid-cols-5 text-xs">
                <div className="lg:col-span-2 space-y-3">
                    <Logo />
                    <p className="leading-relaxed max-w-sm" style={{ color: 'var(--text)' }}>
                        {settings.companyName} cung cấp thiết bị, tư vấn thiết kế, thi công lắp đặt và bảo trì hệ thống phòng cháy chữa cháy.
                    </p>
                    <ul className="space-y-1.5 list-none p-0 m-0" style={{ color: 'var(--text)' }}>
                        <li className="flex gap-2"><FaMapMarkerAlt className="mt-0.5 text-[#FF3333] shrink-0" />{settings.address}</li>
                        <li className="flex gap-2"><FaPhoneAlt className="mt-0.5 text-[#FF3333] shrink-0" />Hotline: <b style={{ color: 'var(--text-h)' }}>{settings.hotline}</b></li>
                        <li className="flex gap-2"><SiZalo className="mt-0.5 text-[#3399FF] shrink-0" />Zalo: {settings.zalo}</li>
                        <li className="flex gap-2"><FaEnvelope className="mt-0.5 text-[#FF3333] shrink-0" />{settings.email}</li>
                        <li className="flex gap-2"><FaClock className="mt-0.5 text-[#FF3333] shrink-0" />{settings.workingHours}</li>
                    </ul>
                </div>
                {columns.map((col) => (
                    <div key={col.title}>
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-h)' }}>{col.title}</h3>
                        <ul className="space-y-1.5 list-none p-0 m-0">
                            {col.links.map((l) => (
                                <li key={l.label}>
                                    <Link to={l.to} className="no-underline transition-colors hover:!text-[#FF4D4D]" style={{ color: 'var(--text)' }}>
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="max-w-[1280px] mx-auto px-4 py-3 flex flex-wrap justify-between gap-2 text-[11px]" style={{ color: 'var(--text)' }}>
                    <span>© {YEAR} {settings.companyName}.</span>
                    <Link to="/portal/login" className="no-underline hover:!text-[#FF4D4D]" style={{ color: 'var(--text)' }}>
                        Đăng nhập nội bộ
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

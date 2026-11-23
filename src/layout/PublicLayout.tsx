import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { FloatButton, Modal, QRCode, Tooltip } from 'antd';
import type { QRCodeProps } from 'antd';
import { createStaticStyles } from 'antd-style';
import { FaCommentDots, FaHeadset, FaPhoneAlt } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { BsArrowBarUp } from 'react-icons/bs';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ChatWidget, { useCustomerUnread } from '../users/component/ChatWidget';
import { useStore } from '../context/StoreContext';
import { NotificationProvider } from '../context/NotificationContext';

/**
 * Bố cục website công khai — trước đây là App.tsx, giữ nguyên các nút nổi và modal Zalo cũ.
 * Bổ sung: nút "Chat với tư vấn viên" trong nhóm nút hỗ trợ, Footer, tự cuộn tới #anchor.
 */

const classNames = createStaticStyles(({ css }) => ({
    root: css`
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    background: #ffffff;
  `,
}));

// Cấu hình riêng cho nút BackTop để tránh xung đột
const backTopProps: ComponentProps<typeof FloatButton.BackTop> = {
    showProgress: true,
    visibilityHeight: 200, // Hiện nút khi cuộn xuống 200px
};

/** Cuộn lên đầu khi đổi trang; cuộn tới phần tử khi URL có #anchor (vd /services#design). */
const ScrollManager = () => {
    const { pathname, hash } = useLocation();
    const prevPath = useRef(pathname);
    useEffect(() => {
        const pathChanged = prevPath.current !== pathname;
        prevPath.current = pathname;
        if (hash) {
            const timer = window.setTimeout(() => {
                const el = document.getElementById(decodeURIComponent(hash.slice(1)));
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                else if (pathChanged) window.scrollTo({ top: 0 });
            }, 60);
            return () => window.clearTimeout(timer);
        }
        // Chỉ cuộn lên đầu khi đổi trang — đổi bộ lọc (?q=, ?category=) giữ nguyên vị trí
        if (pathChanged) window.scrollTo({ top: 0 });
    }, [pathname, hash]);
    return null;
};

const PublicLayoutInner = () => {
    const { settings } = useStore().db;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const unread = useCustomerUnread();

    // Cấu hình riêng cho QRCode Zalo hỗ trợ (giảm size xuống 220 cho vừa vặn trong Modal)
    const qrCodeProps: QRCodeProps = {
        value: `https://zalo.me/${settings.zalo}`,
        size: 220,
        classNames,
    };

    return (
        <>
            <ScrollManager />
            <Header />

            {/* Nút Cuộn lên đầu trang */}
            <FloatButton.BackTop
                icon={<BsArrowBarUp size={22} />}
                {...backTopProps}
                style={{ insetInlineEnd: 20, bottom: 24 }}
                shape="circle"
            />

            {/* Nhóm nút Hỗ trợ trực tuyến (Chat, Zalo & Hotline) */}
            <FloatButton.Group
                className='animate-pulse'
                trigger="hover"
                type="primary"
                style={{ insetInlineEnd: 20, bottom: 78 }}
                icon={

                    <FaHeadset size={20} />

                }
            >
                <Tooltip placement="left" title={"Chat với tư vấn viên"}>
                    <FloatButton
                        badge={{ count: unread }}
                        onClick={() => { setChatOpen(true) }}
                        icon={<FaCommentDots size={18} className="text-red-500" />}
                        aria-label="Chat tư vấn"
                    />
                </Tooltip>
                <Tooltip placement="left" title={"Hỗ trợ qua Zalo"} >
                    <FloatButton onClick={() => { setIsModalOpen(true) }} icon={<SiZalo size={20} className="text-blue-500" />} />
                </Tooltip>
                <Tooltip placement="left" title={`Gọi Hotline: ${settings.hotline}`}>
                    <FloatButton href={`tel:${settings.hotline.replace(/\D/g, '')}`} icon={<FaPhoneAlt size={18} />} />
                </Tooltip>
            </FloatButton.Group>

            {/* Layout nội dung chính */}
            <div className="max-w-[1280px] mx-auto min-h-screen px-3 sm:px-4">
                <Outlet />
            </div>

            <Footer />

            <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />

            {/* Modal hiển thị mã QR Zalo hỗ trợ */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-gray-800 dark:text-slate-100">
                        <SiZalo className="text-blue-500 text-xl" />
                        <span>Quét mã Zalo hỗ trợ kỹ thuật PCCC</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); }}
                footer={null}
                centered
                width={380}
            >
                <div className="flex flex-col items-center justify-center py-4 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-gray-100 dark:border-slate-700">
                        <QRCode {...qrCodeProps} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center m-0">
                        Sử dụng ứng dụng Zalo để quét mã QR nhận tư vấn thiết bị PCCC 24/7.
                    </p>
                </div>
            </Modal>
        </>
    );
};

/** Thông báo trên website tính theo phiên KHÁCH HÀNG. */
const PublicLayout = () => (
    <NotificationProvider>
        <PublicLayoutInner />
    </NotificationProvider>
);

export default PublicLayout;

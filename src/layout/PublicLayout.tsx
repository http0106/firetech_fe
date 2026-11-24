import { useEffect, useState } from 'react';
import { Badge, FloatButton, Modal, QRCode, Tooltip } from 'antd';
import { FaCommentDots, FaHeadset, FaPhoneAlt } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { BsArrowBarUp } from 'react-icons/bs';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ChatWidget, { useCustomerUnread } from '../users/component/ChatWidget';
import { useStore } from '../store';

/**
 * Bố cục website công khai: Header, nội dung trang, Footer,
 * nút nổi (lên đầu trang, chat, Zalo, hotline) và modal mã QR Zalo.
 */
const PublicLayout = () => {
    const { settings } = useStore().db;
    const { pathname, hash } = useLocation();
    const [zaloOpen, setZaloOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const unread = useCustomerUnread();

    // Đổi trang → cuộn lên đầu. URL có #id (vd /services#design) → cuộn tới phần đó.
    useEffect(() => {
        if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0 });
    }, [pathname, hash]);

    return (
        <>
            <Header />

            {/* Nút cuộn lên đầu trang */}
            <FloatButton.BackTop
                icon={<BsArrowBarUp size={22} />}
                showProgress
                visibilityHeight={200}
                style={{ insetInlineEnd: 20, bottom: 24 }}
                shape="circle"
            />

            {/* Nhóm nút hỗ trợ trực tuyến (Chat, Zalo, Hotline) */}
            <FloatButton.Group
                className="animate-pulse"
                trigger="hover"
                type="primary"
                style={{ insetInlineEnd: 20, bottom: 78 }}
                icon={
                   
                        <FaHeadset size={20} />
                
                }
            >
                <Tooltip placement="left" title="Chat với tư vấn viên">
                    <FloatButton
                        badge={{ count: unread }}
                        onClick={() => setChatOpen(true)}
                        icon={<FaCommentDots size={18} className="text-red-500" />}
                        aria-label="Chat tư vấn"
                    />
                </Tooltip>
                <Tooltip placement="left" title="Hỗ trợ qua Zalo">
                    <FloatButton onClick={() => setZaloOpen(true)} icon={<SiZalo size={20} className="text-blue-500" />} />
                </Tooltip>
                <Tooltip placement="left" title={`Gọi Hotline: ${settings.hotline}`}>
                    <FloatButton href={`tel:${settings.hotline.replace(/\D/g, '')}`} icon={<FaPhoneAlt size={18} />} />
                </Tooltip>
            </FloatButton.Group>

            {/* Nội dung trang */}
            <div className="max-w-[1280px] mx-auto min-h-screen px-3 sm:px-4">
                <Outlet />
            </div>

            <Footer />

            <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />

            {/* Modal mã QR Zalo */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-gray-800 dark:text-slate-100">
                        <SiZalo className="text-blue-500 text-xl" />
                        <span>Quét mã Zalo hỗ trợ kỹ thuật PCCC</span>
                    </div>
                }
                open={zaloOpen}
                onCancel={() => setZaloOpen(false)}
                footer={null}
                centered
                width={380}
            >
                <div className="flex flex-col items-center justify-center py-4 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-gray-100 dark:border-slate-700">
                        <div className="border border-slate-200 rounded-xl p-4 bg-white">
                            <QRCode value={`https://zalo.me/${settings.zalo}`} size={220} bordered={false} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center m-0">
                        Sử dụng ứng dụng Zalo để quét mã QR nhận tư vấn thiết bị PCCC 24/7.
                    </p>
                </div>
            </Modal>
        </>
    );
};

export default PublicLayout;

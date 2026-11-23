import { useState } from 'react';
import { Badge, Button, Dropdown, Empty } from 'antd';
import { FaBell, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppNotification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/format';

/**
 * Chuông thông báo — đọc NotificationContext (thông báo TÍNH từ dữ liệu thật theo vai trò/quyền:
 * lịch bảo trì, bảo hành, báo giá, đơn hàng, tin nhắn...). Dùng chung cho website và trang nội bộ.
 * Bấm một thông báo → đánh dấu đã đọc và mở trang liên quan.
 */
const LEVEL_STYLE: Record<AppNotification['level'], { icon: typeof FaInfoCircle; className: string }> = {
    info: { icon: FaInfoCircle, className: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
    warning: { icon: FaExclamationTriangle, className: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400' },
    critical: { icon: FaTimesCircle, className: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
};

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, homePath, loginPath } = useAuth();
    const { items, unread, markRead, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);

    const go = (path: string) => {
        setOpen(false);
        navigate(path);
    };

    const loginUrl = `${loginPath}?redirect=${encodeURIComponent(location.pathname + location.search)}`;

    return (
        <Dropdown
            trigger={['click']}
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            popupRender={() => (
                <div className="w-[360px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-base font-bold m-0 text-gray-800 dark:text-slate-100">Thông báo</h3>
                            <span className="text-xs text-gray-400 dark:text-slate-400">
                                {user ? (unread ? `Bạn có ${unread} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo') : 'Đăng nhập để nhận thông báo'}
                            </span>
                        </div>
                        {user && (
                            <Button type="text" size="small" icon={<FaCheck />} onClick={markAllRead} disabled={!unread}>
                                Đọc tất cả
                            </Button>
                        )}
                    </div>

                    <div className="max-h-[380px] overflow-y-auto">
                        {!user ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                className="py-8 px-4"
                                description={
                                    <span className="text-gray-500 dark:text-slate-400 text-sm">
                                        Theo dõi đơn hàng, báo giá, lịch bảo trì và hạn bảo hành thiết bị của bạn.
                                    </span>
                                }
                            >
                                <Button type="primary" danger onClick={() => go(loginUrl)}>
                                    Đăng nhập
                                </Button>
                            </Empty>
                        ) : items.length > 0 ? (
                            <div className="p-1">
                                {items.map((n) => {
                                    const { icon: Icon, className } = LEVEL_STYLE[n.level];
                                    return (
                                        <button
                                            key={n.id}
                                            type="button"
                                            onClick={() => {
                                                markRead(n.id);
                                                go(n.link);
                                            }}
                                            style={{ fontFamily: 'inherit' }}
                                            className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border-0 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-slate-800/60 ${
                                                n.read ? 'bg-transparent' : 'bg-blue-50 dark:bg-blue-950/40'
                                            }`}
                                        >
                                            <span className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${className}`}>
                                                <Icon size={16} />
                                            </span>
                                            <span className="flex-1 min-w-0">
                                                <span className={`block text-sm text-gray-900 dark:text-slate-100 ${n.read ? 'font-medium' : 'font-semibold'}`}>{n.title}</span>
                                                {n.description && <span className="block text-xs text-gray-600 dark:text-slate-300 mt-0.5 line-clamp-2">{n.description}</span>}
                                                <span className="block text-[11px] text-gray-400 dark:text-slate-500 mt-1">{formatDate(n.at)}</span>
                                            </span>
                                            {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={<span className="text-gray-500 dark:text-slate-400">Chưa có thông báo</span>}
                                className="py-8"
                            />
                        )}
                    </div>

                    {user && (
                        <div className="border-t border-gray-100 dark:border-slate-800 p-2 text-center">
                            <Button type="text" block className="text-sm font-semibold text-blue-600 dark:text-blue-400" onClick={() => go(homePath)}>
                                {user.role === 'customer' ? 'Xem trang tài khoản' : 'Về trang tổng quan'}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        >
            <button
                type="button"
                aria-label={user ? `Thông báo (${unread} chưa đọc)` : 'Thông báo'}
                className="cursor-pointer p-2 rounded-full transition-colors hover:bg-neutral-500/10 flex items-center justify-center bg-transparent border-0"
                style={{ color: 'var(--text-h)' }}
            >
                <Badge count={unread} overflowCount={99} offset={[0, -2]}>
                    <FaBell size={22} style={{ color: 'var(--text-h)' }} />
                </Badge>
            </button>
        </Dropdown>
    );
};

export default NotificationDropdown;

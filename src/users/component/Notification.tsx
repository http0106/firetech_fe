import { useState } from 'react';
import { Dropdown, Badge, Avatar, Empty, Button } from 'antd';
import { FaBell, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { Db, User } from '../../types';
import { useStore } from '../../store';
import { homePathOf } from '../../data/constants';
import { invoiceState, warrantyInfo, daysUntil, formatDate, relativeTime } from '../../utils';

/**
 * CHUÔNG THÔNG BÁO.
 * Thông báo không lưu riêng mà được TÍNH từ dữ liệu, theo vai trò người đang đăng nhập.
 * Việc đã xử lý xong (báo giá đã nhận, hóa đơn đã thu...) sẽ tự biến mất khỏi danh sách.
 */
type Note = {
    id: string;
    title: string;
    description: string;
    link: string;
    at: string;
    level: 'info' | 'warning' | 'critical';
};

const getNotifications = (db: Db, user: User): Note[] => {
    const notes: Note[] = [];
    const productName = (id: string) => db.products.find((p) => p.id === id)?.name ?? 'Thiết bị';
    const userName = (id: string) => db.users.find((u) => u.id === id)?.name ?? '';
    const role = user.role;
    const isAdmin = role === 'admin';

    /* ----- Khách hàng ----- */
    if (role === 'customer') {
        for (const p of db.projects.filter((p) => p.customerId === user.id && p.status === 'active')) {
            const days = daysUntil(p.nextMaintenance);
            if (days <= 14)
                notes.push({
                    id: `maint-${p.id}`,
                    title: days < 0 ? 'Công trình đã quá hạn bảo trì' : 'Sắp đến lịch bảo trì',
                    description: `${p.name}: ${formatDate(p.nextMaintenance)}`,
                    link: `/account/projects/${p.id}`,
                    at: p.nextMaintenance,
                    level: days < 0 ? 'critical' : 'warning',
                });
            for (const d of p.devices)
                if (warrantyInfo(d.warrantyUntil).level === 'soon')
                    notes.push({
                        id: `warr-${p.id}-${d.productId}`,
                        title: 'Thiết bị sắp hết bảo hành',
                        description: `${productName(d.productId)} tại ${p.name}`,
                        link: `/account/projects/${p.id}`,
                        at: d.warrantyUntil,
                        level: 'warning',
                    });
        }
        for (const q of db.quotes.filter((q) => q.customerId === user.id && q.status === 'sent'))
            notes.push({ id: `quote-${q.id}`, title: `Đã có báo giá ${q.code}`, description: 'Tư vấn viên đã gửi báo giá, vui lòng xem và phản hồi.', link: '/account/quotes', at: q.createdAt, level: 'info' });
        for (const o of db.orders.filter((o) => o.customerId === user.id && o.status === 'shipping'))
            notes.push({ id: `order-${o.id}`, title: `Đơn hàng ${o.code} đang được giao`, description: 'Vui lòng giữ máy để nhân viên giao hàng liên hệ.', link: '/account/orders', at: o.createdAt, level: 'info' });
    }

    /* ----- Kinh doanh (và Admin) ----- */
    if (role === 'sales' || isAdmin) {
        for (const q of db.quotes.filter((q) => q.status === 'new'))
            notes.push({ id: `quote-${q.id}`, title: `Yêu cầu báo giá mới ${q.code}`, description: q.company ?? q.contactName, link: '/portal/quotes', at: q.createdAt, level: 'info' });
        for (const c of db.chats.filter((c) => c.status === 'open' && c.unreadByStaff > 0))
            notes.push({ id: `chat-${c.id}`, title: `Tin nhắn mới từ ${c.guestName}`, description: c.messages[c.messages.length - 1]?.text ?? '', link: `/portal/chat?thread=${c.id}`, at: c.updatedAt, level: 'warning' });
    }

    /* ----- Kinh doanh, Kế toán (và Admin): đơn hàng chờ xác nhận ----- */
    if (role === 'sales' || role === 'accountant' || isAdmin) {
        for (const o of db.orders.filter((o) => o.status === 'pending'))
            notes.push({ id: `order-${o.id}`, title: `Đơn hàng mới ${o.code}`, description: `${userName(o.customerId)} – chờ xác nhận`, link: '/portal/orders', at: o.createdAt, level: 'info' });
    }

    /* ----- Kỹ thuật: việc của tôi đến hạn (hôm nay, ngày mai hoặc trễ) ----- */
    if (role === 'technician') {
        for (const w of db.workOrders.filter((w) => w.technicianId === user.id && w.status !== 'done' && w.status !== 'cancelled' && daysUntil(w.date) <= 1))
            notes.push({ id: `work-${w.id}`, title: `Công việc ${w.code} – ${formatDate(w.date)}`, description: db.projects.find((p) => p.id === w.projectId)?.name ?? '', link: '/portal/schedule', at: w.date, level: daysUntil(w.date) < 0 ? 'critical' : 'info' });
    }

    /* ----- Kế toán (và Admin): hóa đơn quá hạn ----- */
    if (role === 'accountant' || isAdmin) {
        for (const i of db.invoices.filter((i) => invoiceState(i) === 'overdue'))
            notes.push({ id: `inv-${i.id}`, title: `Hóa đơn ${i.code} quá hạn`, description: `${userName(i.customerId)} – ${i.description}`, link: '/portal/invoices', at: i.dueDate, level: 'critical' });
    }

    /* ----- Chỉ Admin ----- */
    if (isAdmin) {
        for (const u of db.users.filter((u) => u.status === 'pending'))
            notes.push({ id: `pending-${u.id}`, title: 'Nhân viên mới chờ duyệt', description: `${u.name} – ${u.email}`, link: '/portal/users', at: u.createdAt, level: 'warning' });
        for (const p of db.projects.filter((p) => p.status === 'active' && daysUntil(p.nextMaintenance) < 0))
            notes.push({ id: `proj-${p.id}`, title: 'Công trình quá hạn bảo trì', description: `${p.code} – ${p.name}`, link: '/portal/projects', at: p.nextMaintenance, level: 'critical' });
        for (const u of db.users.filter((u) => u.pendingProjectCode))
            notes.push({ id: `link-${u.id}`, title: 'Khách hàng cần liên kết công trình', description: `${u.name} khai báo mã ${u.pendingProjectCode}`, link: '/portal/users', at: u.createdAt, level: 'info' });
    }

    // Mới nhất lên đầu
    return notes.sort((a, b) => b.at.localeCompare(a.at));
};

const LEVEL = {
    info: { icon: <FaInfoCircle />, bg: '#1677ff' },
    warning: { icon: <FaExclamationTriangle />, bg: '#fa8c16' },
    critical: { icon: <FaExclamationTriangle />, bg: '#f5222d' },
};

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const { db, user } = useStore();
    const [open, setOpen] = useState(false);
    const notes = user ? getNotifications(db, user) : [];

    const go = (link: string) => {
        setOpen(false);
        navigate(link);
    };

    return (
        <Dropdown
            trigger={['click']}
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            popupRender={() => (
                <div className="w-[360px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                        <h3 className="text-base font-bold m-0 text-gray-800 dark:text-slate-100">Thông báo</h3>
                        <span className="text-xs text-gray-400 dark:text-slate-400">Bạn có {notes.length} việc cần chú ý</span>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto">
                        {notes.length > 0 ? (
                            <div className="p-1">
                                {notes.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => go(n.link)}
                                        className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors"
                                    >
                                        <Avatar size={42} icon={LEVEL[n.level].icon} style={{ backgroundColor: LEVEL[n.level].bg }} className="shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-700 dark:text-slate-200 m-0">
                                                <b className="text-gray-900 dark:text-slate-100">{n.title}</b> {n.description}
                                            </p>
                                            <span className="text-[11px] text-gray-400 dark:text-slate-500">
                                                {/* "2026-11-24" (chỉ ngày) → hiện ngày; có cả giờ → "3 giờ trước" */}
                                                {n.at.length > 10 ? relativeTime(n.at) : formatDate(n.at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={<span className="text-gray-500 dark:text-slate-400">Chưa có thông báo</span>}
                                className="py-8"
                            />
                        )}
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-800 p-3 text-center">
                        <Button
                            type="text"
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 w-full"
                            onClick={() => go(user ? homePathOf(user) : '/login')}
                        >
                            Xem tất cả thông báo
                        </Button>
                    </div>
                </div>
            )}
        >
            <div
                className="cursor-pointer p-2 rounded-full transition-colors hover:bg-neutral-500/10 flex items-center justify-center"
                style={{ color: 'var(--text-h)' }}
                role="button"
                aria-label="Thông báo"
            >
                <Badge count={notes.length} offset={[0, -2]} className="cursor-pointer">
                    <FaBell size={22} style={{ color: 'var(--text-h)' }} />
                </Badge>
            </div>
        </Dropdown>
    );
};

export default NotificationDropdown;

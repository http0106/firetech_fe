import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppNotification } from '../types';
import { useLookup, useStore } from './StoreContext';
import { useAuth } from './AuthContext';
import { invoiceState, maintenanceInfo, warrantyInfo } from '../utils/business';
import { daysUntil, formatDate, todayISO } from '../utils/format';

/**
 * Thông báo được TÍNH từ dữ liệu theo vai trò/quyền của người đang đăng nhập:
 * - Khách hàng: lịch bảo trì sắp tới/quá hạn, thiết bị sắp hết bảo hành, báo giá đã gửi, đơn đang giao.
 * - Nhân viên: báo giá mới, tin nhắn chưa đọc, việc hôm nay, công trình quá hạn bảo trì, hóa đơn quá hạn...
 * Trạng thái "đã đọc" lưu theo từng tài khoản.
 */
const READ_KEY = 'firetech-notif-read';

const readStored = (): Record<string, string[]> => {
    try {
        return JSON.parse(localStorage.getItem(READ_KEY) ?? '{}') as Record<string, string[]>;
    } catch {
        return {};
    }
};

interface NotificationValue {
    items: (AppNotification & { read: boolean })[];
    unread: number;
    markRead: (id: string) => void;
    markAllRead: () => void;
}

const NotificationContext = createContext<NotificationValue | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { db } = useStore();
    const { user, can } = useAuth();
    const lookup = useLookup();
    const [readMap, setReadMap] = useState<Record<string, string[]>>(readStored);

    useEffect(() => {
        try {
            localStorage.setItem(READ_KEY, JSON.stringify(readMap));
        } catch {
            /* bỏ qua */
        }
    }, [readMap]);

    // Đọc thông báo ở tab này → badge ở tab khác cũng giảm
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === READ_KEY) setReadMap(readStored());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const all = useMemo<AppNotification[]>(() => {
        if (!user) return [];
        const list: AppNotification[] = [];

        if (user.role === 'customer') {
            db.projects
                .filter((p) => p.customerId === user.id && p.status === 'active')
                .forEach((p) => {
                    const m = maintenanceInfo(p.nextMaintenance);
                    if (m.level !== 'ok')
                        list.push({
                            id: `maint-${p.id}-${p.nextMaintenance}`,
                            title: m.days < 0 ? 'Công trình đã quá hạn bảo trì' : 'Sắp đến lịch bảo trì',
                            description: `${p.name}: ${m.label} (${formatDate(p.nextMaintenance)})`,
                            link: `/account/projects/${p.id}`,
                            at: p.nextMaintenance,
                            level: m.days < 0 ? 'critical' : 'warning',
                        });
                    p.devices.forEach((d) => {
                        const w = warrantyInfo(d.warrantyUntil);
                        if (w.level === 'soon')
                            list.push({
                                id: `warr-${p.id}-${d.productId}-${d.warrantyUntil}`,
                                title: 'Thiết bị sắp hết bảo hành',
                                description: `${lookup.product(d.productId)?.name ?? 'Thiết bị'} tại ${p.name}, ${w.label}`,
                                link: `/account/projects/${p.id}`,
                                at: d.warrantyUntil,
                                level: 'warning',
                            });
                    });
                });
            db.quotes
                .filter((q) => q.customerId === user.id && q.status === 'sent')
                .forEach((q) =>
                    list.push({
                        id: `quote-sent-${q.id}`,
                        title: `Đã có báo giá ${q.code}`,
                        description: 'Tư vấn viên đã gửi báo giá, vui lòng xem và phản hồi.',
                        link: '/account/quotes',
                        at: q.createdAt,
                        level: 'info',
                    }),
                );
            db.orders
                .filter((o) => o.customerId === user.id && o.status === 'shipping')
                .forEach((o) =>
                    list.push({
                        id: `order-ship-${o.id}`,
                        title: `Đơn hàng ${o.code} đang được giao`,
                        description: 'Vui lòng giữ máy để nhân viên giao hàng liên hệ.',
                        link: '/account/orders',
                        at: o.createdAt,
                        level: 'info',
                    }),
                );
        } else {
            if (can('quotes.manage'))
                db.quotes
                    .filter((q) => q.status === 'new')
                    .forEach((q) =>
                        list.push({
                            id: `quote-new-${q.id}`,
                            title: `Yêu cầu báo giá mới ${q.code}`,
                            description: `${q.contactName}${q.company ? ` – ${q.company}` : ''}`,
                            link: '/portal/quotes',
                            at: q.createdAt,
                            level: 'info',
                        }),
                    );
            if (can('chat.reply'))
                db.chats
                    .filter((c) => c.status === 'open' && c.unreadByStaff > 0)
                    .forEach((c) =>
                        list.push({
                            id: `chat-${c.id}-${c.messages.length}`,
                            title: `Tin nhắn mới từ ${c.guestName}`,
                            description: c.messages[c.messages.length - 1]?.text ?? '',
                            link: '/portal/chat',
                            at: c.updatedAt,
                            level: 'warning',
                        }),
                    );
            if (can('maintenance.update'))
                db.workOrders
                    .filter((w) => w.technicianId === user.id && w.status !== 'done' && w.status !== 'cancelled' && daysUntil(w.date) <= 1)
                    .forEach((w) =>
                        list.push({
                            id: `work-${w.id}-${w.status}`,
                            title: w.date === todayISO() ? `Công việc hôm nay: ${w.code}` : `Công việc ${w.code} – ${formatDate(w.date)}`,
                            description: lookup.project(w.projectId)?.name ?? '',
                            link: '/portal/schedule',
                            at: w.date,
                            level: daysUntil(w.date) < 0 ? 'critical' : 'info',
                        }),
                    );
            if (can('projects.manage'))
                db.projects
                    .filter((p) => p.status === 'active' && daysUntil(p.nextMaintenance) < 0)
                    .forEach((p) =>
                        list.push({
                            id: `proj-overdue-${p.id}-${p.nextMaintenance}`,
                            title: 'Công trình quá hạn bảo trì',
                            description: `${p.code} – ${p.name}`,
                            link: '/portal/projects',
                            at: p.nextMaintenance,
                            level: 'critical',
                        }),
                    );
            if (can('invoices.manage'))
                db.invoices
                    .filter((i) => invoiceState(i) === 'overdue')
                    .forEach((i) =>
                        list.push({
                            id: `inv-overdue-${i.id}`,
                            title: `Hóa đơn ${i.code} quá hạn`,
                            description: `${lookup.userName(i.customerId)} – ${i.description}`,
                            link: '/portal/invoices',
                            at: i.dueDate,
                            level: 'critical',
                        }),
                    );
            if (can('orders.manage'))
                db.orders
                    .filter((o) => o.status === 'pending')
                    .forEach((o) =>
                        list.push({
                            id: `order-new-${o.id}`,
                            title: `Đơn hàng mới ${o.code}`,
                            description: `${lookup.userName(o.customerId)} – chờ xác nhận`,
                            link: '/portal/orders',
                            at: o.createdAt,
                            level: 'info',
                        }),
                    );
            if (can('users.manage'))
                db.users
                    .filter((u) => u.pendingProjectCode)
                    .forEach((u) =>
                        list.push({
                            id: `link-${u.id}-${u.pendingProjectCode}`,
                            title: 'Khách hàng cần liên kết công trình',
                            description: `${u.name} khai báo mã ${u.pendingProjectCode}`,
                            link: '/portal/users',
                            at: u.createdAt,
                            level: 'info',
                        }),
                    );
        }
        return list.sort((a, b) => (a.at < b.at ? 1 : -1));
    }, [db, user, lookup, can]);

    const readIds = user ? readMap[user.id] ?? [] : [];
    const items = all.map((n) => ({ ...n, read: readIds.includes(n.id) }));

    const value: NotificationValue = {
        items,
        unread: items.filter((n) => !n.read).length,
        markRead: (id) => user && setReadMap((m) => ({ ...m, [user.id]: [...new Set([...(m[user.id] ?? []), id])] })),
        markAllRead: () => user && setReadMap((m) => ({ ...m, [user.id]: all.map((n) => n.id) })),
    };
    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications phải nằm trong <NotificationProvider>');
    return ctx;
};

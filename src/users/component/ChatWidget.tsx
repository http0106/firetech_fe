import { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Form, Input } from 'antd';
import { FaHeadset, FaPaperPlane, FaTimes } from 'react-icons/fa';
import type { ChatMessage, ChatThread } from '../../types';
import { useLookup, useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { formatTime, nowISO, uid } from '../../utils/format';

/**
 * GIAO DIỆN MỚI — Khung chat tư vấn trực tuyến (khách vãng lai & khách hàng).
 * - Khách vãng lai: nhập tên + SĐT trước khi chat (để tư vấn viên gọi lại khi offline).
 * - Khách hàng đã đăng nhập: chat ngay, lịch sử gắn với tài khoản.
 * - Tin nhắn đi vào hộp thư của Tư vấn viên tại /portal/chat.
 * - Nếu chưa có tư vấn viên trả lời, bot gửi lời chào tự động một lần.
 * Khi có backend: thay `update('chats', ...)` bằng WebSocket/Socket.IO.
 */
const GUEST_THREAD_KEY = 'firetech-chat-thread';

const QUICK_QUESTIONS = ['Tư vấn bình chữa cháy cho gia đình', 'Báo giá hệ thống báo cháy', 'Đặt lịch bảo trì', 'Nạp sạc bình chữa cháy'];

const ChatWidget = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { db, update } = useStore();
    const lookup = useLookup();
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [guestThreadId, setGuestThreadId] = useState<string | null>(() => {
        try {
            return localStorage.getItem(GUEST_THREAD_KEY);
        } catch {
            return null;
        }
    });
    const bottomRef = useRef<HTMLDivElement>(null);

    const isCustomer = user?.role === 'customer';
    const thread: ChatThread | undefined = isCustomer
        ? db.chats.find((c) => c.customerId === user.id && c.status === 'open')
        : db.chats.find((c) => c.id === guestThreadId);

    const needsIntro = !isCustomer && !thread;
    const staff = lookup.user(thread?.assignedTo);

    // Đánh dấu đã đọc khi mở khung chat
    useEffect(() => {
        if (open && thread && thread.unreadByCustomer > 0)
            update('chats', (list) => list.map((c) => (c.id === thread.id ? { ...c, unreadByCustomer: 0 } : c)));
    }, [open, thread, update]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread?.messages.length, open]);

    const createThread = (guestName: string, guestPhone?: string): ChatThread => {
        const t: ChatThread = {
            id: uid('c'),
            customerId: isCustomer ? user.id : undefined,
            guestName,
            guestPhone,
            messages: [],
            status: 'open',
            unreadByStaff: 0,
            unreadByCustomer: 0,
            updatedAt: nowISO(),
        };
        update('chats', (list) => [t, ...list]);
        if (!isCustomer) {
            setGuestThreadId(t.id);
            try {
                localStorage.setItem(GUEST_THREAD_KEY, t.id);
            } catch {
                /* bỏ qua */
            }
        }
        return t;
    };

    const send = (content: string, explicitTarget?: ChatThread) => {
        const value = content.trim();
        if (!value) return;
        const target = explicitTarget ?? thread ?? createThread(user?.name ?? 'Khách', user?.phone);
        const msg: ChatMessage = { id: uid('m'), from: 'customer', senderName: target.guestName, text: value, at: nowISO() };
        const hasReply = target.messages.some((m) => m.from !== 'customer');
        update('chats', (list) =>
            list.map((c) =>
                c.id === target.id ? { ...c, messages: [...c.messages, msg], unreadByStaff: c.unreadByStaff + 1, updatedAt: msg.at } : c,
            ),
        );
        setText('');

        if (!hasReply) {
            window.setTimeout(() => {
                const bot: ChatMessage = {
                    id: uid('m'),
                    from: 'bot',
                    senderName: 'FireTech',
                    text: `Chào ${target.guestName}! Cảm ơn bạn đã liên hệ FireTech. Tư vấn viên sẽ phản hồi trong ít phút (giờ hành chính). Trường hợp khẩn cấp vui lòng gọi hotline ${db.settings.hotline}.`,
                    at: nowISO(),
                };
                update('chats', (list) => list.map((c) => (c.id === target.id ? { ...c, messages: [...c.messages, bot] } : c)));
            }, 700);
        }
    };

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-label="Chat tư vấn"
            className="fixed z-[1100] bottom-4 right-4 left-4 sm:left-auto sm:w-[370px] h-[min(560px,calc(100dvh-32px))] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] bg-white dark:bg-slate-900"
        >
            <div className="flex items-center gap-3 px-4 py-3 bg-[#FF4D4D] text-white">
                <Avatar className="bg-white/20 shrink-0" icon={<FaHeadset />} />
                <div className="flex-1 min-w-0">
                    <div className="font-semibold leading-tight">Tư vấn PCCC trực tuyến</div>
                    <div className="text-xs opacity-90">
                        {staff ? `${staff.name} đang hỗ trợ bạn` : 'Thường trả lời trong vài phút'}
                    </div>
                </div>
                <Button type="text" shape="circle" aria-label="Đóng" onClick={onClose} icon={<FaTimes className="text-white" />} />
            </div>

            {needsIntro ? (
                <div className="flex-1 overflow-y-auto p-4">
                    <p className="text-sm text-[var(--text)] mb-4">
                        Để lại tên và số điện thoại để tư vấn viên có thể gọi lại nếu bạn rời trang.
                    </p>
                    <Form
                        layout="vertical"
                        requiredMark={false}
                        onFinish={(v: { name: string; phone: string; question?: string }) => {
                            const t = createThread(v.name, v.phone);
                            if (v.question) send(v.question, t);
                        }}
                    >
                        <Form.Item name="name" label="Tên của bạn" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                            <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[{ required: true, pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ' }]}
                        >
                            <Input inputMode="tel" placeholder="09xx xxx xxx" />
                        </Form.Item>
                        <Form.Item name="question" label="Câu hỏi (không bắt buộc)">
                            <Input.TextArea rows={2} placeholder="Tôi cần tư vấn..." />
                        </Form.Item>
                        <Button type="primary" danger htmlType="submit" block>
                            Bắt đầu trò chuyện
                        </Button>
                    </Form>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-slate-800/50">
                        {!thread?.messages.length && (
                            <div className="text-center text-sm text-[var(--text)] py-6">
                                Xin chào{user ? ` ${user.name}` : ''}! Bạn cần FireTech hỗ trợ gì?
                            </div>
                        )}
                        {thread?.messages.map((m) => {
                            const mine = m.from === 'customer';
                            return (
                                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                            mine ? 'bg-red-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-900 text-[var(--text-h)] border border-[var(--border)] rounded-bl-sm'
                                        }`}
                                    >
                                        {!mine && <div className="text-[11px] font-semibold opacity-70 mb-0.5">{m.senderName}</div>}
                                        <div className="whitespace-pre-wrap break-words">{m.text}</div>
                                        <div className={`text-[10px] mt-1 text-right ${mine ? 'text-white/70' : 'text-[var(--text)]'}`}>{formatTime(m.at)}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {!thread?.messages.length && (
                        <div className="flex flex-wrap gap-1.5 px-3 pt-2">
                            {QUICK_QUESTIONS.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => send(q)}
                                    className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] bg-white dark:bg-slate-900 text-[var(--text-h)] cursor-pointer hover:border-red-400 hover:text-red-600"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <form
                        className="flex items-end gap-2 p-3 border-t border-[var(--border)]"
                        onSubmit={(e) => {
                            e.preventDefault();
                            send(text);
                        }}
                    >
                        <Input.TextArea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send(text);
                                }
                            }}
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            placeholder="Nhập tin nhắn..."
                        />
                        <Button type="primary" danger htmlType="submit" aria-label="Gửi" icon={<FaPaperPlane />} disabled={!text.trim()} />
                    </form>
                </>
            )}
        </div>
    );
};

/** Số tin chưa đọc của khách (để hiện badge trên nút chat). */
export const useCustomerUnread = () => {
    const { db } = useStore();
    const { user } = useAuth();
    let threadId: string | null = null;
    try {
        threadId = localStorage.getItem(GUEST_THREAD_KEY);
    } catch {
        /* bỏ qua */
    }
    const thread =
        user?.role === 'customer'
            ? db.chats.find((c) => c.customerId === user.id && c.status === 'open')
            : db.chats.find((c) => c.id === threadId);
    return thread?.unreadByCustomer ?? 0;
};

export default ChatWidget;

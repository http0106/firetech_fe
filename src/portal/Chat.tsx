import { useEffect, useRef, useState } from 'react';
import { Avatar, Badge, Button, Empty, Grid, Input, Segmented, Tag } from 'antd';
import { FaArrowLeft, FaPaperPlane, FaPhoneAlt, FaUserCheck } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import { useStore, useLookup } from '../store';
import { formatDate, formatTime, matches, nowISO, relativeTime, uid, maintenanceInfo } from '../utils';
import type { ChatMessage, ChatThread } from '../types';

/**
 * Hộp thư tư vấn trực tuyến cho nhân viên kinh doanh (Kinh doanh, Admin).
 * - Nhận tin nhắn từ khung chat trên website (khách vãng lai + khách hàng).
 * - Thấy ngay công trình & lịch bảo trì nếu người chat là khách hàng đã có tài khoản.
 * - Câu trả lời mẫu để phản hồi nhanh.
 * Thử: khách gửi tin trên web → đăng xuất → đăng nhập tư vấn viên → trả lời tại đây.
 */
const QUICK_REPLIES = [
    'Dạ em chào anh/chị, em có thể hỗ trợ gì ạ?',
    'Anh/chị cho em xin diện tích và loại công trình để em tư vấn chính xác ạ.',
    'Em đã gửi báo giá, anh/chị xem trong mục Báo giá của tài khoản giúp em ạ.',
    'Kỹ thuật viên sẽ gọi xác nhận lịch trước 1 ngày ạ.',
];

const Chat = () => {
    const { db, edit, user } = useStore();
    const lookup = useLookup();
    const screens = Grid.useBreakpoint();
    const [params, setParams] = useSearchParams();
    const [filter, setFilter] = useState<'open' | 'closed' | 'mine'>('open');
    const [search, setSearch] = useState('');
    const [text, setText] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const activeId = params.get('thread');
    const active = db.chats.find((c) => c.id === activeId);

    // Danh sách hội thoại theo bộ lọc + ô tìm kiếm, mới nhất lên đầu
    const threads = db.chats
        .filter((c) => (filter === 'mine' ? c.assignedTo === user?.id : c.status === filter))
        .filter((c) => !search || matches(`${c.guestName} ${c.guestPhone ?? ''}`, search))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    // Mở hội thoại → đánh dấu đã đọc
    useEffect(() => {
        if (active && active.unreadByStaff > 0) edit('chats', active.id, { unreadByStaff: 0 });
    }, [active, edit]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [active?.messages.length, activeId]);

    const patchActive = (changes: Partial<ChatThread>) => active && edit('chats', active.id, changes);

    const send = (content: string) => {
        if (!active || !user || !content.trim()) return;
        const msg: ChatMessage = { id: uid('m'), from: 'staff', senderName: user.name, text: content.trim(), at: nowISO() };
        edit('chats', active.id, {
            messages: [...active.messages, msg],
            assignedTo: active.assignedTo ?? user.id,
            unreadByCustomer: active.unreadByCustomer + 1,
            updatedAt: msg.at,
            status: 'open',
        });
        setText('');
    };

    const customer = lookup.user(active?.customerId);
    const customerProjects = db.projects.filter((p) => p.customerId === active?.customerId);
    const showList = screens.md || !active;
    const showThread = screens.md || !!active;

    return (
        <div>
            <PageHeader title="Tư vấn trực tuyến" subtitle="Tin nhắn từ khung chat trên website." />
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden grid md:grid-cols-[320px_minmax(0,1fr)] h-[calc(100vh-220px)] min-h-[480px]">
                {showList && (
                    <div className="flex flex-col border-r border-[var(--border)] min-h-0">
                        <div className="p-3 flex flex-col gap-2 border-b border-[var(--border)]">
                            <Input.Search allowClear placeholder="Tìm tên, số điện thoại" onChange={(e) => setSearch(e.target.value)} />
                            <Segmented
                                block
                                size="small"
                                value={filter}
                                onChange={(v) => setFilter(v as typeof filter)}
                                options={[
                                    { label: 'Đang mở', value: 'open' },
                                    { label: 'Của tôi', value: 'mine' },
                                    { label: 'Đã đóng', value: 'closed' },
                                ]}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {threads.length ? (
                                threads.map((c) => {
                                    const last = c.messages[c.messages.length - 1];
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setParams({ thread: c.id })}
                                            className={`w-full text-left flex gap-3 px-3 py-3 border-0 border-b border-[var(--border)] cursor-pointer ${
                                                c.id === activeId ? 'bg-red-500/10' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <Badge count={c.unreadByStaff} size="small">
                                                <Avatar className={c.customerId ? 'bg-blue-600' : 'bg-slate-500'}>{c.guestName.split(' ').pop()?.[0]}</Avatar>
                                            </Badge>
                                            <span className="flex-1 min-w-0">
                                                <span className="flex justify-between gap-2">
                                                    <span className={`truncate text-sm text-[var(--text-h)] ${c.unreadByStaff ? 'font-bold' : 'font-medium'}`}>{c.guestName}</span>
                                                    <span className="text-[11px] text-[var(--text)] shrink-0">{relativeTime(c.updatedAt)}</span>
                                                </span>
                                                <span className="block text-xs text-[var(--text)] truncate">{last ? `${last.from === 'staff' ? 'Bạn: ' : ''}${last.text}` : 'Chưa có tin nhắn'}</span>
                                                <span className="flex gap-1 mt-1">
                                                    {c.customerId ? <Tag color="blue" className="m-0 text-[10px]">Khách hàng</Tag> : <Tag className="m-0 text-[10px]">Vãng lai</Tag>}
                                                    {!c.assignedTo && <Tag color="red" className="m-0 text-[10px]">Chưa ai nhận</Tag>}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có hội thoại" className="py-10" />
                            )}
                        </div>
                    </div>
                )}

                {showThread &&
                    (active ? (
                        <div className="flex flex-col min-h-0">
                            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                                {!screens.md && <Button type="text" icon={<FaArrowLeft />} onClick={() => setParams({})} aria-label="Quay lại" />}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-[var(--text-h)]">{active.guestName}</div>
                                    <div className="text-xs text-[var(--text)] flex flex-wrap gap-x-3">
                                        {active.guestPhone && <a href={`tel:${active.guestPhone}`} className="inline-flex items-center gap-1"><FaPhoneAlt size={10} />{active.guestPhone}</a>}
                                        {customer?.company && <span>{customer.company}</span>}
                                        <span>Phụ trách: {active.assignedTo ? lookup.userName(active.assignedTo) : 'chưa có'}</span>
                                    </div>
                                </div>
                                {active.assignedTo !== user?.id && (
                                    <Button size="small" icon={<FaUserCheck />} onClick={() => patchActive({ assignedTo: user?.id })}>Nhận hỗ trợ</Button>
                                )}
                                <Button size="small" onClick={() => patchActive({ status: active.status === 'open' ? 'closed' : 'open' })}>
                                    {active.status === 'open' ? 'Đóng hội thoại' : 'Mở lại'}
                                </Button>
                            </div>

                            {customerProjects.length > 0 && (
                                <div className="px-4 py-2 border-b border-[var(--border)] bg-gray-50 dark:bg-slate-800/50 text-xs flex flex-wrap gap-2 items-center">
                                    <span className="text-[var(--text)]">Công trình:</span>
                                    {customerProjects.map((p) => (
                                        <Tag key={p.id} color={maintenanceInfo(p.nextMaintenance).color} className="m-0">
                                            {p.code} · bảo trì {formatDate(p.nextMaintenance)}
                                        </Tag>
                                    ))}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50 dark:bg-slate-800/30">
                                {active.messages.map((m) => {
                                    const mine = m.from === 'staff';
                                    return (
                                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-blue-600 text-white rounded-br-sm' : m.from === 'bot' ? 'bg-amber-500/15 text-[var(--text-h)] rounded-bl-sm' : 'bg-white dark:bg-slate-900 border border-[var(--border)] text-[var(--text-h)] rounded-bl-sm'}`}>
                                                <div className="text-[11px] font-semibold opacity-70">{m.senderName}{m.from === 'bot' ? ' (tự động)' : ''}</div>
                                                <div className="whitespace-pre-wrap break-words">{m.text}</div>
                                                <div className={`text-[10px] mt-1 text-right ${mine ? 'text-white/70' : 'text-[var(--text)]'}`}>{formatTime(m.at)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            <div className="border-t border-[var(--border)] p-3 flex flex-col gap-2">
                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {QUICK_REPLIES.map((q) => (
                                        <button key={q} type="button" onClick={() => setText(q)} className="shrink-0 text-xs px-2.5 py-1 rounded-full border border-[var(--border)] bg-white dark:bg-slate-900 text-[var(--text-h)] cursor-pointer hover:border-blue-400">
                                            {q.length > 38 ? `${q.slice(0, 38)}…` : q}
                                        </button>
                                    ))}
                                </div>
                                <form className="flex gap-2 items-end" onSubmit={(e) => { e.preventDefault(); send(text); }}>
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
                                        placeholder="Nhập câu trả lời... (Enter để gửi, Shift+Enter xuống dòng)"
                                    />
                                    <Button type="primary" htmlType="submit" icon={<FaPaperPlane />} disabled={!text.trim()}>Gửi</Button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="grid place-items-center text-sm text-[var(--text)] p-6">Chọn một hội thoại để bắt đầu trả lời.</div>
                    ))}
            </div>
        </div>
    );
};

export default Chat;

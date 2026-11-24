import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { App, Spin } from 'antd';
import type { CartItem, Db, Settings, User } from './types';
import { SEED_DATA } from './data/seed';
import { api, hasBackend, type Collection } from './api';
import { nowISO, uid } from './utils';

/**
 * KHO DỮ LIỆU CHUNG CỦA CẢ APP.
 *
 * Cách dùng trong component — chỉ cần 1 hook:
 *   const { db, add, edit, remove, user } = useStore();
 *
 *   db.products                                  // ĐỌC dữ liệu
 *   add('products', sanPhamMoi)                  // THÊM  → backend: POST   /products
 *   edit('products', 'p1', { price: 250000 })    // SỬA   → backend: PATCH  /products/p1
 *   remove('products', 'p1')                     // XÓA   → backend: DELETE /products/p1
 *   user                                         // người đang đăng nhập (null = khách vãng lai)
 *
 * Mỗi thao tác: cập nhật màn hình NGAY, rồi gửi lên server (xem api.ts).
 * Chưa có backend: dữ liệu lấy từ src/data, tải lại trang (F5) là quay về dữ liệu ban đầu.
 *
 * Giỏ hàng, danh sách so sánh, cuộc chat của khách vãng lai chỉ nằm trên trình duyệt, không gửi lên server.
 * dark / toggleDark (giao diện sáng-tối) do App.tsx truyền vào.
 */

export const MAX_COMPARE = 4;

/** Kiểu của 1 phần tử trong bảng, vd Item<'products'> = Product. */
type Item<C extends Collection> = Db[C][number];

type RegisterInput = Pick<User, 'name' | 'email' | 'phone' | 'password' | 'role'> &
    Partial<Pick<User, 'position' | 'customerType' | 'company' | 'taxCode' | 'address' | 'pendingProjectCode'>>;

/** Kết quả đăng nhập / đăng ký: có `user` nếu thành công, có `error` nếu thất bại. */
type AuthResult = { user?: User; error?: string };

/** Tất cả những gì component lấy được từ kho. */
interface StoreValue {
    // Dữ liệu (đồng bộ với backend)
    db: Db;
    add: <C extends Collection>(collection: C, item: Item<C>) => void;
    edit: <C extends Collection>(collection: C, id: string, changes: Partial<Item<C>>) => void;
    remove: (collection: Collection, id: string) => void;
    saveSettings: (settings: Settings) => void;
    // Đăng nhập
    user: User | null;
    login: (emailOrPhone: string, password: string, staff: boolean) => AuthResult;
    register: (input: RegisterInput) => AuthResult;
    logout: () => void;
    // Chỉ trên trình duyệt: giỏ hàng, so sánh, chat của khách vãng lai
    cart: CartItem[];
    cartCount: number;
    addToCart: (productId: string, quantity?: number) => void;
    setQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    compare: string[];
    /** Thêm/bỏ sản phẩm khỏi so sánh. Trả về false nếu đã đủ MAX_COMPARE sản phẩm. */
    toggleCompare: (productId: string) => boolean;
    clearCompare: () => void;
    guestChatId: string | null;
    setGuestChatId: (id: string) => void;
    // Giao diện sáng / tối
    dark: boolean;
    toggleDark: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

type ProviderProps = { children: ReactNode; dark: boolean; toggleDark: () => void };

export const StoreProvider = ({ children, dark, toggleDark }: ProviderProps) => {
    const { message } = App.useApp();
    const [db, setDb] = useState<Db>(SEED_DATA);
    const [loading, setLoading] = useState(hasBackend); // có backend → chờ tải dữ liệu
    const [userId, setUserId] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [compare, setCompare] = useState<string[]>([]);
    const [guestChatId, setGuestChatId] = useState<string | null>(null);

    // Có backend → mở web là tải toàn bộ dữ liệu từ server
    useEffect(() => {
        if (!hasBackend) return;
        api.loadAll()
            .then(setDb)
            .catch(() => message.error('Không tải được dữ liệu từ server.'))
            .finally(() => setLoading(false));
    }, [message]);

    /* ---------- Thêm / sửa / xóa dữ liệu ---------- */

    /** Gửi thay đổi lên server; lỗi thì báo cho người dùng. */
    const send = (call: Promise<unknown>) => {
        call.catch(() => message.error('Không lưu được lên server. Vui lòng thử lại.'));
    };

    const add: StoreValue['add'] = (collection, item) => {
        setDb((old) => ({ ...old, [collection]: [item, ...old[collection]] })); // thêm lên đầu danh sách
        send(api.create(collection, item));
    };

    const edit: StoreValue['edit'] = (collection, id, changes) => {
        setDb((old) => {
            const list = old[collection] as { id: string }[];
            return { ...old, [collection]: list.map((x) => (x.id === id ? { ...x, ...changes } : x)) };
        });
        send(api.update(collection, id, changes));
    };

    const remove: StoreValue['remove'] = (collection, id) => {
        setDb((old) => {
            const list = old[collection] as { id: string }[];
            return { ...old, [collection]: list.filter((x) => x.id !== id) };
        });
        send(api.remove(collection, id));
    };

    const saveSettings = (settings: Settings) => {
        setDb((old) => ({ ...old, settings }));
        send(api.saveSettings(settings));
    };

    /* ---------- Đăng nhập ---------- */

    // Luôn lấy người dùng mới nhất từ db → đổi tên / bị khóa là thấy ngay
    const user = db.users.find((u) => u.id === userId && u.status === 'active') ?? null;

    // Kiểm tra mật khẩu ngay trên trình duyệt (bản demo).
    // Backend thật nên có API đăng nhập riêng (vd POST /login) và không trả mật khẩu về trình duyệt.
    /** staff = true: đăng nhập ở trang nội bộ (/portal/login), false: trang khách hàng (/login). */
    const login = (emailOrPhone: string, password: string, staff: boolean): AuthResult => {
        const text = emailOrPhone.trim().toLowerCase();
        const found = db.users.find((u) => u.email.toLowerCase() === text || u.phone === text);
        if (!found || found.password !== password) return { error: 'Email/số điện thoại hoặc mật khẩu không đúng.' };
        // Mỗi loại tài khoản chỉ đăng nhập ở trang của mình
        if (staff && found.role === 'customer') return { error: 'Đây là tài khoản khách hàng. Vui lòng đăng nhập ở trang khách hàng.' };
        if (!staff && found.role !== 'customer') return { error: 'Đây là tài khoản nhân viên. Vui lòng đăng nhập ở trang nội bộ.' };
        if (found.status === 'pending') return { error: 'Tài khoản đang chờ Quản trị viên duyệt.' };
        if (found.status === 'locked') return { error: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' };
        setUserId(found.id);
        return { user: found };
    };

    const register = (input: RegisterInput): AuthResult => {
        const email = input.email.trim().toLowerCase();
        if (db.users.some((u) => u.email.toLowerCase() === email)) return { error: 'Email này đã được đăng ký.' };
        if (db.users.some((u) => u.phone === input.phone)) return { error: 'Số điện thoại này đã được đăng ký.' };

        // Khách hàng: dùng được ngay và tự đăng nhập.
        // Nhân viên: tài khoản ở trạng thái "chờ duyệt", Admin duyệt trong /portal/users mới đăng nhập được.
        const isCustomer = input.role === 'customer';
        const newUser: User = { ...input, email, id: uid('u'), status: isCustomer ? 'active' : 'pending', createdAt: nowISO() };
        add('users', newUser);
        if (isCustomer) setUserId(newUser.id);
        return { user: newUser };
    };

    /* ---------- Giỏ hàng (dùng setCart((old) => ...) để gọi nhiều lần liên tiếp vẫn đúng) ---------- */

    const addToCart = (productId: string, quantity = 1) =>
        setCart((old) => {
            const existing = old.find((i) => i.productId === productId);
            if (!existing) return [...old, { productId, quantity }];
            return old.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i));
        });

    const setQuantity = (productId: string, quantity: number) =>
        setCart((old) => old.map((i) => (i.productId === productId ? { ...i, quantity } : i)));

    const removeFromCart = (productId: string) => setCart((old) => old.filter((i) => i.productId !== productId));

    /* ---------- So sánh sản phẩm ---------- */

    const toggleCompare = (productId: string) => {
        if (compare.includes(productId)) {
            setCompare(compare.filter((id) => id !== productId));
            return true;
        }
        if (compare.length >= MAX_COMPARE) return false;
        setCompare([...compare, productId]);
        return true;
    };

    // Đang tải dữ liệu từ server → hiện vòng xoay
    if (loading) return <Spin fullscreen />;

    const value: StoreValue = {
        db,
        add,
        edit,
        remove,
        saveSettings,
        user,
        login,
        register,
        logout: () => setUserId(null),
        cart,
        cartCount: cart.reduce((sum, i) => sum + i.quantity, 0),
        addToCart,
        setQuantity,
        removeFromCart,
        clearCart: () => setCart([]),
        compare,
        toggleCompare,
        clearCompare: () => setCompare([]),
        guestChatId,
        setGuestChatId,
        dark,
        toggleDark,
    };
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

/** Lấy dữ liệu và các hàm từ kho chung. */
export const useStore = () => {
    const value = useContext(StoreContext);
    if (!value) throw new Error('useStore phải nằm trong <StoreProvider>');
    return value;
};

/** Tìm nhanh theo id: lookup.product(id), lookup.user(id), lookup.project(id), lookup.userName(id). */
export const useLookup = () => {
    const { db } = useStore();
    return {
        product: (id?: string) => db.products.find((p) => p.id === id),
        user: (id?: string) => db.users.find((u) => u.id === id),
        project: (id?: string) => db.projects.find((p) => p.id === id),
        userName: (id?: string) => db.users.find((u) => u.id === id)?.name ?? '—',
    };
};

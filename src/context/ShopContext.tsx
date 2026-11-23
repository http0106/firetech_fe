import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { App } from 'antd';
import type { CartItem, Product } from '../types';
import { useLookup } from './StoreContext';

/**
 * Giỏ hàng + danh sách so sánh sản phẩm — NGUỒN DỮ LIỆU DUY NHẤT cho Header (CartDropdown),
 * thẻ sản phẩm, trang chi tiết, trang giỏ hàng, so sánh, "Mua lại" trong tài khoản.
 *
 * - Lưu localStorage và đồng bộ giữa các tab (sự kiện `storage`).
 * - Số lượng luôn được giới hạn theo tồn kho (tối đa 99); sản phẩm đã bị xóa khỏi danh mục tự bị bỏ qua.
 * - `lines`/`cartTotal`/`cartCount` tính sẵn để mọi nơi hiển thị cùng một con số.
 * - Muốn hiện thông báo (toast) chuẩn khi thêm giỏ / so sánh → dùng `useShopActions()`.
 */
const CART_KEY = 'firetech-cart';
const COMPARE_KEY = 'firetech-compare';
export const MAX_COMPARE = 4;
export const MAX_QTY = 99;

const read = <T,>(key: string, fallback: T): T => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
};

const write = (key: string, value: unknown) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* hết dung lượng / chế độ riêng tư → bỏ qua */
    }
};

/** Số lượng tối đa có thể đặt cho một sản phẩm (0 = hết hàng / không tồn tại). */
export const maxQtyOf = (product?: Pick<Product, 'stock'>) => (product ? Math.max(0, Math.min(MAX_QTY, product.stock)) : 0);

export interface CartLine extends CartItem {
    product: Product;
    subtotal: number;
}

/** Kết quả thêm giỏ: số lượng thực tế đã thêm (có thể ít hơn yêu cầu do giới hạn tồn kho). */
export type AddResult = { ok: true; added: number; capped: boolean } | { ok: false; reason: 'out_of_stock' | 'not_found' | 'max_reached' };

interface ShopValue {
    cart: CartItem[];
    /** Các dòng hợp lệ (sản phẩm còn trong danh mục), kèm thông tin sản phẩm và thành tiền. */
    lines: CartLine[];
    cartCount: number;
    cartTotal: number;
    addToCart: (productId: string, quantity?: number) => AddResult;
    setQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    compare: string[];
    /** Trả về false nếu danh sách so sánh đã đủ MAX_COMPARE sản phẩm. */
    toggleCompare: (productId: string) => boolean;
    clearCompare: () => void;
}

const ShopContext = createContext<ShopValue | null>(null);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
    const lookup = useLookup();
    const [cart, setCart] = useState<CartItem[]>(() => read(CART_KEY, []));
    const [compare, setCompare] = useState<string[]>(() => read(COMPARE_KEY, []));

    useEffect(() => write(CART_KEY, cart), [cart]);
    useEffect(() => write(COMPARE_KEY, compare), [compare]);

    // Đồng bộ giữa các tab: thêm giỏ ở tab A → badge ở tab B cập nhật ngay
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === CART_KEY) setCart(read(CART_KEY, []));
            if (e.key === COMPARE_KEY) setCompare(read(COMPARE_KEY, []));
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const addToCart = useCallback(
        (productId: string, quantity = 1): AddResult => {
            const product = lookup.product(productId);
            if (!product) return { ok: false, reason: 'not_found' };
            const max = maxQtyOf(product);
            if (max <= 0) return { ok: false, reason: 'out_of_stock' };
            const current = cart.find((i) => i.productId === productId)?.quantity ?? 0;
            const next = Math.min(max, current + Math.max(1, quantity));
            if (next <= current) return { ok: false, reason: 'max_reached' };
            setCart((prev) =>
                prev.some((i) => i.productId === productId)
                    ? prev.map((i) => (i.productId === productId ? { ...i, quantity: next } : i))
                    : [...prev, { productId, quantity: next }],
            );
            return { ok: true, added: next - current, capped: next - current < quantity };
        },
        [cart, lookup],
    );

    const setQuantity = useCallback(
        (productId: string, quantity: number) => {
            const max = maxQtyOf(lookup.product(productId));
            setCart((prev) =>
                quantity <= 0 || max <= 0
                    ? prev.filter((i) => i.productId !== productId)
                    : prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(max, quantity) } : i)),
            );
        },
        [lookup],
    );

    const value = useMemo<ShopValue>(() => {
        const lines = cart
            .map((i) => ({ ...i, product: lookup.product(i.productId) }))
            .filter((l): l is CartItem & { product: Product } => !!l.product)
            .map((l) => ({ ...l, subtotal: l.product.price * l.quantity }));
        const validCompare = compare.filter((id) => !!lookup.product(id));
        return {
            cart,
            lines,
            cartCount: lines.reduce((s, l) => s + l.quantity, 0),
            cartTotal: lines.reduce((s, l) => s + l.subtotal, 0),
            addToCart,
            setQuantity,
            removeFromCart: (productId) => setCart((prev) => prev.filter((i) => i.productId !== productId)),
            clearCart: () => setCart([]),
            compare: validCompare,
            toggleCompare: (productId) => {
                if (validCompare.includes(productId)) {
                    setCompare((prev) => prev.filter((id) => id !== productId));
                    return true;
                }
                if (validCompare.length >= MAX_COMPARE) return false;
                setCompare([...validCompare, productId]);
                return true;
            },
            clearCompare: () => setCompare([]),
        };
    }, [cart, compare, lookup, addToCart, setQuantity]);

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
    const ctx = useContext(ShopContext);
    if (!ctx) throw new Error('useShop phải nằm trong <ShopProvider>');
    return ctx;
};

/**
 * Thao tác giỏ hàng / so sánh KÈM thông báo chuẩn — dùng ở mọi nút "Thêm vào giỏ", "So sánh"
 * để câu chữ và hành vi giống nhau trên toàn site.
 */
export const useShopActions = () => {
    const shop = useShop();
    const { message } = App.useApp();

    const addWithToast = (productId: string, quantity = 1, opts: { silent?: boolean } = {}) => {
        const res = shop.addToCart(productId, quantity);
        if (!res.ok) {
            const text = {
                out_of_stock: 'Sản phẩm tạm hết hàng',
                not_found: 'Sản phẩm không còn kinh doanh',
                max_reached: 'Số lượng trong giỏ đã đạt mức tối đa còn trong kho',
            }[res.reason];
            message.warning({ content: text, key: `cart-${productId}` });
        } else if (res.capped) {
            message.info({ content: `Chỉ thêm được ${res.added} sản phẩm do giới hạn tồn kho`, key: `cart-${productId}` });
        } else if (!opts.silent) {
            message.success({ content: 'Đã thêm vào giỏ hàng', key: `cart-${productId}` });
        }
        return res;
    };

    const toggleCompareWithToast = (productId: string) => {
        const wasIn = shop.compare.includes(productId);
        if (!shop.toggleCompare(productId)) {
            message.warning({ content: `Chỉ so sánh tối đa ${MAX_COMPARE} sản phẩm`, key: 'compare' });
            return false;
        }
        message.info({ content: wasIn ? 'Đã bỏ khỏi danh sách so sánh' : 'Đã thêm vào danh sách so sánh', key: 'compare' });
        return true;
    };

    return { ...shop, addWithToast, toggleCompareWithToast };
};

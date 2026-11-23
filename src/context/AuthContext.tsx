import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Permission, User } from '../types';
import { useStore } from './StoreContext';
import { nowISO, uid } from '../utils/format';

/**
 * Đăng nhập mô phỏng, TÁCH RIÊNG 2 phạm vi:
 *  - "customer": website công khai + /account — đăng nhập tại /login, khách tự đăng ký.
 *  - "staff":    trang nội bộ /portal — đăng nhập tại /portal/login, tài khoản do Admin cấp
 *                (Admin, Kinh doanh, Kỹ thuật, Kế toán... vai trò tự nhận theo tài khoản).
 * Hai phiên độc lập: đăng xuất nội bộ không ảnh hưởng phiên khách hàng và ngược lại;
 * nhân viên mở website sẽ thấy giao diện như khách vãng lai.
 *
 * Phạm vi hiện tại do <AuthScopeProvider> quyết định (router bọc /portal bằng scope="staff");
 * mặc định là "customer".
 *
 * "Ghi nhớ đăng nhập" → localStorage; không ghi nhớ → sessionStorage (đóng tab là đăng xuất).
 */
export type AuthScope = 'customer' | 'staff';

const SESSION_KEYS: Record<AuthScope, string> = {
    customer: 'firetech-session',
    staff: 'firetech-staff-session',
};

export const LOGIN_PATHS: Record<AuthScope, string> = { customer: '/login', staff: '/portal/login' };
const HOME_PATHS: Record<AuthScope, string> = { customer: '/account', staff: '/portal' };

/** Chỉ chấp nhận đường dẫn nội bộ cho ?redirect= (tránh chuyển hướng ra trang ngoài). */
export const safeRedirect = (value: string | null, fallback: string) =>
    value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;

/** Tài khoản có thuộc phạm vi này không (khách hàng ↔ nội bộ). */
export const belongsTo = (user: Pick<User, 'role'>, scope: AuthScope) =>
    scope === 'customer' ? user.role === 'customer' : user.role !== 'customer';

type Result = { ok: true; user: User } | { ok: false; error: string; wrongScope?: boolean };

export type RegisterInput = Pick<User, 'name' | 'email' | 'phone' | 'password'> &
    Partial<Pick<User, 'customerType' | 'company' | 'taxCode' | 'address' | 'pendingProjectCode'>>;

interface AuthState {
    sessions: Record<AuthScope, string | null>;
    login: (identifier: string, password: string, scope: AuthScope, remember: boolean) => Result;
    register: (input: RegisterInput) => Result;
    logout: (scope: AuthScope) => void;
}

const AuthStateContext = createContext<AuthState | null>(null);
const AuthScopeContext = createContext<AuthScope>('customer');

export const AuthScopeProvider = ({ scope, children }: { scope: AuthScope; children: ReactNode }) => (
    <AuthScopeContext.Provider value={scope}>{children}</AuthScopeContext.Provider>
);

const readSession = (scope: AuthScope) => {
    try {
        return sessionStorage.getItem(SESSION_KEYS[scope]) ?? localStorage.getItem(SESSION_KEYS[scope]);
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { db, update } = useStore();
    const [sessions, setSessions] = useState<Record<AuthScope, string | null>>(() => ({
        customer: readSession('customer'),
        staff: readSession('staff'),
    }));

    const startSession = (scope: AuthScope, id: string, remember: boolean) => {
        try {
            (remember ? localStorage : sessionStorage).setItem(SESSION_KEYS[scope], id);
        } catch {
            /* bỏ qua */
        }
        setSessions((s) => ({ ...s, [scope]: id }));
    };

    const login: AuthState['login'] = (identifier, password, scope, remember) => {
        const id = identifier.trim().toLowerCase();
        const digits = id.replace(/\D/g, '');
        const found = db.users.find(
            (u) => u.email.toLowerCase() === id || (scope === 'customer' && digits.length >= 9 && u.phone.replace(/\D/g, '') === digits),
        );
        if (!found || found.password !== password)
            return { ok: false, error: scope === 'customer' ? 'Email/số điện thoại hoặc mật khẩu không đúng.' : 'Email công ty hoặc mật khẩu không đúng.' };
        if (!belongsTo(found, scope))
            return {
                ok: false,
                wrongScope: true,
                error:
                    scope === 'customer'
                        ? 'Đây là tài khoản nội bộ. Vui lòng đăng nhập tại trang dành cho nhân viên.'
                        : 'Đây là tài khoản khách hàng. Vui lòng đăng nhập tại trang khách hàng.',
            };
        if (found.status === 'locked') return { ok: false, error: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' };
        startSession(scope, found.id, remember);
        return { ok: true, user: found };
    };

    const register: AuthState['register'] = (input) => {
        const email = input.email.trim().toLowerCase();
        if (db.users.some((u) => u.email.toLowerCase() === email)) return { ok: false, error: 'Email này đã được đăng ký.' };
        if (db.users.some((u) => u.phone === input.phone)) return { ok: false, error: 'Số điện thoại này đã được đăng ký.' };
        const newUser: User = {
            ...input,
            email,
            id: uid('u'),
            role: 'customer',
            permissions: [],
            status: 'active',
            createdAt: nowISO(),
        };
        update('users', (list) => [...list, newUser]);
        startSession('customer', newUser.id, true);
        return { ok: true, user: newUser };
    };

    const logout = useCallback((scope: AuthScope) => {
        try {
            sessionStorage.removeItem(SESSION_KEYS[scope]);
            localStorage.removeItem(SESSION_KEYS[scope]);
        } catch {
            /* bỏ qua */
        }
        setSessions((s) => ({ ...s, [scope]: null }));
    }, []);

    const value: AuthState = { sessions, login, register, logout };
    return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
};

/** Người dùng & thao tác đăng nhập của PHẠM VI hiện tại (khách hàng hoặc nội bộ). */
export const useAuth = () => {
    const state = useContext(AuthStateContext);
    const scope = useContext(AuthScopeContext);
    const { db } = useStore();
    const sessionId = state?.sessions[scope] ?? null;

    const user = useMemo(() => {
        const u = db.users.find((x) => x.id === sessionId && x.status === 'active');
        return u && belongsTo(u, scope) ? u : null;
    }, [db.users, sessionId, scope]);

    const can = useCallback(
        (p: Permission) => !!user && (user.role === 'admin' || user.permissions.includes(p)),
        [user],
    );

    if (!state) throw new Error('useAuth phải nằm trong <AuthProvider>');
    const { login, register, logout } = state;
    return {
        user,
        scope,
        /** Trang chính sau khi đăng nhập: /account (khách) hoặc /portal (nội bộ). */
        homePath: HOME_PATHS[scope],
        loginPath: LOGIN_PATHS[scope],
        can,
        login: (identifier: string, password: string, remember: boolean) => login(identifier, password, scope, remember),
        register,
        logout: () => logout(scope),
    };
};

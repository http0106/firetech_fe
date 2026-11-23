import type { ReactNode } from 'react';
import { Card } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import Logo from '../componentmain/Logo';

/**
 * Bố cục trang đăng nhập / đăng ký: thanh trên cùng giống Header (logo + về trang chủ),
 * form đặt trong Card ở giữa trang. Dùng chung cho trang khách hàng và trang nội bộ.
 */
export const AuthShell = ({ children, backTo = '/', backLabel = 'Về trang chủ' }: { children: ReactNode; backTo?: string; backLabel?: string }) => (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
        <header className="w-full shadow-md border-b" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="no-underline">
                    <Logo />
                </Link>
                <Link to={backTo} className="text-xs font-medium no-underline hover:!text-[#FF4D4D]" style={{ color: 'var(--text-h)' }}>
                    &larr; {backLabel}
                </Link>
            </div>
        </header>
        <main className="flex-1 flex justify-center px-4 py-10">
            <div className="w-full max-w-[460px]">
                <Card>{children}</Card>
            </div>
        </main>
    </div>
);

const AuthLayout = () => (
    <AuthShell>
        <Outlet />
    </AuthShell>
);

export default AuthLayout;

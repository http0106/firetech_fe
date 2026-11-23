import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Permission, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { Forbidden } from './ui';

/**
 * Bảo vệ route theo phạm vi đăng nhập hiện tại:
 * - Chưa đăng nhập → /login (khách hàng) hoặc /portal/login (nội bộ), kèm ?redirect=...
 * - Sai vai trò hoặc thiếu quyền → trang 403.
 */
const RequireAuth = ({ children, roles, permission }: { children: ReactNode; roles?: Role[]; permission?: Permission }) => {
    const { user, can, loginPath } = useAuth();
    const location = useLocation();

    if (!user) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`${loginPath}?redirect=${redirect}`} replace />;
    }
    if (roles && !roles.includes(user.role)) return <Forbidden />;
    if (permission && !can(permission)) return <Forbidden />;
    return <>{children}</>;
};

export default RequireAuth;

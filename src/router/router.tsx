import { createBrowserRouter } from 'react-router-dom';
import Home from '../users/Home';
import Login from '../layout/Login';
import Register from '../layout/Register';
import Products from '../users/Products';
import NotFound, { RouteError } from '../users/NotFound';
import AuthLayout from '../layout/AuthLayout';
import RequireAuth from '../componentmain/RequireAuth';
import PublicLayout from '../layout/PublicLayout';
import Introduction from '../users/Introduction';
import ProductDetail from '../users/ProductDetail';
import Cart from '../users/Cart';
import Compare from '../users/Compare';
import Documents from '../users/Documents';
import Services from '../users/Services';
import Monitoring from '../users/Monitoring';
import Contact from '../users/Contact';
import type { ComponentType } from 'react';
import type { Permission } from '../types';

const page = (loader: () => Promise<{ default: ComponentType }>, permission?: Permission) => ({
    lazy: async () => {
        const { default: Page } = await loader();
        if (!permission) return { Component: Page };
        const Guarded = () => (
            <RequireAuth permission={permission}>
                <Page />
            </RequireAuth>
        );
        return { Component: Guarded };
    },
});

export const router = createBrowserRouter([
    {
        path: '/',
        element: <PublicLayout />,
        errorElement: <RouteError />,
        children: [
            { index: true, element: <Home /> },
            { path: 'introduction', element: <Introduction /> },
            { path: 'products', element: <Products /> },
            { path: 'products/:id', element: <ProductDetail /> },
            { path: 'cart', element: <Cart /> },
            { path: 'compare', element: <Compare /> },
            { path: 'documents', element: <Documents /> },
            { path: 'services', element: <Services /> },
            { path: 'monitoring', element: <Monitoring /> },
            { path: 'contact', element: <Contact /> },
            {
                path: 'account',
                lazy: async () => {
                    const { default: AccountLayout } = await import('../layout/AccountLayout');
                    return {
                        Component: () => (
                            <RequireAuth roles={['customer']}>
                                <AccountLayout />
                            </RequireAuth>
                        ),
                    };
                },
                children: [
                    { index: true, ...page(() => import('../account/Overview')) },
                    { path: 'projects', ...page(() => import('../account/MyProjects')) },
                    { path: 'projects/:id', ...page(() => import('../account/MyProjectDetail')) },
                    { path: 'orders', ...page(() => import('../account/MyOrders')) },
                    { path: 'quotes', ...page(() => import('../account/MyQuotes')) },
                    { path: 'reviews', ...page(() => import('../account/MyReviews')) },
                    { path: 'profile', ...page(() => import('../componentmain/ProfilePage')) },
                ],
            },
            { path: '*', element: <NotFound /> },
        ],
    },
    {
        element: <AuthLayout />,
        errorElement: <RouteError />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
        ],
    },
]);


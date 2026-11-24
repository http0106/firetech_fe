import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layout/PublicLayout';
import AccountLayout from '../layout/AccountLayout';
import PortalLayout from '../layout/PortalLayout';
import NotFound, { RouteError } from '../users/NotFound';
// Website công khai
import Home from '../users/Home';
import Introduction from '../users/Introduction';
import Products from '../users/Products';
import ProductDetail from '../users/ProductDetail';
import Cart from '../users/Cart';
import Compare from '../users/Compare';
import Documents from '../users/Documents';
import Services from '../users/Services';
import Monitoring from '../users/Monitoring';
import Contact from '../users/Contact';
import Login from '../auth/Login';
import Register from '../auth/Register';
import StaffRegister from '../auth/StaffRegister';
// Tài khoản khách hàng
import Overview from '../account/Overview';
import MyProjects from '../account/MyProjects';
import MyProjectDetail from '../account/MyProjectDetail';
import MyOrders from '../account/MyOrders';
import MyQuotes from '../account/MyQuotes';
import MyReviews from '../account/MyReviews';
import ProfilePage from '../components/ProfilePage';
// Trang nội bộ nhân viên
import Dashboard from '../portal/Dashboard';
import Chat from '../portal/Chat';
import Quotes from '../portal/Quotes';
import Orders from '../portal/Orders';
import ReviewsAdmin from '../portal/ReviewsAdmin';
import Projects from '../portal/Projects';
import Schedule from '../portal/Schedule';
import Invoices from '../portal/Invoices';
import Reports from '../portal/Reports';
import ProductsAdmin from '../portal/ProductsAdmin';
import DocumentsAdmin from '../portal/DocumentsAdmin';
import Users from '../portal/Users';
import Settings from '../portal/Settings';

/**
 * SƠ ĐỒ TRANG
 *  /                  Website công khai — ai cũng xem được
 *  /login, /register                 Đăng nhập / đăng ký KHÁCH HÀNG
 *  /portal/login, /portal/register   Đăng nhập / đăng ký NHÂN VIÊN (đăng ký xong chờ Admin duyệt)
 *  /account/...       Tài khoản khách hàng — AccountLayout chặn nếu không phải khách hàng
 *  /portal/...        Trang nội bộ — PortalLayout chặn theo vai trò (xem ROLE_PAGES trong data/constants.ts)
 */
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
            // Đăng nhập / đăng ký: khách hàng và nhân viên dùng trang riêng
            // (key khác nhau để 2 trang đăng nhập không dùng chung dữ liệu form khi chuyển qua lại)
            { path: 'login', element: <Login key="customer" /> },
            { path: 'register', element: <Register /> },
            { path: 'portal/login', element: <Login key="staff" staff /> },
            { path: 'portal/register', element: <StaffRegister /> },
            {
                path: 'account',
                element: <AccountLayout />,
                children: [
                    { index: true, element: <Overview /> },
                    { path: 'projects', element: <MyProjects /> },
                    { path: 'projects/:id', element: <MyProjectDetail /> },
                    { path: 'orders', element: <MyOrders /> },
                    { path: 'quotes', element: <MyQuotes /> },
                    { path: 'reviews', element: <MyReviews /> },
                    { path: 'profile', element: <ProfilePage /> },
                ],
            },
            { path: '*', element: <NotFound /> },
        ],
    },
    {
        path: '/portal',
        element: <PortalLayout />,
        errorElement: <RouteError />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'chat', element: <Chat /> },
            { path: 'quotes', element: <Quotes /> },
            { path: 'orders', element: <Orders /> },
            { path: 'reviews', element: <ReviewsAdmin /> },
            { path: 'projects', element: <Projects /> },
            { path: 'schedule', element: <Schedule /> },
            { path: 'invoices', element: <Invoices /> },
            { path: 'reports', element: <Reports /> },
            { path: 'products', element: <ProductsAdmin /> },
            { path: 'documents', element: <DocumentsAdmin /> },
            { path: 'users', element: <Users /> },
            { path: 'settings', element: <Settings /> },
            { path: 'profile', element: <ProfilePage /> },
        ],
    },
]);

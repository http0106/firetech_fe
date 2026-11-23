import './App.css'
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { router } from './router/router';

/**
 * Thứ tự provider (ngoài → trong):
 *  Theme (antd + message/notification) → Store (dữ liệu) → Auth (phiên đăng nhập) → Shop (giỏ hàng, so sánh).
 * Thông báo (NotificationProvider) nằm trong từng layout vì phụ thuộc phạm vi đăng nhập (khách / nội bộ).
 * Nút nổi hỗ trợ (Chat, Zalo, Hotline) và modal QR Zalo nằm trong layout/PublicLayout.tsx.
 */
function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <ShopProvider>
            <RouterProvider router={router} />
          </ShopProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}

export default App

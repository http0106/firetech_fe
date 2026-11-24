import { useLayoutEffect, useState } from 'react';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { RouterProvider } from 'react-router-dom';
import { StoreProvider } from './store';
import { router } from './router/router';

/**
 * Gốc ứng dụng:
 *  ConfigProvider (tiếng Việt, sáng/tối cho Ant Design) → AntApp (để dùng message, modal)
 *  → StoreProvider (dữ liệu, đăng nhập, giỏ hàng) → các trang (xem router/router.tsx).
 */
const App = () => {
    // Sáng / tối: ban đầu theo cài đặt của máy; đổi bằng nút trong menu tài khoản (AccountMenu)
    const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Gắn class "dark" lên thẻ <html> → CSS (index.css) và Tailwind (class dark:...) đổi màu.
    // useLayoutEffect chạy trước khi vẽ màn hình nên không bị nháy trắng.
    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    return (
        <ConfigProvider locale={viVN} theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
            {/* component={false}: không bọc thêm thẻ div → giữ kiểu chữ của index.css */}
            <AntApp component={false}>
                <StoreProvider dark={dark} toggleDark={() => setDark(!dark)}>
                    <RouterProvider router={router} />
                </StoreProvider>
            </AntApp>
        </ConfigProvider>
    );
};

export default App;

import { useEffect, useState, type ReactNode } from 'react';
import { App as AntApp, ConfigProvider, theme as antTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';

/**
 * Ant Design dùng THEME MẶC ĐỊNH như phiên bản cũ (màu chính xanh, nút hành động dùng `danger` màu đỏ).
 * Chế độ sáng/tối theo hệ điều hành — giống CSS cũ (`prefers-color-scheme` trong index.css và
 * class `dark:` của Tailwind). Khi máy ở chế độ tối, antd dùng darkAlgorithm để các ô nhập, modal,
 * dropdown cùng tông với trang (thay cho các class `dark:[&_.ant-modal-content]...` vá tay trước đây).
 * Ngôn ngữ antd: tiếng Việt.
 */
const DARK_QUERY = '(prefers-color-scheme: dark)';

const useSystemDark = () => {
    const [dark, setDark] = useState(() => window.matchMedia?.(DARK_QUERY).matches ?? false);
    useEffect(() => {
        const mq = window.matchMedia?.(DARK_QUERY);
        if (!mq) return;
        const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return dark;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const dark = useSystemDark();
    return (
        <ConfigProvider locale={viVN} theme={{ algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}>
            {/* component={false}: không bọc thêm thẻ div có font/cỡ chữ riêng của antd → giữ kiểu chữ gốc của index.css */}
            <AntApp component={false}>{children}</AntApp>
        </ConfigProvider>
    );
};

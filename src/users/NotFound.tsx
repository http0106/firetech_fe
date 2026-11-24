import { Button, Result } from 'antd';
import { useNavigate, useRouteError } from 'react-router-dom';

/** Trang 404 — địa chỉ không tồn tại. */
export const NotFound = () => {
    const navigate = useNavigate();
    return (
        <Result
            status="404"
            title="Không tìm thấy trang"
            subTitle="Trang bạn tìm không tồn tại hoặc đã được di chuyển."
            extra={[
                <Button key="home" type="primary" danger onClick={() => navigate('/')}>Về trang chủ</Button>,
                <Button key="products" onClick={() => navigate('/products')}>Xem sản phẩm</Button>,
            ]}
        />
    );
};

/** Lỗi không mong muốn khi render một route. */
export const RouteError = () => {
    const error = useRouteError() as Error | undefined;
    return (
        <Result
            status="500"
            title="Đã có lỗi xảy ra"
            subTitle={error?.message ?? 'Vui lòng tải lại trang.'}
            extra={<Button type="primary" danger onClick={() => window.location.assign('/')}>Về trang chủ</Button>}
        />
    );
};

export default NotFound;

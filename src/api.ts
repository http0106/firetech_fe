import type { Db, Settings } from './types';

/**
 * GỌI API BACKEND — file DUY NHẤT trong app nói chuyện với server.
 *
 * ● Hiện tại chưa có backend → app dùng dữ liệu mẫu trong src/data, các hàm bên dưới không gửi gì đi.
 *
 * ● Khi có backend: tạo file `.env` ở thư mục gốc dự án, ghi 1 dòng
 *       VITE_API_URL=http://localhost:3001
 *   rồi chạy lại `npm run dev`. Từ đó app tự gọi:
 *       Mở web     GET    /users, /products, /orders, ... và GET /settings
 *       Thêm       POST   /products            body = sản phẩm mới
 *       Sửa        PATCH  /products/p1         body = chỉ các trường thay đổi, vd { "price": 250000 }
 *       Xóa        DELETE /products/p1
 *       Cài đặt    PUT    /settings            body = toàn bộ cài đặt
 *   Backend chỉ cần làm đúng các đường dẫn trên (dữ liệu dạng JSON, mỗi bản ghi có trường "id").
 *   Tên bảng = tên trong kiểu Db (src/types.ts): users, products, projects, workOrders, orders,
 *   quotes, invoices, reviews, documents, chats.
 */
const API_URL: string = import.meta.env.VITE_API_URL ?? '';

/** Có backend hay không (có khai báo VITE_API_URL). */
export const hasBackend = API_URL !== '';

/** Gửi 1 yêu cầu tới server và trả về dữ liệu JSON. Chưa có backend thì không làm gì. */
const request = async (method: string, path: string, body?: unknown) => {
    if (!hasBackend) return null;
    const res = await fetch(API_URL + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${method} ${path} lỗi ${res.status}`);
    return res.json();
};

/** Các bảng dữ liệu dạng danh sách (mỗi phần tử có id). */
export type Collection = Exclude<keyof Db, 'settings'>;

export const api = {
    /** Tải toàn bộ dữ liệu lúc mở web. */
    loadAll: async (): Promise<Db> => {
        const [users, products, projects, workOrders, orders, quotes, invoices, reviews, documents, chats, settings] =
            await Promise.all([
                request('GET', '/users'),
                request('GET', '/products'),
                request('GET', '/projects'),
                request('GET', '/workOrders'),
                request('GET', '/orders'),
                request('GET', '/quotes'),
                request('GET', '/invoices'),
                request('GET', '/reviews'),
                request('GET', '/documents'),
                request('GET', '/chats'),
                request('GET', '/settings'),
            ]);
        return { users, products, projects, workOrders, orders, quotes, invoices, reviews, documents, chats, settings };
    },

    create: (collection: Collection, item: object) => request('POST', `/${collection}`, item),

    update: (collection: Collection, id: string, changes: object) => request('PATCH', `/${collection}/${id}`, changes),

    remove: (collection: Collection, id: string) => request('DELETE', `/${collection}/${id}`),

    saveSettings: (settings: Settings) => request('PUT', '/settings', settings),
};

import type { Product } from '../../types';
import ProductCard from './ProductCard.tsx';

/**
 * Lưới sản phẩm — giữ tiêu đề và cách chia cột theo `row` như phiên bản cũ.
 * Đã sửa: nhận danh sách sản phẩm từ ngoài (dữ liệu dùng chung), co giãn trên điện thoại
 * (2 cột → 3 cột → `row` cột), key theo id, bỏ console.log.
 */
const COLS: Record<number, string> = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

const ProductList = ({
    row,
    products,
    showTitle = true,
    title = 'Thiết Bị PCCC Kiểm Định BCA',
    subtitle = 'Chính hãng, đạt chuẩn chất lượng cho nhà xưởng, văn phòng và hộ gia đình.',
}: {
    row: number;
    products: Product[];
    showTitle?: boolean;
    title?: string;
    subtitle?: string;
}) => (
    <>
        {showTitle && (
            <div className="mb-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E48] dark:text-slate-100">{title}</h2>
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            </div>
        )}

        <div className={`grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-3 ${COLS[row] ?? 'lg:grid-cols-4'}`}>
            {products.map((item) => (
                <ProductCard key={item.id} item={item} />
            ))}
        </div>
    </>
);

export default ProductList;

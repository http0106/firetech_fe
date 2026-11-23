import Banner from './component/Banner';
import ProductList from './component/ProductList';
import { useStore } from '../context/StoreContext';

const Home = () => {
    const { products } = useStore().db;
    // Ưu tiên sản phẩm nổi bật; nếu chưa đánh dấu sản phẩm nào thì lấy 8 sản phẩm đầu
    const featured = products.filter((p) => p.featured);
    const list = (featured.length ? featured : products).slice(0, 8);

    return (
        <div className="w-full min-h-screen pb-16">
            <Banner />
            <ProductList row={4} products={list} />
        </div>
    );
};

export default Home;

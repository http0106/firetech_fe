import { Link } from 'react-router-dom';
import Banner from './component/Banner';
import ProductList from './component/ProductList';
import { useStore } from '../store';
import FireScenarios from './component/FireScenarios';
import { SectionTitle } from '../components/ui';
import { Button, Card } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { useState } from 'react';
const Home = () => {
    const { products } = useStore().db;
    const featured = products.filter((p) => p.featured).slice(0, 8);
const PLANS = [
    { name: 'Cơ bản', cycle: '12 tháng/lần', price: 'Từ 1.500.000đ/năm', fit: 'Hộ gia đình, cửa hàng', features: ['Kiểm tra, nạp sạc bình chữa cháy', 'Kiểm tra đèn Exit, đèn sự cố', 'Biên bản bảo trì'] },
    { name: 'Tiêu chuẩn', cycle: '6 tháng/lần', price: 'Từ 4.500.000đ/năm', fit: 'Văn phòng, nhà xưởng', features: ['Gồm gói Cơ bản', 'Thử đầu báo, chuông, nút ấn', 'Đo ắc quy tủ trung tâm', 'Ưu tiên xử lý sự cố trong 4 giờ'] },
    { name: 'Toàn diện', cycle: '3 tháng/lần', price: 'Báo giá theo công trình', fit: 'Khách sạn, chung cư, nhà máy', features: ['Gồm gói Tiêu chuẩn', 'Kiểm tra áp lực họng nước vách tường', 'Huấn luyện PCCC cơ sở hằng năm', 'Hỗ trợ sự cố 24/7 trong 2 giờ'] },
];
  const [plan, setPlan] = useState<string | null>(null);
    return (
        <div className="w-full min-h-screen pb-16">
            <Banner />
            <ProductList row={4} products={featured} />
            <div className="text-center mt-8">
                <Link to="/products" className="text-sm font-semibold text-blue-600 hover:underline">
                    Xem tất cả sản phẩm &rarr;
                </Link>
            </div>
            <FireScenarios />
             <SectionTitle title="Giám Sát & Cứu Hộ" subtitle="Bảo trì định kỳ và hỗ trợ sự cố hệ thống PCCC cho công trình." />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((p) => (
                    <Card key={p.name} size="small" title={`Gói ${p.name}`} extra={<span className="text-xs text-slate-500">{p.cycle}</span>}>
                        <div className="text-base font-extrabold text-red-600">{p.price}</div>
                        <div className="text-xs text-slate-500 mb-3">{p.fit}</div>
                        <div className="space-y-2 mb-4">
                            {p.features.map((f) => (
                                <div key={f} className="flex items-start gap-2">
                                    <CheckCircleFilled className="text-red-600 mt-1 shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
                                </div>
                            ))}
                        </div>
                        <Button block onClick={() => setPlan(p.name)}>Đăng ký</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Home;

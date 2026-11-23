import { Card, Rate } from 'antd';
import Banner from './component/Banner';
import AboutSection from './component/AboutSection';
import Skill from './component/Skill';
import Partner from './component/Partner';
import FireScenarios from './component/FireScenarios';
import WarrantyPolicy from './component/WarrantyPolicy';
import ReviewList from './component/ReviewList';
import { SectionTitle } from '../componentmain/ui';
import { useLookup, useStore } from '../context/StoreContext';

/**
 * Trang Giới thiệu: giữ các phần cũ (Banner, AboutSection, Skill, Partner) và thêm theo yêu cầu dự án:
 * tình huống cháy & thiết bị bảo hộ (#tinh-huong), bảo hành & hậu mãi (#bao-hanh), đánh giá dịch vụ (#danh-gia).
 */
const Introduction = () => {
    const { db } = useStore();
    const lookup = useLookup();
    const reviews = db.reviews.filter((r) => r.targetType === 'service' && !r.hidden);
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    return (
        <>
            <Banner />
            <AboutSection />
            <Skill />
            <FireScenarios />
            <WarrantyPolicy />

            <section id="danh-gia" className="py-12 scroll-mt-36">
                <SectionTitle title="Khách Hàng Đánh Giá" subtitle="Đánh giá từ khách hàng đã thi công và bảo trì cùng Fire Tech." />
                <Card size="small">
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
                        <span className="text-3xl font-extrabold text-[#0B1E48] dark:text-slate-100">
                            {avg.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                        </span>
                        <div>
                            <Rate disabled allowHalf value={Math.round(avg * 2) / 2} style={{ fontSize: 14 }} />
                            <div className="text-xs text-slate-500">{reviews.length} đánh giá dịch vụ</div>
                        </div>
                    </div>
                    <ReviewList reviews={reviews} renderTarget={(r) => lookup.project(r.targetId)?.buildingType} />
                </Card>
            </section>

            <Partner />
        </>
    );
};

export default Introduction;

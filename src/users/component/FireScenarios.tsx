import { useState } from 'react';
import { Card, Tabs } from 'antd';
import { useLookup } from '../../store';
import { SectionTitle } from '../../components/ui';
import ProductCard from './ProductCard';
import type { Product } from '../../types';

/** Các tình huống cháy hiển thị trong các tab. productIds = id sản phẩm gợi ý (xem src/data/products.ts). */
interface FireScenario {
    key: string;
    title: string;
    place: string;
    causes: string[];
    /** Sản phẩm gợi ý (id) */
    productIds: string[];
    tips: string[];
}

const FIRE_SCENARIOS: FireScenario[] = [
    {
        key: 'bep',
        title: 'Cháy bếp & rò rỉ gas',
        place: 'Hộ gia đình, nhà hàng, bếp ăn tập thể',
        causes: ['Rò rỉ gas, dây dẫn gas lão hóa', 'Dầu mỡ quá nhiệt bắt lửa', 'Quên tắt bếp, để vật dễ cháy gần lửa'],
        productIds: ['p10', 'p2', 'p21', 'p6'],
        tips: [
            'Khóa van bình gas trước khi xử lý.',
            'Không dùng nước dập chảo dầu đang cháy — trùm chăn chiên kín miệng chảo.',
            'Bếp nên dùng đầu báo nhiệt thay đầu báo khói để tránh báo giả.',
        ],
    },
    {
        key: 'dien',
        title: 'Chập điện & cháy thiết bị điện',
        place: 'Văn phòng, phòng server, tủ điện tòa nhà',
        causes: ['Quá tải ổ cắm, dây dẫn xuống cấp', 'Thiết bị sạc để qua đêm', 'Tủ điện ẩm, bụi bẩn'],
        productIds: ['p6', 'p7', 'p20', 'p22'],
        tips: [
            'Ngắt cầu dao/aptomat trước khi chữa cháy.',
            'Ưu tiên bình CO2 — không để lại cặn, không dẫn điện.',
            'Không dùng nước hoặc bình bọt cho đám cháy điện đang có điện.',
        ],
    },
    {
        key: 'nha-xuong',
        title: 'Cháy nhà xưởng & kho hàng',
        place: 'Xưởng may, kho vải, giấy, gỗ, kho logistics',
        causes: ['Hàng hóa dễ cháy chất cao sát trần, sát đèn', 'Hàn cắt kim loại không che chắn', 'Hút thuốc trong kho'],
        productIds: ['p4', 'p5', 'p13', 'p16', 'p18'],
        tips: [
            'Giữ lối thoát nạn thông thoáng, không chất hàng chắn tủ PCCC.',
            'Bố trí bình chữa cháy ở vị trí dễ thấy, cách nhau không quá 15 – 20 m.',
            'Tổ chức diễn tập PCCC ít nhất mỗi năm một lần.',
        ],
    },
    {
        key: 'cao-tang',
        title: 'Cháy chung cư & nhà cao tầng',
        place: 'Chung cư, khách sạn, nhà phố nhiều tầng',
        causes: ['Cháy lan từ căn hộ, kho chứa đồ ở hành lang', 'Khói độc lan qua thang bộ, giếng kỹ thuật', 'Lối thoát bị khóa hoặc chắn'],
        productIds: ['p9', 'p11', 'p19', 'p12'],
        tips: [
            'Dùng thang bộ, tuyệt đối không dùng thang máy khi có cháy.',
            'Đeo mặt nạ phòng độc hoặc che mũi bằng khăn ướt, cúi thấp người khi di chuyển.',
            'Nhà phố nên có lối thoát thứ hai (cửa sổ, ban công) và thang dây.',
        ],
    },
    {
        key: 'xe',
        title: 'Cháy ô tô & xe máy',
        place: 'Xe cá nhân, bãi đỗ xe, hầm gửi xe',
        causes: ['Chập điện do độ chế thiết bị', 'Rò rỉ nhiên liệu', 'Sạc xe điện sai cách trong hầm'],
        productIds: ['p1', 'p12', 'p4'],
        tips: [
            'Dừng xe, tắt máy, đưa mọi người ra khỏi xe trước.',
            'Chỉ chữa cháy khi đám cháy nhỏ; đứng đầu gió, cách 1,5 – 2 m.',
            'Không mở nắp capo khi đang cháy lớn — oxy sẽ làm lửa bùng lên.',
        ],
    },
];

/** Các trường hợp cháy thường gặp & thiết bị nên có (trang Giới thiệu). */
const FireScenarios = () => {
    const lookup = useLookup();
    const [active, setActive] = useState(FIRE_SCENARIOS[0].key);

    return (
        <section id="tinh-huong" className="py-12 scroll-mt-36">
            <SectionTitle title="Các Trường Hợp Cháy Thường Gặp" subtitle="Nguyên nhân, cách xử lý và thiết bị nên trang bị cho từng loại công trình." />

            <Tabs
                activeKey={active}
                onChange={setActive}
                items={FIRE_SCENARIOS.map((s) => ({
                    key: s.key,
                    label: s.title,
                    children: (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card size="small" title={s.place} className="lg:col-span-1">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-2">Nguyên nhân thường gặp</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-slate-300 m-0 mb-4">
                                    {s.causes.map((c) => <li key={c}>{c}</li>)}
                                </ul>
                                <h4 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-2">Xử lý & phòng ngừa</h4>
                                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600 dark:text-slate-300 m-0">
                                    {s.tips.map((t) => <li key={t}>{t}</li>)}
                                </ol>
                            </Card>
                            <div className="lg:col-span-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-3">Thiết bị nên trang bị</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {s.productIds
                                        .map((id) => lookup.product(id))
                                        .filter((p): p is Product => !!p)
                                        .slice(0, 3)
                                        .map((p) => <ProductCard key={p.id} item={p} />)}
                                </div>
                            </div>
                        </div>
                    ),
                }))}
            />
        </section>
    );
};

export default FireScenarios;

import { Card, Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { FIRE_SCENARIOS } from '../../data/content';
import { useLookup } from '../../context/StoreContext';
import { SectionTitle } from '../../componentmain/ui';
import ProductCard from './ProductCard.tsx';
import type { Product } from '../../types';

/**
 * Các trường hợp cháy thường gặp & thiết bị bảo hộ nên có (trang Giới thiệu).
 * Mở sẵn một tình huống qua URL: /introduction?scenario=bep#tinh-huong
 */
const FireScenarios = () => {
    const [params, setParams] = useSearchParams();
    const lookup = useLookup();
    const active = FIRE_SCENARIOS.find((s) => s.key === params.get('scenario'))?.key ?? FIRE_SCENARIOS[0].key;

    return (
        <section id="tinh-huong" className="py-12 scroll-mt-36">
            <SectionTitle title="Các Trường Hợp Cháy Thường Gặp" subtitle="Nguyên nhân, cách xử lý và thiết bị nên trang bị cho từng loại công trình." />

            <Tabs
                activeKey={active}
                onChange={(key) => setParams((p) => { p.set('scenario', key); return p; }, { replace: true, preventScrollReset: true })}
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

import { Button, Card, Drawer, Input, Segmented, Steps, Tag } from 'antd';
import { FaSearch } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState, PageHeader } from '../components/ui';
import { useStore } from '../store';
import { DOC_TYPES, categoryLabel } from '../data/constants';
import { formatDate, matches } from '../utils';

/**
 * Tài liệu & hướng dẫn: hướng dẫn sử dụng thiết bị, checklist tự kiểm tra, tiêu chuẩn, văn bản pháp quy.
 * URL: /documents?type=guide&q=...&doc=d1 (doc mở sẵn tài liệu).
 */
const QUICK_STEPS = [
    { title: 'Rút chốt', content: 'Lắc bình, rút chốt an toàn' },
    { title: 'Hướng vòi', content: 'Chĩa loa phun vào gốc lửa' },
    { title: 'Bóp cò', content: 'Đứng đầu gió, cách 1,5 – 2 m' },
    { title: 'Quét đều', content: 'Quét qua lại tới khi tắt hẳn' },
];

const Documents = () => {
    const { documents } = useStore().db;
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const type = params.get('type') ?? 'all';
    const q = params.get('q') ?? '';
    const openDoc = documents.find((d) => d.id === params.get('doc'));

    const set = (key: string, value: string | null) =>
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value);
            else next.delete(key);
            return next;
        }, { replace: true, preventScrollReset: true });

    const list = documents.filter((d) => (type === 'all' || d.type === type) && (!q || matches(`${d.title} ${d.summary}`, q)));

    return (
        <div className="py-8">
            <PageHeader title="Tài liệu & hướng dẫn" subtitle="Hướng dẫn sử dụng thiết bị, checklist kiểm tra, tiêu chuẩn và văn bản pháp quy về PCCC." />

            {(type === 'all' || type === 'guide') && (
                <Card size="small" title="Cách sử dụng bình chữa cháy xách tay" className="mb-6">
                    <div className="overflow-x-auto">
                        <Steps size="small" current={-1} items={QUICK_STEPS} className="min-w-[560px]" />
                    </div>
                </Card>
            )}

            <div className="flex flex-col md:flex-row gap-3 mb-5">
                <Input
                    key={q}
                    defaultValue={q}
                    allowClear
                    placeholder="Tìm tài liệu..."
                    prefix={<FaSearch className="w-3.5 h-3.5 mr-1.5 opacity-60" style={{ color: 'var(--text)' }} />}
                    onPressEnter={(e) => set('q', e.currentTarget.value.trim() || null)}
                    onClear={() => set('q', null)}
                    className="md:max-w-xs rounded-full text-xs"
                />
                <div className="overflow-x-auto">
                    <Segmented
                        value={type}
                        onChange={(v) => set('type', v === 'all' ? null : String(v))}
                        options={[{ label: 'Tất cả', value: 'all' }, ...Object.entries(DOC_TYPES).map(([value, t]) => ({ label: t.label, value }))]}
                    />
                </div>
            </div>

            {list.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map((d) => (
                        <Card key={d.id} size="small" hoverable onClick={() => set('doc', d.id)}>
                            <div className="flex items-center justify-between gap-2">
                                <Tag color={DOC_TYPES[d.type].color} className="m-0">{DOC_TYPES[d.type].label}</Tag>
                                <span className="text-xs text-slate-400">{formatDate(d.updatedAt)}</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 mt-2 mb-1">{d.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-3">{d.summary}</p>
                            <span className="text-xs font-semibold text-blue-600 mt-2 inline-block">Xem chi tiết &rarr;</span>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState title="Không có tài liệu phù hợp" />
            )}

            <Drawer
                open={!!openDoc}
                onClose={() => set('doc', null)}
                size={520}
                title={openDoc?.title}
            >
                {openDoc && (
                    <article>
                        <Tag color={DOC_TYPES[openDoc.type].color}>{DOC_TYPES[openDoc.type].label}</Tag>
                        <p className="text-sm text-slate-500 mt-3">{openDoc.summary}</p>
                        <ol className="mt-4 pl-5 space-y-2 text-sm text-gray-800 dark:text-slate-200">
                            {openDoc.steps.map((s) => <li key={s}>{s}</li>)}
                        </ol>
                        <div className="text-xs text-slate-400 mt-6">Cập nhật: {formatDate(openDoc.updatedAt)}</div>
                        {openDoc.category && (
                            <Button className="mt-4" block onClick={() => navigate(`/products?category=${openDoc.category}`)}>
                                Xem sản phẩm: {categoryLabel(openDoc.category)}
                            </Button>
                        )}
                    </article>
                )}
            </Drawer>
        </div>
    );
};

export default Documents;

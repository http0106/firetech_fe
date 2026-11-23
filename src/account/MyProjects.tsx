import { useState } from 'react';
import { Button, Tag } from 'antd';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { EmptyState, PageHeader, StatusTag } from '../componentmain/ui';
import RequestServiceModal from './RequestServiceModal';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { PROJECT_STATUS } from '../data/constants';
import { maintenanceInfo, warrantyInfo } from '../utils/business';
import { formatDate } from '../utils/format';
import type { Project } from '../types';

/**   Danh sách công trình của khách hàng. */
const MyProjects = () => {
    const { user } = useAuth();
    const { db } = useStore();
    const navigate = useNavigate();
    const [requestFor, setRequestFor] = useState<Project | null>(null);
    const projects = db.projects.filter((p) => p.customerId === user?.id);

    return (
        <div>
            <PageHeader title="Công trình & bảo trì" subtitle="Ngày thi công, lịch bảo trì, bảo hành thiết bị và lịch sử xử lý của từng công trình." />
            {projects.length ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {projects.map((p) => {
                        const m = maintenanceInfo(p.nextMaintenance);
                        const devices = p.devices.reduce((s, d) => s + d.quantity, 0);
                        const expired = p.devices.filter((d) => warrantyInfo(d.warrantyUntil).level === 'expired').length;
                        return (
                            <article key={p.id} className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3">
                                <div className="flex justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="m-0 font-bold text-[var(--text-h)] text-base">{p.name}</h2>
                                        <div className="text-xs text-[var(--text)]">{p.code} · {p.buildingType}</div>
                                    </div>
                                    <StatusTag map={PROJECT_STATUS} value={p.status} />
                                </div>
                                <div className="text-sm text-[var(--text)] flex gap-2"><FaMapMarkerAlt className="mt-1 shrink-0 text-red-500" />{p.address}</div>
                                <dl className="grid grid-cols-2 gap-3 text-sm m-0">
                                    <div><dt className="text-xs text-[var(--text)]">Ngày bàn giao</dt><dd className="m-0 text-[var(--text-h)] font-medium">{formatDate(p.handoverAt)}</dd></div>
                                    <div><dt className="text-xs text-[var(--text)]">Chu kỳ bảo trì</dt><dd className="m-0 text-[var(--text-h)] font-medium">{p.maintenanceCycleMonths} tháng</dd></div>
                                    <div>
                                        <dt className="text-xs text-[var(--text)]">Bảo trì kế tiếp</dt>
                                        <dd className="m-0 text-[var(--text-h)] font-medium">
                                            {p.status === 'active' ? <>{formatDate(p.nextMaintenance)} <Tag color={m.color} className="ml-1">{m.label}</Tag></> : '—'}
                                        </dd>
                                    </div>
                                    <div><dt className="text-xs text-[var(--text)]">Thiết bị</dt><dd className="m-0 text-[var(--text-h)] font-medium">{devices} ({expired} hết BH)</dd></div>
                                </dl>
                                <div className="flex gap-2 mt-auto pt-2">
                                    <Button type="primary" danger onClick={() => navigate(`/account/projects/${p.id}`)}>Xem chi tiết</Button>
                                    <Button onClick={() => setRequestFor(p)}>Yêu cầu bảo trì / sửa chữa</Button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <EmptyState
                        title="Chưa có công trình nào được liên kết"
                        description="Nếu đã thi công với FireTech, hãy nhắn tư vấn viên mã công trình (in trên biên bản nghiệm thu) để được liên kết."
                        action={<Button type="primary" danger onClick={() => navigate('/services')}>Đăng ký khảo sát công trình mới</Button>}
                    />
                </div>
            )}
            <RequestServiceModal project={requestFor} onClose={() => setRequestFor(null)} />
        </div>
    );
};

export default MyProjects;

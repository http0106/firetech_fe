import { useState, type ReactNode } from 'react';
import { Segmented, Table } from 'antd';
import { Panel } from './ui';

/**
 * Biểu đồ cột tự vẽ bằng div (không cần thư viện chart).
 * - Chiều cao mỗi cột = giá trị / giá trị lớn nhất.
 * - Di chuột vào cột để xem giá trị.
 * - ChartCard có nút chuyển sang dạng bảng.
 */
interface Datum {
    label: string;
    value: number;
}

const BarChart = ({
    data,
    format = (n) => n.toLocaleString('vi-VN'),
    axisFormat = format,
    height = 220,
}: {
    data: Datum[];
    format?: (n: number) => string;
    axisFormat?: (n: number) => string;
    height?: number;
}) => {
    const max = Math.max(...data.map((d) => d.value), 1); // cột cao nhất = 100%
    const ticks = [0, 0.25, 0.5, 0.75, 1]; // 5 vạch kẻ ngang: 0%, 25%, 50%, 75%, 100%
    return (
        <div>
            <div className="relative" style={{ height }}>
                {ticks.map((t) => (
                    <div key={t} className="absolute left-0 right-0 flex items-center gap-2" style={{ bottom: `${t * 100}%` }}>
                        <span className="w-12 shrink-0 text-right text-[11px] text-[var(--text)] translate-y-1/2">{axisFormat(max * t)}</span>
                        <span className={`flex-1 border-t ${t === 0 ? 'border-solid' : 'border-dashed'} border-[var(--border)]`} />
                    </div>
                ))}
                <div className="absolute inset-0 left-14 flex items-end gap-2">
                    {data.map((d, i) => {
                        const pct = (d.value / max) * 100;
                        // Nửa phải neo tooltip theo mép phải để không tràn khỏi khung (nhất là trên điện thoại)
                        const anchor = i < data.length / 2 ? 'left-0' : 'right-0';
                        return (
                            <div key={d.label} className="group relative flex-1 h-full flex items-end justify-center">
                                <div
                                    className="w-full max-w-[44px] rounded-t-[4px] transition-opacity group-hover:opacity-80"
                                    style={{ height: `${pct}%`, minHeight: d.value > 0 ? 2 : 0, background: 'var(--chart-1)' }}
                                />
                                <div
                                    className={`pointer-events-none absolute ${anchor} z-10 hidden group-hover:block whitespace-nowrap rounded-md bg-[var(--text-h)] text-[var(--bg)] text-xs px-2 py-1 shadow`}
                                    style={{ bottom: `calc(${pct}% + 6px)` }}
                                >
                                    <span className="opacity-70">{d.label}: </span>
                                    <b>{format(d.value)}</b>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="flex gap-2 pl-14 mt-2">
                {data.map((d) => (
                    <span key={d.label} className="flex-1 text-center text-[11px] text-[var(--text)] truncate">
                        {d.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export const ChartCard = ({
    title,
    data,
    format,
    axisFormat,
    valueTitle = 'Giá trị',
    extra,
}: {
    title: ReactNode;
    data: Datum[];
    format?: (n: number) => string;
    axisFormat?: (n: number) => string;
    valueTitle?: string;
    extra?: ReactNode;
}) => {
    const [view, setView] = useState<'chart' | 'table'>('chart');
    return (
        <Panel
            title={title}
            extra={
                <div className="flex items-center gap-2">
                    {extra}
                    <Segmented
                        size="small"
                        value={view}
                        onChange={(v) => setView(v as 'chart' | 'table')}
                        options={[
                            { label: 'Biểu đồ', value: 'chart' },
                            { label: 'Bảng', value: 'table' },
                        ]}
                    />
                </div>
            }
        >
            {view === 'chart' ? (
                <BarChart data={data} format={format} axisFormat={axisFormat} />
            ) : (
                <Table
                    size="small"
                    pagination={false}
                    rowKey="label"
                    dataSource={data}
                    columns={[
                        { title: 'Kỳ', dataIndex: 'label' },
                        { title: valueTitle, dataIndex: 'value', align: 'right', render: (v: number) => (format ? format(v) : v) },
                    ]}
                />
            )}
        </Panel>
    );
};

/** Danh sách thanh ngang — xếp hạng (top sản phẩm, doanh thu theo danh mục...). */
export const HBarList = ({
    items,
    format = (n) => n.toLocaleString('vi-VN'),
}: {
    items: { label: ReactNode; value: number; key: string; hint?: ReactNode }[];
    format?: (n: number) => string;
}) => {
    const max = Math.max(...items.map((i) => i.value), 1);
    return (
        <div className="flex flex-col gap-3">
            {items.map((i) => (
                <div key={i.key}>
                    <div className="flex justify-between gap-3 text-sm">
                        <span className="text-[var(--text-h)] truncate">{i.label}</span>
                        <span className="text-[var(--text-h)] font-semibold shrink-0">{format(i.value)}</span>
                    </div>
                    <div className="h-2 mt-1.5 rounded-full bg-gray-50 dark:bg-slate-800/50 overflow-hidden">
                        <div className="h-full rounded-r-[4px]" style={{ width: `${(i.value / max) * 100}%`, background: 'var(--chart-1)' }} />
                    </div>
                    {i.hint && <div className="text-xs text-[var(--text)] mt-1">{i.hint}</div>}
                </div>
            ))}
        </div>
    );
};

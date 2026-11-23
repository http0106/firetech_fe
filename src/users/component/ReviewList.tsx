import { Avatar, Rate } from 'antd';
import type { ReactNode } from 'react';
import type { Review } from '../../types';
import { formatDate } from '../../utils/format';

/** Danh sách đánh giá + phản hồi của Fire Tech. */
const ReviewList = ({ reviews, renderTarget }: { reviews: Review[]; renderTarget?: (r: Review) => ReactNode }) => (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
        {reviews.map((r) => (
            <div key={r.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <Avatar size={40} className="shrink-0" style={{ backgroundColor: 'var(--text-h)', color: 'var(--bg)' }}>
                    {r.userName.split(' ').pop()?.[0]}
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 text-sm">
                        <b className="text-gray-800 dark:text-slate-100">{r.userName}</b>
                        <Rate disabled value={r.rating} style={{ fontSize: 12 }} />
                        <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                    </div>
                    {renderTarget && <div className="text-xs text-gray-400 dark:text-slate-500">{renderTarget(r)}</div>}
                    <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">{r.comment}</p>
                    {r.reply && (
                        <p className="text-sm mt-2 pl-3 border-l-2 border-red-500 text-gray-600 dark:text-slate-400">
                            <b className="text-red-600">Fire Tech:</b> {r.reply}
                        </p>
                    )}
                </div>
            </div>
        ))}
    </div>
);

export default ReviewList;

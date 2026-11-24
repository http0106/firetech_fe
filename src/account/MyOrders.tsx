import { App, Button, Popconfirm, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatusTag } from '../components/ui';
import { useStore, useLookup } from '../store';
import { ORDER_STATUS } from '../data/constants';
import { formatDate, formatPrice } from '../utils';

/** Đơn hàng của khách: theo dõi trạng thái, hủy đơn chờ xác nhận, mua lại. */
const MyOrders = () => {
    const { db, edit, user, addToCart } = useStore();
    const lookup = useLookup();
    const { message } = App.useApp();
    const navigate = useNavigate();
    const orders = db.orders.filter((o) => o.customerId === user?.id);

    return (
        <div>
            <PageHeader title="Đơn hàng của tôi" subtitle="Bấm vào dòng để xem chi tiết sản phẩm." />
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={orders}
                    scroll={{ x: 720 }}
                    locale={{ emptyText: 'Bạn chưa có đơn hàng nào' }}
                    expandable={{
                        expandRowByClick: true,
                        expandedRowRender: (o) => (
                            <div className="flex flex-col gap-1 text-sm">
                                {o.items.map((i) => (
                                    <div key={i.productId} className="flex justify-between gap-3">
                                        <span>{i.quantity} × {lookup.product(i.productId)?.name}</span>
                                        <span>{formatPrice(i.price * i.quantity)}</span>
                                    </div>
                                ))}
                                <div className="text-[var(--text)] mt-1">Giao tới: {o.shippingAddress}{o.note ? ` · Ghi chú: ${o.note}` : ''}</div>
                            </div>
                        ),
                    }}
                    columns={[
                        { title: 'Mã đơn', dataIndex: 'code', render: (c: string) => <b>{c}</b> },
                        { title: 'Ngày đặt', dataIndex: 'createdAt', render: formatDate },
                        { title: 'Sản phẩm', render: (_, o) => `${o.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm` },
                        { title: 'Thanh toán', dataIndex: 'paymentMethod', render: (m: string) => (m === 'cod' ? 'COD' : 'Chuyển khoản') },
                        { title: 'Tổng tiền', dataIndex: 'total', align: 'right', render: (v: number) => <b>{formatPrice(v)}</b> },
                        { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <StatusTag map={ORDER_STATUS} value={s} /> },
                        {
                            title: '',
                            render: (_, o) => (
                                <div onClick={(e) => e.stopPropagation()} className="flex gap-2 justify-end">
                                    {o.status === 'pending' && (
                                        <Popconfirm
                                            title="Hủy đơn hàng này?"
                                            okText="Hủy đơn"
                                            cancelText="Không"
                                            onConfirm={() => {
                                                edit('orders', o.id, { status: 'cancelled' });
                                                message.success(`Đã hủy đơn ${o.code}`);
                                            }}
                                        >
                                            <Button size="small" danger>Hủy</Button>
                                        </Popconfirm>
                                    )}
                                    {(o.status === 'completed' || o.status === 'cancelled') && (
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                o.items.forEach((i) => addToCart(i.productId, i.quantity));
                                                navigate('/cart');
                                            }}
                                        >
                                            Mua lại
                                        </Button>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default MyOrders;

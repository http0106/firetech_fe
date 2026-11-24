import { useState } from 'react';
import { App, Button, Checkbox, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Table, Tag } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { ProductThumb, PageHeader } from '../components/ui';
import { useStore } from '../store';
import { CATEGORIES, STANDARDS, categoryLabel } from '../data/constants';
import { formatPrice, matches, moneyFormatter, moneyParser, uid } from '../utils';
import type { Product } from '../types';

/** Quản lý sản phẩm (Admin): thêm/sửa/xóa, tồn kho, nổi bật. */

type FormValues = Omit<Product, 'id' | 'specs'> & { specsText?: string };

const ProductsAdmin = () => {
    const { db, add, edit, remove } = useStore();
    const { message } = App.useApp();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('all');
    const [editing, setEditing] = useState<Product | 'new' | null>(null);

    const data = db.products.filter((p) => (category === 'all' || p.category === category) && (!search || matches(`${p.name} ${p.code} ${p.brand}`, search)));

    const save = (v: FormValues) => {
        const specs = (v.specsText ?? '')
            .split('\n')
            .map((line) => line.split(':'))
            .filter((parts) => parts.length >= 2 && parts[0].trim())
            .map(([label, ...rest]) => ({ label: label.trim(), value: rest.join(':').trim() }));
        const { specsText: _ignored, ...rest } = v;
        void _ignored;
        if (editing === 'new') {
            if (db.products.some((p) => p.code === v.code)) {
                message.error('Mã sản phẩm đã tồn tại');
                return;
            }
            add('products', { ...rest, id: uid('p'), specs });
            message.success('Đã thêm sản phẩm');
        } else if (editing) {
            edit('products', editing.id, { ...rest, specs });
            message.success('Đã cập nhật sản phẩm');
        }
        setEditing(null);
    };

    const initial =
        editing && editing !== 'new'
            ? { ...editing, specsText: editing.specs.map((s) => `${s.label}: ${s.value}`).join('\n') }
            : { category: 'binh-chua-chay', standards: ['coco'], warrantyMonths: 12, stock: 0 };

    return (
        <div>
            <PageHeader title="Sản phẩm" subtitle={`${db.products.length} sản phẩm`} extra={<Button type="primary" icon={<FaPlus />} onClick={() => setEditing('new')}>Thêm sản phẩm</Button>} />
            <div className="flex flex-wrap gap-3 mb-3">
                <Input.Search allowClear placeholder="Tên, mã, hãng" onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
                <Select value={category} onChange={setCategory} className="w-56" options={[{ value: 'all', label: 'Tất cả danh mục' }, ...CATEGORIES.map((c) => ({ value: c.key, label: c.label }))]} />
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={data}
                    scroll={{ x: 1000 }}
                    columns={[
                        {
                            title: 'Sản phẩm',
                            render: (_, p) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0"><ProductThumb product={p} size="sm" /></div>
                                    <span><b>{p.code}</b><br /><span className="text-sm">{p.name}</span></span>
                                </div>
                            ),
                        },
                        { title: 'Danh mục', dataIndex: 'category', render: categoryLabel },
                        { title: 'Hãng', dataIndex: 'brand' },
                        { title: 'Giá', dataIndex: 'price', align: 'right', render: formatPrice, sorter: (a, b) => a.price - b.price },
                        {
                            title: 'Tồn kho',
                            dataIndex: 'stock',
                            width: 110,
                            render: (v: number, p) => <InputNumber size="small" min={0} value={v} onChange={(n) => n !== null && edit('products', p.id, { stock: n })} status={v < 10 ? 'warning' : undefined} />,
                            sorter: (a, b) => a.stock - b.stock,
                        },
                        { title: 'BCA', render: (_, p) => (p.standards.includes('bca') ? <Tag color="red">Có</Tag> : '—') },
                        { title: 'Nổi bật', dataIndex: 'featured', render: (v: boolean, p) => <Switch size="small" checked={!!v} onChange={(c) => edit('products', p.id, { featured: c })} /> },
                        {
                            title: '',
                            render: (_, p) => (
                                <div className="flex gap-2">
                                    <Button size="small" onClick={() => setEditing(p)}>Sửa</Button>
                                    <Popconfirm
                                        title="Xóa sản phẩm này?"
                                        description="Đơn hàng và công trình cũ vẫn giữ lịch sử."
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        onConfirm={() => {
                                            remove('products', p.id);
                                            message.success('Đã xóa');
                                        }}
                                    >
                                        <Button size="small" danger>Xóa</Button>
                                    </Popconfirm>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            <Modal title={editing === 'new' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'} open={!!editing} onCancel={() => setEditing(null)} footer={null} destroyOnHidden width={720}>
                <Form<FormValues> layout="vertical" requiredMark={false} initialValues={initial as FormValues} onFinish={save}>
                    <div className="grid sm:grid-cols-[160px_minmax(0,1fr)] gap-x-3">
                        <Form.Item name="code" label="Mã" rules={[{ required: true }]}><Input disabled={editing !== 'new'} /></Form.Item>
                        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}><Input /></Form.Item>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-x-3">
                        <Form.Item name="category" label="Danh mục"><Select options={CATEGORIES.map((c) => ({ value: c.key, label: c.label }))} /></Form.Item>
                        <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="warrantyMonths" label="Bảo hành (tháng)"><InputNumber min={0} max={60} className="w-full" /></Form.Item>
                        <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}><InputNumber min={0} step={1000} className="w-full" formatter={moneyFormatter} parser={moneyParser} /></Form.Item>
                        <Form.Item name="oldPrice" label="Giá gốc (nếu giảm)"><InputNumber min={0} step={1000} className="w-full" formatter={moneyFormatter} parser={moneyParser} /></Form.Item>
                        <Form.Item name="stock" label="Tồn kho"><InputNumber min={0} className="w-full" /></Form.Item>
                    </div>
                    <Form.Item name="standards" label="Tiêu chuẩn & kiểm định">
                        <Checkbox.Group options={STANDARDS.map((s) => ({ value: s.key, label: s.label }))} />
                    </Form.Item>
                    <Form.Item name="image" label="Link ảnh (để trống dùng ảnh minh họa)"><Input placeholder="https://..." /></Form.Item>
                    <Form.Item name="description" label="Mô tả ngắn" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item name="specsText" label="Thông số kỹ thuật (mỗi dòng: Tên: Giá trị)"><Input.TextArea rows={4} placeholder={'Khối lượng: 4 kg\nTầm phun: 4 – 5 m'} /></Form.Item>
                    <Form.Item name="featured" valuePropName="checked"><Checkbox>Hiển thị ở mục nổi bật trang chủ</Checkbox></Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductsAdmin;

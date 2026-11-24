import { useState } from 'react';
import { App, Button, Form, Input, Modal, Popconfirm, Select, Table } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { PageHeader, StatusTag } from '../components/ui';
import { useStore } from '../store';
import { CATEGORIES, DOC_TYPES, categoryLabel } from '../data/constants';
import { formatDate, todayISO, uid } from '../utils';
import type { DocItem } from '../types';

/** Quản lý tài liệu chuyên ngành & hướng dẫn sử dụng (Admin). */
type FormValues = Omit<DocItem, 'id' | 'updatedAt' | 'steps'> & { stepsText: string };

const DocumentsAdmin = () => {
    const { db, add, edit, remove } = useStore();
    const { message } = App.useApp();
    const [editing, setEditing] = useState<DocItem | 'new' | null>(null);

    const save = (v: FormValues) => {
        const { stepsText, ...rest } = v;
        const doc = { ...rest, steps: stepsText.split('\n').map((s) => s.trim()).filter(Boolean), updatedAt: todayISO() };
        if (editing === 'new') add('documents', { ...doc, id: uid('d') });
        else if (editing) edit('documents', editing.id, doc);
        message.success('Đã lưu tài liệu');
        setEditing(null);
    };

    return (
        <div>
            <PageHeader title="Tài liệu" subtitle="Hiển thị tại trang /documents và trong tab Hướng dẫn của sản phẩm cùng danh mục." extra={<Button type="primary" icon={<FaPlus />} onClick={() => setEditing('new')}>Thêm tài liệu</Button>} />
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={db.documents}
                    scroll={{ x: 760 }}
                    columns={[
                        { title: 'Tiêu đề', dataIndex: 'title', render: (t: string, d) => <span><b>{t}</b><br /><span className="text-xs text-[var(--text)]">{d.summary}</span></span> },
                        { title: 'Loại', dataIndex: 'type', render: (t: string) => <StatusTag map={DOC_TYPES} value={t} /> },
                        { title: 'Danh mục', dataIndex: 'category', render: (c?: DocItem['category']) => (c ? categoryLabel(c) : '—') },
                        { title: 'Cập nhật', dataIndex: 'updatedAt', render: formatDate },
                        {
                            title: '',
                            render: (_, d) => (
                                <div className="flex gap-2">
                                    <Button size="small" onClick={() => setEditing(d)}>Sửa</Button>
                                    <Popconfirm title="Xóa tài liệu?" okText="Xóa" cancelText="Hủy" onConfirm={() => remove('documents', d.id)}>
                                        <Button size="small" danger>Xóa</Button>
                                    </Popconfirm>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
            <Modal title={editing === 'new' ? 'Thêm tài liệu' : 'Sửa tài liệu'} open={!!editing} onCancel={() => setEditing(null)} footer={null} destroyOnHidden width={640}>
                <Form<FormValues>
                    layout="vertical"
                    requiredMark={false}
                    onFinish={save}
                    initialValues={editing && editing !== 'new' ? { ...editing, stepsText: editing.steps.join('\n') } : { type: 'guide' }}
                >
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
                    <div className="grid grid-cols-2 gap-3">
                        <Form.Item name="type" label="Loại"><Select options={Object.entries(DOC_TYPES).map(([k, t]) => ({ value: k, label: t.label }))} /></Form.Item>
                        <Form.Item name="category" label="Danh mục sản phẩm liên quan"><Select allowClear options={CATEGORIES.map((c) => ({ value: c.key, label: c.label }))} /></Form.Item>
                    </div>
                    <Form.Item name="summary" label="Tóm tắt" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item name="stepsText" label="Nội dung (mỗi dòng một bước / một ý)" rules={[{ required: true }]}><Input.TextArea rows={6} /></Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default DocumentsAdmin;

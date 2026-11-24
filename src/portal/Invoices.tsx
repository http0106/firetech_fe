import { useState } from 'react';
import { App, Button, Form, Input, InputNumber, Modal, Segmented, Select, Table } from 'antd';
import { FaExclamationTriangle, FaFileInvoiceDollar, FaHandHoldingUsd, FaPlus } from 'react-icons/fa';
import { PageHeader, StatCard, StatusTag } from '../components/ui';
import { useLookup, useStore } from '../store';
import { INVOICE_STATUS } from '../data/constants';
import { invoiceState, nextCode, type InvoiceState, addDays, formatDate, formatPrice, matches, moneyFormatter, moneyParser, todayISO, uid } from '../utils';
import type { Invoice } from '../types';

/**
 * Hóa đơn & công nợ (Kế toán, Admin).
 * Hóa đơn đơn hàng được tạo tự động khi xác nhận đơn; hóa đơn dịch vụ/công trình tạo tay tại đây.
 */

const Invoices = () => {
    const { db, add, edit } = useStore();
    const lookup = useLookup();
    const { message } = App.useApp();
    const [state, setState] = useState<'all' | InvoiceState>('all');
    const [search, setSearch] = useState('');
    const [payFor, setPayFor] = useState<Invoice | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const receivable = db.invoices.reduce((s, i) => s + Math.max(0, i.amount - i.paidAmount), 0);
    const collected = db.invoices.reduce((s, i) => s + i.paidAmount, 0);
    const overdue = db.invoices.filter((i) => invoiceState(i) === 'overdue');
    const data = db.invoices
        .filter((i) => (state === 'all' || invoiceState(i) === state) && (!search || matches(`${i.code} ${i.description} ${lookup.user(i.customerId)?.company ?? ''} ${lookup.userName(i.customerId)}`, search)))
        .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

    return (
        <div>
            <PageHeader title="Hóa đơn & công nợ" extra={<Button type="primary" icon={<FaPlus />} onClick={() => setCreateOpen(true)}>Tạo hóa đơn dịch vụ</Button>} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <StatCard icon={<FaFileInvoiceDollar />} label="Công nợ phải thu" value={formatPrice(receivable)} />
                <StatCard icon={<FaHandHoldingUsd />} label="Tổng đã thu" value={formatPrice(collected)} color="#16a34a" />
                <StatCard icon={<FaExclamationTriangle />} label="Quá hạn" value={formatPrice(overdue.reduce((s, i) => s + i.amount - i.paidAmount, 0))} hint={`${overdue.length} hóa đơn`} color="#ea580c" />
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
                <div className="overflow-x-auto">
                    <Segmented
                        value={state}
                        onChange={(v) => setState(v as typeof state)}
                        options={[{ label: 'Tất cả', value: 'all' }, ...Object.entries(INVOICE_STATUS).map(([k, s]) => ({ label: s.label, value: k }))]}
                    />
                </div>
                <Input.Search allowClear placeholder="Số HĐ, khách hàng, nội dung" onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <Table
                    rowKey="id"
                    dataSource={data}
                    scroll={{ x: 1000 }}
                    columns={[
                        { title: 'Số HĐ', dataIndex: 'code', render: (c: string) => <b>{c}</b> },
                        { title: 'Khách hàng', dataIndex: 'customerId', render: (id: string) => lookup.user(id)?.company ?? lookup.userName(id) },
                        { title: 'Nội dung', dataIndex: 'description' },
                        { title: 'Ngày lập', dataIndex: 'issuedAt', render: formatDate },
                        { title: 'Hạn TT', dataIndex: 'dueDate', render: formatDate },
                        { title: 'Giá trị', dataIndex: 'amount', align: 'right', render: formatPrice, sorter: (a, b) => a.amount - b.amount },
                        { title: 'Đã thu', dataIndex: 'paidAmount', align: 'right', render: formatPrice },
                        { title: 'Trạng thái', render: (_, i) => <StatusTag map={INVOICE_STATUS} value={invoiceState(i)} /> },
                        {
                            title: '',
                            render: (_, i) =>
                                invoiceState(i) !== 'paid' && (
                                    <Button size="small" type="primary" ghost onClick={() => setPayFor(i)}>Ghi nhận thu</Button>
                                ),
                        },
                    ]}
                />
            </div>

            <Modal title={payFor ? `Ghi nhận thanh toán ${payFor.code}` : ''} open={!!payFor} onCancel={() => setPayFor(null)} footer={null} destroyOnHidden>
                {payFor && (
                    <Form
                        layout="vertical"
                        initialValues={{ amount: payFor.amount - payFor.paidAmount }}
                        onFinish={(v: { amount: number }) => {
                            edit('invoices', payFor.id, { paidAmount: Math.min(payFor.amount, payFor.paidAmount + v.amount) });
                            setPayFor(null);
                            message.success('Đã ghi nhận thanh toán');
                        }}
                    >
                        <p className="text-sm text-[var(--text)]">Còn phải thu: <b className="text-[var(--text-h)]">{formatPrice(payFor.amount - payFor.paidAmount)}</b></p>
                        <Form.Item name="amount" label="Số tiền thu (VNĐ)" rules={[{ required: true }]}>
                            <InputNumber min={1} max={payFor.amount - payFor.paidAmount} className="w-full" formatter={moneyFormatter} parser={moneyParser} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block>Xác nhận</Button>
                    </Form>
                )}
            </Modal>

            <Modal title="Tạo hóa đơn dịch vụ / công trình" open={createOpen} onCancel={() => setCreateOpen(false)} footer={null} destroyOnHidden>
                <Form
                    layout="vertical"
                    requiredMark={false}
                    initialValues={{ dueDate: addDays(todayISO(), 30) }}
                    onFinish={(v: { projectId: string; description: string; amount: number; dueDate: string }) => {
                        const p = lookup.project(v.projectId)!;
                        const inv: Invoice = {
                            id: uid('i'),
                            code: nextCode('HD', db.invoices.map((i) => i.code)),
                            customerId: p.customerId,
                            refType: 'project',
                            refId: p.id,
                            description: `${v.description} – ${p.code}`,
                            amount: v.amount,
                            paidAmount: 0,
                            issuedAt: todayISO(),
                            dueDate: v.dueDate,
                        };
                        add('invoices', inv);
                        setCreateOpen(false);
                        message.success(`Đã tạo ${inv.code}`);
                    }}
                >
                    <Form.Item name="projectId" label="Công trình" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="label" options={db.projects.map((p) => ({ value: p.id, label: `${p.code} – ${p.name}` }))} />
                    </Form.Item>
                    <Form.Item name="description" label="Nội dung" rules={[{ required: true }]}>
                        <Input placeholder="Phí bảo trì 6 tháng, thi công đợt 2..." />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-3">
                        <Form.Item name="amount" label="Giá trị (VNĐ)" rules={[{ required: true }]}>
                            <InputNumber min={1000} className="w-full" formatter={moneyFormatter} parser={moneyParser} />
                        </Form.Item>
                        <Form.Item name="dueDate" label="Hạn thanh toán"><Input type="date" /></Form.Item>
                    </div>
                    <Button type="primary" htmlType="submit" block>Tạo hóa đơn</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Invoices;

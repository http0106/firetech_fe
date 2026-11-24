import { App, Button, Form, Input, InputNumber } from 'antd';
import { PageHeader, Panel } from '../components/ui';
import { useStore } from '../store';
import { type Settings as SettingsType } from '../types';

/** Cài đặt hệ thống (Admin): thông tin công ty, hotline, chu kỳ bảo trì mặc định. */
const Settings = () => {
    const { db, saveSettings } = useStore();
    const { message } = App.useApp();

    return (
        <div className="flex flex-col gap-5 max-w-3xl">
            <PageHeader title="Cài đặt hệ thống" subtitle="Thông tin hiển thị ở Header, Footer, trang Liên hệ và khung chat." />
            <Panel title="Thông tin doanh nghiệp">
                <Form<SettingsType>
                    layout="vertical"
                    initialValues={db.settings}
                    onFinish={(v) => {
                        saveSettings(v);
                        message.success('Đã lưu cài đặt');
                    }}
                >
                    <Form.Item name="companyName" label="Tên công ty" rules={[{ required: true }]}><Input /></Form.Item>
                    <div className="grid sm:grid-cols-2 gap-x-4">
                        <Form.Item name="hotline" label="Hotline" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="zalo" label="Số Zalo / Zalo OA" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="email" label="Email liên hệ" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                        <Form.Item name="defaultMaintenanceMonths" label="Chu kỳ bảo trì mặc định (tháng)"><InputNumber min={1} max={24} className="w-full" /></Form.Item>
                    </div>
                    <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="workingHours" label="Giờ làm việc"><Input /></Form.Item>
                    <Button type="primary" htmlType="submit">Lưu cài đặt</Button>
                </Form>
            </Panel>
        </div>
    );
};

export default Settings;

import { useState } from 'react';
import { App, Button, Form, Input, Modal, Rate, Result } from 'antd';
import { FaArrowLeft, FaStar, FaTools } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectInfo from '../components/ProjectInfo';
import { PageHeader } from '../components/ui';
import { RequestServiceModal } from '../components/QuoteForm';
import { useStore } from '../store';
import { todayISO, uid } from '../utils';

/** Chi tiết công trình của khách: thiết bị, bảo hành, lịch sử bảo trì, đánh giá dịch vụ. */
const MyProjectDetail = () => {
    const { id } = useParams();
    const { db, add, user } = useStore();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [requestOpen, setRequestOpen] = useState(false);
    const [rateOpen, setRateOpen] = useState(false);

    const project = db.projects.find((p) => p.id === id && p.customerId === user?.id);
    if (!project)
        return <Result status="404" title="Không tìm thấy công trình" extra={<Button onClick={() => navigate('/account/projects')}>Quay lại</Button>} />;

    const reviewed = db.reviews.some((r) => r.userId === user?.id && r.targetType === 'service' && r.targetId === project.id);
    const canRate = project.logs.length > 0 && !reviewed;

    return (
        <div>
            <Button type="link" icon={<FaArrowLeft />} className="px-0 mb-2" onClick={() => navigate('/account/projects')}>
                Tất cả công trình
            </Button>
            <PageHeader
                title={project.name}
                subtitle={project.address}
                extra={
                    <>
                        {canRate && <Button icon={<FaStar />} onClick={() => setRateOpen(true)}>Đánh giá dịch vụ</Button>}
                        <Button type="primary" danger icon={<FaTools />} onClick={() => setRequestOpen(true)}>Yêu cầu bảo trì / sửa chữa</Button>
                    </>
                }
            />
            <ProjectInfo project={project} />

            <RequestServiceModal project={requestOpen ? project : null} onClose={() => setRequestOpen(false)} />

            <Modal title="Đánh giá dịch vụ lắp đặt & bảo trì" open={rateOpen} onCancel={() => setRateOpen(false)} footer={null} destroyOnHidden>
                <Form
                    layout="vertical"
                    initialValues={{ rating: 5 }}
                    onFinish={(v: { rating: number; comment: string }) => {
                        add('reviews', { id: uid('r'), userId: user!.id, userName: user!.name, targetType: 'service', targetId: project.id, rating: v.rating, comment: v.comment, createdAt: todayISO() });
                        setRateOpen(false);
                        message.success('Cảm ơn bạn đã đánh giá dịch vụ!');
                    }}
                >
                    <Form.Item name="rating" label="Mức độ hài lòng"><Rate /></Form.Item>
                    <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, min: 10, message: 'Tối thiểu 10 ký tự' }]}>
                        <Input.TextArea rows={4} placeholder="Thái độ kỹ thuật viên, đúng hẹn, chất lượng xử lý..." />
                    </Form.Item>
                    <Button type="primary" danger htmlType="submit" block>Gửi đánh giá</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default MyProjectDetail;

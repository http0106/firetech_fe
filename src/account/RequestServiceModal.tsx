import { Modal } from 'antd';
import QuoteForm from '../componentmain/QuoteForm';
import type { Project } from '../types';

/** Modal "Yêu cầu bảo trì / sửa chữa" cho một công trình — tạo yêu cầu dịch vụ gửi tư vấn viên. */
const RequestServiceModal = ({ project, onClose }: { project: Project | null; onClose: () => void }) => (
    <Modal
        title={project ? `Yêu cầu bảo trì / sửa chữa – ${project.name}` : ''}
        open={!!project}
        onCancel={onClose}
        footer={null}
        destroyOnHidden
        width={560}
    >
        {project && <QuoteForm defaultKind="service" defaultService="Bảo trì / sửa chữa" projectId={project.id} compact />}
    </Modal>
);

export default RequestServiceModal;

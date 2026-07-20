import { PageHeader } from '@/components/admin/PageHeader';
import { BatchUploadForm } from './BatchUploadForm';

export default function AdminMediaUploadPage() {
  return (
    <div>
      <PageHeader title="图片上传" description="支持一次选择或拖拽多个文件批量上传。" />
      <BatchUploadForm />
    </div>
  );
}

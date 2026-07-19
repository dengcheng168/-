import { FaqForm } from '../FaqForm';
import { createFaqAction } from '@/lib/actions/admin/faqs';

export default function NewFaqPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增 FAQ</h1>
      <div className="mt-6">
        <FaqForm action={createFaqAction} />
      </div>
    </div>
  );
}

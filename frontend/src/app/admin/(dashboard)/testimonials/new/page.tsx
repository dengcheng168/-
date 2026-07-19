import { TestimonialForm } from '../TestimonialForm';
import { createTestimonialAction } from '@/lib/actions/admin/testimonials';

export default function NewTestimonialPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增客户评价</h1>
      <div className="mt-6">
        <TestimonialForm action={createTestimonialAction} />
      </div>
    </div>
  );
}

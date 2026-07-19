import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { TestimonialForm } from '../TestimonialForm';
import { updateTestimonialAction } from '@/lib/actions/admin/testimonials';

interface Detail {
  id: number;
  authorName: string;
  authorTitle: string | null;
  companyName: string | null;
  country: string | null;
  avatarUrl: string | null;
  quote: string;
  rating: number | null;
  published: boolean;
}

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await adminFetch<Detail>(`/testimonials/${id}`).catch(() => null);
  if (!result) notFound();
  const testimonial = result.data;

  const boundAction = updateTestimonialAction.bind(null, Number(id));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">编辑客户评价</h1>
      <div className="mt-6">
        <TestimonialForm action={boundAction} initialValues={testimonial} />
      </div>
    </div>
  );
}

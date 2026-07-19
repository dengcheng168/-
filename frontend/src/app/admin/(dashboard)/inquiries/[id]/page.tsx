import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { InquiryDetailForm } from './InquiryDetailForm';

interface InquiryDetail {
  id: number;
  name: string;
  company: string | null;
  country: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  productName: string | null;
  product?: { name: string; slug: string } | null;
  quantity: string | null;
  message: string | null;
  sourcePage: string | null;
  status: string;
  adminNotes: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await adminFetch<InquiryDetail>(`/inquiries/${id}`).catch(() => null);
  if (!result) notFound();
  const inquiry = result.data;

  const rows: [string, string | null][] = [
    ['姓名', inquiry.name],
    ['公司', inquiry.company],
    ['国家/地区', inquiry.country],
    ['邮箱', inquiry.email],
    ['电话', inquiry.phone],
    ['WhatsApp', inquiry.whatsapp],
    ['感兴趣的产品', inquiry.product?.name ?? inquiry.productName],
    ['采购数量', inquiry.quantity],
    ['留言', inquiry.message],
    ['来源页面', inquiry.sourcePage],
    ['提交 IP', inquiry.ipAddress],
    ['提交时间', new Date(inquiry.createdAt).toLocaleString('zh-CN')],
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">询盘详情</h1>

      <dl className="mt-6 max-w-xl divide-y divide-grey-100 rounded-lg border border-grey-200 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex px-4 py-3 text-sm">
            <dt className="w-32 shrink-0 text-grey-500">{label}</dt>
            <dd className="text-navy-950">{value || '-'}</dd>
          </div>
        ))}
      </dl>

      <InquiryDetailForm id={inquiry.id} status={inquiry.status} adminNotes={inquiry.adminNotes} />
    </div>
  );
}

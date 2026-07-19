import { adminFetch } from '@/lib/api/admin-client';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { deleteBlogTagAction } from '@/lib/actions/admin/blog-tags';
import { NewTagForm } from './NewTagForm';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default async function AdminBlogTagsPage() {
  const { data } = await adminFetch<Tag[]>('/blog-tags');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">博客标签管理</h1>

      <div className="mt-6 rounded-lg border border-grey-200 bg-white p-5">
        <NewTagForm />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {data.length === 0 && <p className="text-grey-500">暂无标签</p>}
        {data.map((tag) => (
          <div key={tag.id} className="flex items-center gap-2 rounded-full border border-grey-200 bg-white px-4 py-2 text-sm">
            <span className="text-navy-950">{tag.name}</span>
            <form action={deleteBlogTagAction}>
              <input type="hidden" name="id" value={tag.id} />
              <ConfirmSubmitButton confirmMessage={`确定要删除标签"${tag.name}"吗？`} className="text-red-500 hover:text-red-700">
                ×
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

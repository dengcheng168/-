import { adminFetch } from '@/lib/api/admin-client';
import { PageHeader } from '@/components/admin/PageHeader';
import { NewTagForm } from './NewTagForm';
import { BlogTagsList } from './BlogTagsList';

interface Tag {
  id: number;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
}

export default async function AdminBlogTagsPage() {
  const { data } = await adminFetch<Tag[]>('/blog-tags');

  return (
    <div>
      <PageHeader title="博客标签" description="创建和管理博客文章标签，方便内容分类和筛选。" action={<NewTagForm />} />
      <BlogTagsList tags={data} />
    </div>
  );
}

import { BlogCategoryForm } from '../BlogCategoryForm';
import { createBlogCategoryAction } from '@/lib/actions/admin/blog-categories';

export default function NewBlogCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950">新增博客分类</h1>
      <div className="mt-6">
        <BlogCategoryForm action={createBlogCategoryAction} />
      </div>
    </div>
  );
}

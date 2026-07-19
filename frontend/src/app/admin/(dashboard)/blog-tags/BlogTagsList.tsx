'use client';

import { useMemo, useState } from 'react';
import { AdminTable, AdminTableHead } from '@/components/admin/AdminTable';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { EmptyState } from '@/components/admin/EmptyState';
import { IconSearch, IconFileText } from '@/components/admin/icons';
import { deleteBlogTagAction } from '@/lib/actions/admin/blog-tags';

interface Tag {
  id: number;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
}

export function BlogTagsList({ tags }: { tags: Tag[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
  }, [tags, query]);

  if (tags.length === 0) {
    return (
      <EmptyState
        icon={<IconFileText className="h-6 w-6" />}
        title="还没有创建博客标签"
        description="创建标签后，可以帮助访客更方便地浏览相关文章。"
      />
    );
  }

  return (
    <div>
      <div className="relative max-w-sm">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索标签名称或 Slug"
          className="w-full rounded-md border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm text-[#111827] focus:border-[#0a2540] focus:outline-none focus:ring-1 focus:ring-[#0a2540]"
        />
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState title="没有找到匹配的标签" description="换个关键词试试。" />
        ) : (
          <AdminTable>
            <AdminTableHead columns={['标签名称', 'Slug', '关联文章数量', '创建时间', '操作']} />
            <tbody>
              {filtered.map((tag) => (
                <tr key={tag.id} className="border-b border-grey-100 last:border-none">
                  <td className="px-4 py-3 font-medium text-navy-950">{tag.name}</td>
                  <td className="px-4 py-3 text-grey-500">{tag.slug}</td>
                  <td className="px-4 py-3 text-grey-500">{tag.postCount}</td>
                  <td className="px-4 py-3 text-grey-500">{new Date(tag.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <form action={deleteBlogTagAction}>
                      <input type="hidden" name="id" value={tag.id} />
                      <ConfirmSubmitButton confirmMessage={`确定要删除标签"${tag.name}"吗？`} className="text-sm text-red-600 hover:underline">
                        删除
                      </ConfirmSubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </div>
    </div>
  );
}

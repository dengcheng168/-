'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/admin/ui/input';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/ui/table';
import { EmptyState } from '@/components/admin/EmptyState';
import { setProductStatusAction } from '@/lib/actions/admin/products';
import { resolveMediaUrl } from '@/lib/utils/media';

export interface ProductRow {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  mainImage: string;
  status: string;
  sortOrder: number;
  updatedAt: string;
  category?: { name: string };
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: '全部状态' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'DRAFT', label: '草稿' },
];

function StatusToggleButton({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextStatus = status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  const actionLabel = status === 'PUBLISHED' ? '下架' : '发布';

  function handleClick() {
    const confirmMessage =
      status === 'PUBLISHED' ? '确定要下架这个产品吗？下架后前台将无法访问。' : '确定要发布这个产品吗？发布后将在前台公开展示。';
    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await setProductStatusAction(id, nextStatus);
      if (result.success) {
        toast.success(result.message ?? '操作成功');
        router.refresh();
      } else {
        toast.error(result.message ?? '操作失败');
      }
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? '处理中...' : actionLabel}
    </Button>
  );
}

export function ProductListClient({ rows, total }: { rows: ProductRow[]; total: number }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = status === 'ALL' || row.status === status;
      const matchesSearch = !q || row.name.toLowerCase().includes(q) || (row.sku ?? '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, status]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:max-w-md sm:flex-row">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="按名称或 SKU 搜索"
            className="sm:max-w-xs"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-sm text-foreground"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {total > rows.length && (
        <p className="mb-3 rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground">
          当前只加载了前 {rows.length} / {total} 个产品，搜索和筛选仅在已加载的数据范围内生效。产品数量增多后需要接入服务端分页/搜索。
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="没有匹配的产品" description="试试调整搜索关键词或状态筛选条件。" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>图片</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => {
              const isPublished = row.status === 'PUBLISHED';
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                      <Image src={resolveMediaUrl(row.mainImage)} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.sku ?? '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{row.category?.name ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={isPublished ? 'success' : 'muted'}>{isPublished ? '已发布' : '草稿'}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.sortOrder}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(row.updatedAt).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/products/${row.id}`}>编辑</Link>
                      </Button>
                      {isPublished ? (
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/products/${row.slug}`} target="_blank" rel="noreferrer">
                            预览
                          </a>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled
                          title="草稿尚未发布，前台还没有对应页面；后台预览页留给下一批次实现"
                        >
                          预览
                        </Button>
                      )}
                      <StatusToggleButton id={row.id} status={row.status} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

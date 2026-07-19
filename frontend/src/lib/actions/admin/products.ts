'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/api/admin-client';
import { ApiError } from '@/lib/api/client';
import type { AdminFormState } from './categories';

function textOrUndefined(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

/** 每行 "标签: 值" 格式，解析成 [{label, value}] */
function parseSpecs(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':');
      return idx === -1 ? { label: line, value: '' } : { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });
}

/** 每行一个特点 */
function parseFeatures(text: string) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

/** 每行 "标题: 描述" 格式，解析成 [{title, description}] */
function parseApplications(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':');
      return idx === -1 ? { title: line } : { title: line.slice(0, idx).trim(), description: line.slice(idx + 1).trim() };
    });
}

function parseGalleryImages(value: string) {
  try {
    return JSON.parse(value || '[]');
  } catch {
    return [];
  }
}

function buildPayload(formData: FormData) {
  return {
    name: formData.get('name'),
    sku: textOrUndefined(formData, 'sku'),
    categoryId: Number(formData.get('categoryId')),
    shortDescription: textOrUndefined(formData, 'shortDescription'),
    description: formData.get('description'),
    mainImage: formData.get('mainImage'),
    galleryImages: parseGalleryImages(String(formData.get('galleryImages') ?? '[]')),
    specs: parseSpecs(String(formData.get('specsText') ?? '')),
    features: parseFeatures(String(formData.get('featuresText') ?? '')),
    applications: parseApplications(String(formData.get('applicationsText') ?? '')),
    packagingInfo: textOrUndefined(formData, 'packagingInfo'),
    moq: textOrUndefined(formData, 'moq'),
    oemOdmSupport: formData.get('oemOdmSupport') === 'on',
    specSheetUrl: textOrUndefined(formData, 'specSheetUrl'),
    status: formData.get('status'),
    featured: formData.get('featured') === 'on',
    seoTitle: textOrUndefined(formData, 'seoTitle'),
    seoDescription: textOrUndefined(formData, 'seoDescription'),
  };
}

export async function createProductAction(_prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch('/products', { method: 'POST', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '创建失败' };
  }
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProductAction(id: number, _prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  try {
    await adminFetch(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(buildPayload(formData)) });
  } catch (err) {
    return { message: err instanceof ApiError ? err.message : '保存失败' };
  }
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  await adminFetch(`/products/${id}`, { method: 'DELETE' });
  revalidatePath('/admin/products');
}

/**
 * 供产品列表"发布/下架"按钮直接调用（不经过 <form action>），
 * 复用后端已有的 PATCH /admin/products/:id/status，不新增接口。
 */
export async function setProductStatusAction(id: number, status: 'DRAFT' | 'PUBLISHED'): Promise<AdminFormState> {
  try {
    await adminFetch(`/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  } catch (err) {
    return { success: false, message: err instanceof ApiError ? err.message : '操作失败' };
  }
  revalidatePath('/admin/products');
  return { success: true, message: status === 'PUBLISHED' ? '已发布' : '已下架' };
}

import 'server-only';

/**
 * 可清空的可选文本/HTML 字段：后台表单每次都是整份提交，不存在"这个字段没被改动"的情况，
 * 所以清空后应该把空字符串真正传给后端清空数据库字段，而不是被当成"没填"直接跳过。
 * 之前的实现把空字符串也转成 undefined（JSON.stringify 会丢掉 undefined 的 key），
 * 导致管理员清空任何可选文本框、点保存后，看到"已保存"提示但数据库里的值其实完全没变——
 * 这个函数统一修正这个问题，所有可选文本/HTML 字段都应该用这个而不是自己再写一份。
 */
export function textOrUndefined(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : undefined;
}

/** Missing field preserves the value; a submitted empty field clears it. */
export function dateOrUndefined(formData: FormData, key: string): string | null | undefined {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() || null : undefined;
}

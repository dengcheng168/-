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

/**
 * 专门给"可选日期"字段用：后端对应字段是 z.coerce.date().optional()，传空字符串会被
 * new Date('') 解析成 Invalid Date 触发校验报错，不能直接复用上面的 textOrUndefined。
 * 这里维持"清空即不改动"的旧行为——要支持真正清空一个已设置的日期，需要后端 schema
 * 同时改成 nullable 并在 service 里显式处理 null，这个改动更大，暂不在这次修复范围内。
 */
export function dateOrUndefined(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

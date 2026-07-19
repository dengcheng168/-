/**
 * SQLite 没有原生 Json 类型，schema 中相关字段以 JSON 字符串存储。
 * 这两个辅助函数统一序列化/反序列化逻辑，避免各模块各自处理。
 */
export function toJsonString(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function fromJsonString<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

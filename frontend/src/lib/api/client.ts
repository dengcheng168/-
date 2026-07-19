export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

interface ApiErrorEnvelope {
  success: false;
  error: { message: string; code?: string; details?: unknown };
}

export class ApiError extends Error {
  code?: string;
  status: number;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiResult<T> {
  data: T;
  meta?: ApiMeta;
}

interface ApiFetchOptions extends RequestInit {
  /** 秒数：传入时对该请求启用 Next.js 基于时间的缓存重新验证（ISR），不传则不缓存（默认 SSR 实时渲染）*/
  revalidate?: number;
  /** 缓存标签，配合 revalidateTag 做按需失效 */
  tags?: string[];
}

/**
 * 服务端渲染时直连后端内网地址；浏览器端使用公开 API 地址（生产环境经 Nginx 反代到同域名 /api）。
 */
function resolveBaseUrl(): string {
  if (typeof window === 'undefined') {
    const internalBase = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
    return `${internalBase}/api`;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<ApiResult<T>> {
  const { revalidate, tags, ...init } = options;
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...init,
    credentials: init.credentials ?? 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    next:
      revalidate !== undefined || tags
        ? { revalidate: revalidate ?? false, tags }
        : undefined,
  });

  let body: ApiSuccessEnvelope<T> | ApiErrorEnvelope | undefined;
  try {
    body = await res.json();
  } catch {
    // 响应体不是 JSON（例如 CSV 导出），由调用方自行处理，这里不再解析
  }

  if (!res.ok || !body || body.success === false) {
    const errorBody = body as ApiErrorEnvelope | undefined;
    throw new ApiError(
      errorBody?.error?.message ?? `请求失败：${res.status}`,
      res.status,
      errorBody?.error?.code,
      errorBody?.error?.details,
    );
  }

  return { data: body.data, meta: body.meta };
}

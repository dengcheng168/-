/**
 * 正式站点域名（SiteSetting.siteBaseUrl）的规范化与校验。这里只负责"字符串是否是一个
 * 合法的站点根地址"，不关心它来自后台表单还是回填脚本——两个调用方共用同一套规则，
 * 避免出现"表单校验一套、脚本校验另一套"导致数据库里存进两种不同格式的值。
 *
 * 规则见 Runtime Site Domain Configuration 需求「五、域名校验和规范化」：
 * 生产环境只接受形如 https://koigatetech.com 的纯域名根地址（协议必须 https、路径必须为 /、
 * 不允许 query/hash/用户名密码、不允许 localhost/内网 IP）；开发环境额外放行 http://localhost[:port]
 * 这类回环地址，仅当调用方显式传 allowLocalhost: true 时生效。
 */

export type SiteBaseUrlValidationError =
  | 'EMPTY'
  | 'INVALID_URL'
  | 'PROTOCOL_NOT_HTTPS'
  | 'HAS_PATH'
  | 'HAS_QUERY'
  | 'HAS_HASH'
  | 'HAS_CREDENTIALS'
  | 'LOCALHOST_NOT_ALLOWED'
  | 'PRIVATE_IP_NOT_ALLOWED';

export const SITE_BASE_URL_ERROR_MESSAGES: Record<SiteBaseUrlValidationError, string> = {
  EMPTY: '域名不能为空',
  INVALID_URL: '不是合法的 URL',
  PROTOCOL_NOT_HTTPS: '必须使用 https:// 开头',
  HAS_PATH: '不能包含页面路径，只能填域名根地址',
  HAS_QUERY: '不能包含查询参数',
  HAS_HASH: '不能包含锚点',
  HAS_CREDENTIALS: '不能包含用户名或密码',
  LOCALHOST_NOT_ALLOWED: '生产环境不允许使用 localhost',
  PRIVATE_IP_NOT_ALLOWED: '生产环境不允许使用内网 / 回环 IP 地址',
};

export interface SiteBaseUrlValidationResult {
  ok: boolean;
  /** 校验通过时的规范化结果：protocol + host，不含末尾斜杠 */
  value?: string;
  error?: SiteBaseUrlValidationError;
  message?: string;
}

export interface SiteBaseUrlValidationOptions {
  /** 仅开发/测试环境传 true，放行 http://localhost[:port] / http://127.0.0.1[:port] 这类回环地址 */
  allowLocalhost?: boolean;
}

function isLoopbackOrPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 127 || a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

function fail(error: SiteBaseUrlValidationError): SiteBaseUrlValidationResult {
  return { ok: false, error, message: SITE_BASE_URL_ERROR_MESSAGES[error] };
}

/** 核心校验函数：字符串是否是一个合法的站点根地址，合法时一并返回规范化结果 */
export function validateSiteBaseUrl(raw: string, options: SiteBaseUrlValidationOptions = {}): SiteBaseUrlValidationResult {
  const allowLocalhost = options.allowLocalhost ?? false;
  const trimmed = raw.trim();
  if (!trimmed) return fail('EMPTY');

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return fail('INVALID_URL');
  }

  if (parsed.username || parsed.password) return fail('HAS_CREDENTIALS');

  const isDevLoopback =
    allowLocalhost && isLoopbackOrPrivateHostname(parsed.hostname) && (parsed.protocol === 'http:' || parsed.protocol === 'https:');
  if (!isDevLoopback && parsed.protocol !== 'https:') return fail('PROTOCOL_NOT_HTTPS');

  if (parsed.pathname !== '/' && parsed.pathname !== '') return fail('HAS_PATH');
  if (parsed.search) return fail('HAS_QUERY');
  if (parsed.hash) return fail('HAS_HASH');

  if (!allowLocalhost && isLoopbackOrPrivateHostname(parsed.hostname)) {
    return fail(parsed.hostname === 'localhost' ? 'LOCALHOST_NOT_ALLOWED' : 'PRIVATE_IP_NOT_ALLOWED');
  }

  // URL.origin 天然就是 "protocol//host"，不含末尾斜杠，同时完成"去除末尾 /"和 hostname 规范化
  return { ok: true, value: parsed.origin };
}

/** 便捷包装：只要规范化后的值，无效时返回 null，调用方不需要关心具体错误分支时使用 */
export function normalizeSiteBaseUrl(raw: string, options: SiteBaseUrlValidationOptions = {}): string | null {
  const result = validateSiteBaseUrl(raw, options);
  return result.ok ? (result.value ?? null) : null;
}

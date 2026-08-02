/**
 * 已知的弱/占位 JWT Secret 值——都是这个仓库自己在 .env.example / zod 默认值里用过的示例文案，
 * 或者业界最常见的占位字符串。生产环境如果还在用这些值，说明部署时忘了覆盖，必须拒绝启动，
 * 而不是带着一个所有人都能在源码里搜到的密钥继续对外提供服务。
 *
 * 这里只做已知弱值的精确匹配，不做熵值/复杂度评分——评分算法容易有争议且会拒绝合法的强密钥，
 * 超出本次“修复弱默认 Secret”这一条最小整改的范围。
 */
const KNOWN_WEAK_SECRETS = new Set([
  'dev-secret-change-me',
  'change-me',
  'secret',
  'development-secret',
]);

export function isWeakSecret(value: string): boolean {
  return KNOWN_WEAK_SECRETS.has(value.trim());
}

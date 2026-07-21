/**
 * 进程内部一次性生成的密钥，只用于服务器自己调用自己的内部路由（定期清理缓存的定时器
 * 调用 /api/internal/cache-revalidate），防止这个路由被外部直接访问触发。
 * 不持久化、不需要额外配置。
 *
 * 用 globalThis 而不是模块顶层的 `export const` 常量：instrumentation.ts 和
 * app/api/.../route.ts 是两个不同的入口，会被打包成两份独立的模块图（各自 import 到的
 * "同一个" internal-secret.ts 其实是两份分别求值的拷贝），模块顶层常量在两边会算出两个
 * 不同的值，导致定时器发的密钥永远和路由校验的对不上。globalThis 才是整个 Node 进程
 * 唯一共享、不受打包边界影响的地方，谁先调用就由谁生成，后调用的直接读到同一个值。
 */
function getGlobalSecretStore() {
  return globalThis as typeof globalThis & { __internalSecret?: string };
}

export function getInternalSecret(): string {
  const store = getGlobalSecretStore();
  if (!store.__internalSecret) {
    store.__internalSecret = crypto.randomUUID();
  }
  return store.__internalSecret;
}

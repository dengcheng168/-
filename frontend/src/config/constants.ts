export const ADMIN_COOKIE_NAME = 'wp_session';

/**
 * 后台登录页故意不放在可预测的 /admin/login，而是站点根目录下的一个随机路径，
 * 未登录时访问 /admin/** 直接 404（见 proxy.ts），不会跳转暴露这个地址。
 * 如需更换，同步改这里 + 对应改 src/app/<旧路径> 文件夹名即可。
 */
export const ADMIN_LOGIN_PATH = '/qZzH86tTnyvhqTpk';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 生成独立运行时（.next/standalone），Docker 镜像只需复制这个目录 + 静态资源即可运行，
  // 不需要把完整 node_modules 打进最终镜像，显著减小生产镜像体积，适合小内存 VPS。
  output: 'standalone',
  images: {
    // 生产环境图片经 Nginx 与前端同源提供（/uploads/...），无需在此配置。
    // 本地开发时前端(3000)直接从后端(4000)拉取图片，属于跨源，需要显式允许。
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
    // Next.js 16 新增了"本地 IP 优化限制"：图片优化代理默认拒绝解析到本机/内网 IP 的地址，
    // 而本地开发时前端(3000)正是通过 localhost:4000 跨源拉取后端图片，会被这条新规则挡掉
    // （报错 "url" parameter is not allowed）。生产环境走 Nginx 同源代理不受影响，这里仅为
    // 开发联调放开，属于预期内的本机网络场景。
    dangerouslyAllowLocalIP: true,
    // 占位图使用 SVG（public/images/placeholders/），Next.js 默认出于安全考虑禁止优化 SVG。
    // 这些文件都是仓库内置的可信静态资源，非用户上传内容，允许并加沙箱 CSP 作为纵深防御。
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

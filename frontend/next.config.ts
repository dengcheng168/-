import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 生成独立运行时（.next/standalone），Docker 镜像只需复制这个目录 + 静态资源即可运行，
  // 不需要把完整 node_modules 打进最终镜像，显著减小生产镜像体积，适合小内存 VPS。
  output: 'standalone',
  images: {
    // 关闭 Next.js 内置的图片优化代理（/_next/image）。
    //
    // 原因：生产环境是多容器部署，/uploads/** 由 Nginx（同源反代）和 backend 容器提供，
    // frontend 容器自己的文件系统里并没有这些文件。Next.js 图片优化器对"本地相对路径"
    // （不带协议/host 的 src，例如 /uploads/webp/xxx.webp）的处理方式是把它当成本应用自己
    // 能提供的资源去请求，而不是转发给同源的 Nginx，所以在 frontend 容器里找不到文件，
    // 返回 400，图片显示不出来（直接访问 /uploads/... 本身是 200，问题只出在优化代理这一步）。
    //
    // 而且后台上传时后端已经用 sharp 生成了 webp + 缩略图两种尺寸，本来就不需要 Next.js
    // 再优化一遍，所以直接关闭最简单可靠，不用为每个 <Image> 单独加 unoptimized。
    unoptimized: true,
  },
};

export default nextConfig;

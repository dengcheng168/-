import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  const [, , argEmail, argPassword] = process.argv;
  const email = argEmail ?? env.ADMIN_INIT_EMAIL;
  const password = argPassword ?? env.ADMIN_INIT_PASSWORD;

  if (!email || !password) {
    console.error(
      '缺少管理员邮箱或密码。请设置环境变量 ADMIN_INIT_EMAIL / ADMIN_INIT_PASSWORD，' +
        '或使用：npm run create-admin -- <email> <password>',
    );
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`管理员账号 ${email} 已存在，未做任何修改。如需重置密码，请在后台"账号设置"中修改。`);
    return;
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.adminUser.create({
    data: { email, passwordHash, role: 'SUPER_ADMIN', name: 'Administrator' },
  });

  console.log(`管理员账号创建成功：${admin.email}`);
  console.log('请登录后台后立即修改默认密码。');
}

main()
  .catch((err) => {
    console.error('创建管理员账号失败：', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

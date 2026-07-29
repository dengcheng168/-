// 一次性脚本：把 "Company News"（company-news）分类下的文章改挂到新建的 "General" 分类，
// 然后软删除 "Company News"。用户明确要求"删除这个分类，但文章保留"。
// 用法：docker compose exec backend node scripts/reassign-and-delete-blog-category.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldCategory = await prisma.blogCategory.findFirst({
    where: { slug: 'company-news', deletedAt: null },
  });
  if (!oldCategory) {
    console.log('未找到未删除的 company-news 分类，可能已经处理过，退出。');
    return;
  }

  let newCategory = await prisma.blogCategory.findFirst({
    where: { slug: 'general', deletedAt: null },
  });
  if (!newCategory) {
    newCategory = await prisma.blogCategory.create({
      data: {
        name: 'General',
        slug: 'general',
        description: null,
        sortOrder: oldCategory.sortOrder,
        published: true,
      },
    });
    console.log(`已创建新分类 General，id=${newCategory.id}`);
  } else {
    console.log(`复用已存在的 General 分类，id=${newCategory.id}`);
  }

  const affected = await prisma.blogPost.updateMany({
    where: { categoryId: oldCategory.id, deletedAt: null },
    data: { categoryId: newCategory.id },
  });
  console.log(`已把 ${affected.count} 篇文章从 Company News 改挂到 General`);

  await prisma.blogCategory.update({
    where: { id: oldCategory.id },
    data: { deletedAt: new Date() },
  });
  console.log(`已软删除 Company News 分类（id=${oldCategory.id}）`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
import fs from "fs-extra";


import { hashPassword } from "~/session.server";

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.comment.deleteMany({});

  await prisma.user.create({
    data: {
      username: "admin",
      password: await hashPassword("123456"),
      access: 9
    }
  });

  await prisma.user.create({
    data: {
      username: "user",
      password: await hashPassword("123456")
    }
  });

  await prisma.user.create({
    data: {
      username: "banned",
      password: await hashPassword("123456"),
      access: -1
    }
  });

  await prisma.post.create({
    data: {
      content: "# Test\n$$\\KaTeX$$",
      user: { connect: { username: "user" } }
    }
  });


  const longPost = await fs.readFile(process.cwd() + "/app/entry.client.tsx");

  const post = await prisma.post.create({
    data: {
      content: `\`\`\`typescript\n${longPost}\n\`\`\``,
      user: { connect: { username: "user" } }
    }
  });

  await prisma.comment.create({
    data: {
      content: "**Test**",
      user: { connect: { username: "user" } },
      parent: { connect: { id: post.id } }
    }
  });

  await prisma.announcement.create({
    data: {
      title: "欢迎来到 polygen",
      content: "# Markdown\n提示：本站还在建设中，您可以加入页面下方的官方 QQ 群以获取最新开发进度"
    }
  });

  await prisma.announcement.create({
    data: {
      title: "第 33 次内测已开始",
      content: "测试内容：用户主页\n\n提示：Markdown 及 KaTeX 渲染机制已更新，可能出现**渲染问题**"
    }
  });

  console.log("Database has been seeded. 🌱");
}

seed()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

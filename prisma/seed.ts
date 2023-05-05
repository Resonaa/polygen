import * as process from "process";

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import fs from "fs-extra";
import invariant from "tiny-invariant";

import { hashPassword } from "~/session.server";

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.comment.deleteMany({});

  const password = process.env.SESSION_SECRET;

  invariant(password);

  await prisma.user.create({
    data: {
      username: "admin",
      password: await hashPassword(password),
      access: 9
    }
  });

  await prisma.user.create({
    data: {
      username: "user",
      password: await hashPassword(password),
      bio: "Test"
    }
  });

  await prisma.user.create({
    data: {
      username: "Bot",
      password: await hashPassword(password),
      bio: "https://github.com/jwcub/polygen_bot"
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
      title: "第 34 次内测已开始",
      content: "测试内容：编辑资料\n\n提示：用户头像不会在每次内测时清除"
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

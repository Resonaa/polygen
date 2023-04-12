import { PrismaClient } from "@prisma/client";
import fs from "fs-extra";

import { hashPassword } from "~/utils";

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
      content: "# Markdown\n$$\\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\\underset{\\text{amphoteres Hydroxid}}{\\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\\underset{\\text{Hydroxozikat}}{\\ce{[Zn(OH)4]^2-}}$}$$\n```cpp\n#include <bits/stdc++.h>\n```"
    }
  });

  await prisma.announcement.create({
    data: {
      title: "第 30 次内测已开始",
      content: "测试内容：游戏\n\n提示：本次测试可能有较多的 **Bug**，欢迎反馈"
    }
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

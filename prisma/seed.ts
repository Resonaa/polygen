import { PrismaClient } from "@prisma/client";
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

  await prisma.announcement.create({
    data: {
      title: "欢迎来到 polygen",
      content: "# Markdown\n$$\\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\\underset{\\text{amphoteres Hydroxid}}{\\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\\underset{\\text{Hydroxozikat}}{\\ce{[Zn(OH)4]^2-}}$}$$\n```cpp\n#include <bits/stdc++.h>\n```"
    }
  });

  await prisma.announcement.create({
    data: {
      title: "第 21 次内测已开始",
      content: "测试内容：公告"
    }
  });

  await prisma.announcement.create({
    data: {
      title: "封禁用户测试",
      content: "现有一封禁用户（用户名为 `banned`，密码为 `123456`），欢迎大家进行测试，若发现 Bug 请及时反馈"
    }
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

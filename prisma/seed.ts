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

  await prisma.announcement.create({
    data: {
      title: "欢迎来到 polygen",
      content: "# Markdown\n$$\\KaTeX$$\n```cpp\n#include <bits/stdc++.h>\n```"
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

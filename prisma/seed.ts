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

  await prisma.announcement.create({
    data: {
      title: "波特房考试规则",
      content:
        `以下是目前试行的考试规则，可能随时变更

**考试 A：小地图单挑**

玩家进入 161 房间，任选模式/地图/速度，小地图单挑波特。每局若波特获得胜利，无论怎样波特 +1 分；若玩家获得胜利囚禁了波特，玩家 +1 分；若玩家获得胜利但没有囚禁波特，本局不算。先到达 10 分的一方获胜，如果比分出现了 9:9，需要超出对方 2 分才能获胜。考试成绩按照不同模式/地图的组合分区排名，排名优先级为：

1. 游戏速度大小；
2. 最终比分差；
3. 总局数；（含有不算的局）
4. 选取双方玩家成功囚禁波特回合数最多的一局，回合数更小的；
5. 平手。

**考试 B：大地图囚禁**

玩家进入 161 房间，与 3 个挂机程序（不能移动）一起参战，任选模式/地图/速度，在满足以下条件的大地图中成功囚禁波特：

1. 迷宫地图中，双方家的最短路距离大于 20 格（挂机程序不算）；随机及空白地图中，距离大于 15 格；
2. 在囚禁的过程中全图对攻；
3. 在对攻过程中，割点数大于 2 个。

囚禁成功后，成绩按照不同模式/地图的组合分区排名，排名优先级为：

1. 游戏速度大小；
2. 回合数；
3. 平手。`
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

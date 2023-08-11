import { join } from "path";
import { exit } from "process";

import { PrismaClient } from "@prisma/client";
import { readdir, readFile } from "fs-extra";
import invariant from "tiny-invariant";

import { ARTICLES_DIR, CWD, SESSION_SECRET } from "~/constants.server";
import { hashPassword } from "~/session.server";

const prisma = new PrismaClient();

async function seed() {
  await prisma.star.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.comment.deleteMany({});

  const password = SESSION_SECRET;

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
      content: "### Test\n$$\n\\KaTeX\n$$",
      user: { connect: { username: "user" } }
    }
  });

  const longPost = await readFile(join(CWD, "/app/entry.client.tsx"));

  const post = await prisma.post.create({
    data: {
      content: `\`\`\`tsx\n${longPost}\n\`\`\``,
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

  for (let entry of await readdir(ARTICLES_DIR)) {
    await prisma.announcement.create({
      data: {
        title: entry.substring(0, entry.length - 3),
        content: (await readFile(join(ARTICLES_DIR, entry))).toString()
      }
    });
  }

  console.log("Database has been seeded. 🌱");
}

seed()
  .catch(error => {
    console.error(error);
    exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { join } from "path";
import { cwd, exit } from "process";

import { PrismaClient } from "@prisma/client";
import { readdir, readFile } from "fs-extra";
import invariant from "tiny-invariant";

import { SESSION_SECRET } from "~/constants.server";
import { hashPassword } from "~/session.server";

const prisma = new PrismaClient();

async function seed() {
  await prisma.star.deleteMany({});
  await prisma.password.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.comment.deleteMany({});

  const password = SESSION_SECRET;

  invariant(password);

  await prisma.user.create({
    data: {
      username: "admin",
      password: {
        create: {
          hash: await hashPassword(password)
        }
      },
      access: 9
    }
  });

  await prisma.user.create({
    data: {
      username: "user",
      password: {
        create: {
          hash: await hashPassword(password)
        }
      },
      bio: "Test"
    }
  });

  await prisma.user.create({
    data: {
      username: "Bot",
      password: {
        create: {
          hash: await hashPassword(password)
        }
      },
      bio: "https://github.com/jwcub/polygen_bot"
    }
  });

  await prisma.post.create({
    data: {
      content: "### Test\n$$\n\\KaTeX\n$$",
      user: { connect: { username: "user" } }
    }
  });

  const longPost = await readFile(join(cwd(), "app/entry.client.tsx"));

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

  for (const lang of ["zh", "en"]) {
    const dir = join(cwd(), "articles", lang);

    for (const entry of await readdir(dir)) {
      await prisma.announcement.create({
        data: {
          title: entry.substring(0, entry.length - 3),
          content: (await readFile(join(dir, entry))).toString(),
          lang
        }
      });
    }
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

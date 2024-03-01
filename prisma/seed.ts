import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

import prisma from "~/db.server";
import { SESSION_SECRET } from "~/env.server";
import i18n from "~/i18n/i18n";
import { hashPassword } from "~/session.server";
import { cuid } from "~/utils/cuid";

await prisma.star.deleteMany({});
await prisma.password.deleteMany({});
await prisma.user.deleteMany({});
await prisma.post.deleteMany({});
await prisma.announcement.deleteMany({});
await prisma.comment.deleteMany({});

const password = SESSION_SECRET;

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
    cuid: cuid(),
    content: `
### Test
      
- [x] GFM
- [x] $\\KaTeX$
      `,
    user: { connect: { username: "user" } }
  }
});

const longPost = await readFile(join(cwd(), "app/entry.client.tsx"));

const post = await prisma.post.create({
  data: {
    cuid: cuid(),
    content: `\`\`\`tsx\n${longPost.toString()}\n\`\`\``,
    user: { connect: { username: "user" } }
  }
});

await prisma.comment.create({
  data: {
    content: "**Test**",
    user: { connect: { username: "user" } },
    parent: { connect: { cuid: post.cuid } }
  }
});

for (const lang of i18n.supportedLngs) {
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

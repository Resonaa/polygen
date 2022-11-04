import { PrismaClient } from "@prisma/client";
import { hashPassword } from "~/utils";

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.access.deleteMany({});

  await prisma.user.create({
    data: {
      username: "admin",
      password: await hashPassword("123456"),
      access: {
        create: {
          visitWebsite: -1,
          communicate: -1,
          joinRoom: -1,
          createRoom: -1,
          manageAnnouncement: -1
        }
      }
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

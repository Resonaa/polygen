import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

import type { Password, User } from "@prisma/client";
import type { NodeOnDiskFile } from "@remix-run/node";
import sharp from "sharp";

import prisma from "~/db.server";
import { getRank as getStarRank } from "~/models/star.server";
import { comparePassword, hashPassword } from "~/session.server";

export type { User } from "@prisma/client";

export async function getUser(username: User["username"]) {
  return prisma.user.findUnique({ where: { username } });
}

export async function getPassword(username: User["username"]) {
  return prisma.password.findUnique({ where: { username } });
}

export async function getStats(username: User["username"]) {
  const data = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          comments: { where: { isPrivate: false } },
          posts: { where: { isPrivate: false } }
        }
      }
    }
  });
  const rank = await getStarRank(username);

  return {
    posts: data?._count.posts,
    comments: data?._count.comments,
    rank: rank?.rank,
    star: rank?.star.star
  };
}

export async function createUser(username: User["username"], password: string) {
  const hash = await hashPassword(password);

  return prisma.user.create({
    data: {
      username,
      password: { create: { hash } }
    }
  });
}

export async function updatePassword(
  username: User["username"],
  password: string
) {
  return prisma.password.update({
    data: { hash: await hashPassword(password) },
    where: { username }
  });
}

export async function updateBio(username: User["username"], bio: string) {
  return prisma.user.update({
    data: { bio },
    where: { username }
  });
}

export async function verifyLogin(
  username: User["username"],
  password: Password["hash"]
) {
  const userPassword = await getPassword(username);

  if (!userPassword || !("hash" in userPassword)) {
    return false;
  }

  return await comparePassword(password, userPassword.hash);
}

export async function updateAvatar(
  username: User["username"],
  avatar: NodeOnDiskFile
) {
  let img = sharp(await avatar.arrayBuffer()).avif();
  const meta = await img.metadata();

  const size = Math.min(500, Math.max(100, meta.height ?? 0, meta.width ?? 0));

  if (size !== meta.height || size !== meta.width) {
    img = img.resize(size, size, { fit: "fill" });
  }

  return await writeFile(
    join(cwd(), "static", "usercontent", "avatar", `${username}.avif`),
    await img.toBuffer()
  );
}

export async function rankList() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { username: true, createdAt: true }
  });
}

export async function getRank(cur: User["username"]) {
  const list = await rankList();

  for (const [rank, { username, createdAt }] of list.entries()) {
    if (cur === username) {
      return { rank: rank + 1, createdAt };
    }
  }

  return null;
}

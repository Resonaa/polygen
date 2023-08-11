import { join } from "path";

import type { User } from "@prisma/client";
import type { NodeOnDiskFile } from "@remix-run/node";
import { writeFile } from "fs-extra";
import sharp from "sharp";

import { CWD } from "~/constants.server";
import { prisma } from "~/db.server";
import { getRank } from "~/models/star.server";
import { comparePassword, hashPassword } from "~/session.server";

export type { User } from "@prisma/client";

function getUserByUsername(username: User["username"]) {
  return prisma.user.findUnique({ where: { username } });
}

export async function getUserWithoutPasswordByUsername(username: User["username"]) {
  const user = await getUserByUsername(username);

  if (!user) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getStatsByUsername(username: User["username"]) {
  const data = await prisma.user.findUnique({
    where: { username },
    include: { _count: { select: { comments: true, posts: true } } }
  });
  const rank = await getRank(username);
  return {
    posts: data?._count.posts, comments: data?._count.comments,
    rank: rank?.rank, star: rank?.star?.star
  };
}

export async function createUser(username: User["username"], password: string) {
  const hashedPassword = await hashPassword(password);

  return prisma.user.create({
    data: {
      username,
      password: hashedPassword
    }
  });
}

export async function updatePasswordByUsername(username: User["username"], password: string) {
  return prisma.user.update({ data: { password: await hashPassword(password) }, where: { username } });
}

export function updateBioByUsername(username: User["username"], bio: string) {
  return prisma.user.update({
    data: { bio },
    where: { username }
  });
}

export async function verifyLogin(
  username: User["username"],
  password: User["password"]
) {
  const user = await getUserByUsername(username);

  if (!user || !("password" in user)) {
    return null;
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

export async function updateAvatarByUsername(username: User["username"], avatar: NodeOnDiskFile) {
  let img = sharp(await avatar.arrayBuffer()).webp();
  const meta = await img.metadata();

  const size = Math.min(500, Math.max(100, meta.height ?? 0, meta.width ?? 0));

  if (size !== meta.height || size !== meta.width) {
    img = img.resize(size, size, { fit: "fill" });
  }

  return writeFile(join(CWD, `usercontent/avatar/${username}.webp`), await img.toBuffer());
}
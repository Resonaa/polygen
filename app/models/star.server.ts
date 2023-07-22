import type { Star } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Star };

export async function getStarOrCreate(username: Star["username"]) {
  let res = await prisma.star.findUnique({ where: { username } });
  if (!res) {
    res = await prisma.star.create({ data: { user: { connect: { username } } } });
  }
  return res;
}

export function updateStar(username: Star["username"], increment: Star["star"]) {
  return prisma.star.updateMany({ data: { star: { increment } }, where: { username } });
}

export function rankList() {
  return prisma.star.findMany({ orderBy: { star: "desc" } });
}

export async function getRank(username: Star["username"]) {
  const list = await rankList();
  for (const [rank, item] of list.entries()) {
    if (item.username === username) {
      return { rank: rank + 1, star: item };
    }
  }
  return null;
}
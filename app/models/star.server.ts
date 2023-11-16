import type { Star } from "@prisma/client";
import { rating, ordinal } from "openskill";

import prisma from "~/db.server";

export type { Star };

export async function getStarOrCreate(username: Star["username"]) {
  let res = await prisma.star.findUnique({ where: { username } });
  if (!res) {
    const data = rating();
    res = await prisma.star.create({
      data: { user: { connect: { username } }, ...data, star: ordinal(data) }
    });
  }
  return res;
}

export async function updateStar(
  username: Star["username"],
  mu: Star["mu"],
  sigma: Star["sigma"]
) {
  return await prisma.star.update({
    data: { mu, sigma, star: ordinal({ mu, sigma }) },
    where: { username }
  });
}

export async function rankList() {
  return await prisma.star.findMany({ orderBy: { star: "desc" } });
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

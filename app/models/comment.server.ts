import type { Comment } from "@prisma/client";

import prisma from "~/db.server";

export type { Comment } from "@prisma/client";

export async function getComment(id: Comment["id"]) {
  return prisma.comment.findUnique({ where: { id } });
}

export async function getComments(
  page: number,
  parentCuid?: Comment["parentCuid"]
) {
  return prisma.comment.findMany({
    where: { parentCuid },
    orderBy: { id: "desc" },
    skip: (page - 1) * 10,
    take: 10
  });
}

export async function createComment(
  username: Comment["username"],
  content: Comment["content"],
  parentCuid: Comment["parentCuid"]
) {
  return prisma.comment.create({
    data: {
      content,
      user: { connect: { username } },
      parent: { connect: { cuid: parentCuid } }
    }
  });
}

export async function deleteComment(id: Comment["id"]) {
  return prisma.comment.delete({ where: { id } });
}

export async function rankList() {
  const ranks = await prisma.user.findMany({
    orderBy: { comments: { _count: "desc" } },
    select: { _count: { select: { comments: true } }, username: true }
  });

  return ranks.filter(({ _count: { comments } }) => comments > 0);
}

export async function getRank(cur: Comment["username"]) {
  const list = await rankList();

  for (const [
    rank,
    {
      username,
      _count: { comments }
    }
  ] of list.entries()) {
    if (username === cur) {
      return { rank: rank + 1, comments };
    }
  }

  return null;
}

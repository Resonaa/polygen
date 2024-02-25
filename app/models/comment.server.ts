import type { Comment } from "@prisma/client";
import _ from "lodash";

import prisma from "~/db.server";

export type { Comment } from "@prisma/client";

export async function getComment(id: Comment["id"]) {
  return prisma.comment.findUnique({ where: { id } });
}

export async function getComments(
  page: number,
  parentCuid?: Comment["parentCuid"],
  getPrivate?: Comment["isPrivate"]
) {
  return prisma.comment.findMany({
    where: {
      parentCuid,
      isPrivate: parentCuid ?? getPrivate ? undefined : false
    },
    orderBy: { id: "desc" },
    skip: (page - 1) * 10,
    take: 10
  });
}

export async function createComment(
  username: Comment["username"],
  content: Comment["content"],
  parentCuid: Comment["parentCuid"],
  isPrivate: Comment["isPrivate"]
) {
  return prisma.comment.create({
    data: {
      content,
      isPrivate,
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
    select: {
      _count: { select: { comments: { where: { isPrivate: false } } } },
      username: true
    }
  });

  const filtered = ranks.filter(({ _count: { comments } }) => comments > 0);

  return _.sortBy(filtered, user => -user._count.comments);
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

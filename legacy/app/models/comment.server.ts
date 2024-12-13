import type { Comment } from "@prisma/client";
import _ from "lodash";

import prisma from "~/db.server";

export type { Comment } from "@prisma/client";

import { COMMENTS_PER_PAGE, RECENT_COMMENTS_COUNT } from "./common";

export function getComment(id: Comment["id"]) {
  return prisma.comment.findUnique({ where: { id } });
}

export function getComments(page: number, parentCuid: Comment["parentCuid"]) {
  return prisma.comment.findMany({
    where: {
      parentCuid
    },
    orderBy: { id: "desc" },
    skip: (page - 1) * COMMENTS_PER_PAGE,
    take: COMMENTS_PER_PAGE
  });
}

export function getRecentComments(getPrivate: Comment["isPrivate"]) {
  return prisma.comment.findMany({
    where: {
      isPrivate: getPrivate ? undefined : false
    },
    orderBy: { id: "desc" },
    take: RECENT_COMMENTS_COUNT,
    include: {
      parent: {
        select: {
          username: true
        }
      }
    }
  });
}

export function createComment(
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

export function deleteComment(id: Comment["id"]) {
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

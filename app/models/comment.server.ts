import type { Comment } from "@prisma/client";

import prisma from "~/db.server";

export type { Comment } from "@prisma/client";

export function getComment(id: Comment["id"]) {
  return prisma.comment.findUnique({ where: { id } });
}

export function getComments(page: number, parentId?: Comment["parentId"]) {
  return prisma.comment.findMany({
    where: { parentId },
    orderBy: { id: "desc" },
    skip: (page - 1) * 10,
    take: 10
  });
}

export function createComment(
  username: Comment["username"],
  content: Comment["content"],
  parentId: Comment["parentId"]
) {
  return prisma.comment.create({
    data: {
      content,
      user: { connect: { username } },
      parent: { connect: { id: parentId } }
    }
  });
}

export function deleteComment(id: Comment["id"]) {
  return prisma.comment.delete({ where: { id } });
}

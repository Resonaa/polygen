import type { Comment } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Comment } from "@prisma/client";

export function getComments({ parentId, page }: { parentId?: Comment["parentId"], page: number }) {
  return prisma.comment.findMany({
    where: parentId ? { parentId } : undefined,
    orderBy: { id: "desc" },
    skip: (page - 1) * 10,
    take: 10
  });
}

export function createComment({ content, username, parentId }: Pick<Comment, "content" | "username" | "parentId">) {
  return prisma.comment.create({
    data: {
      content,
      user: { connect: { username } },
      parent: { connect: { id: parentId } }
    }
  });
}
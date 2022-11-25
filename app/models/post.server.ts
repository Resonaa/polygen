import type { Post } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Post } from "@prisma/client";

export function getPost({ id, username }: Pick<Post, "id" | "username">) {
  return prisma.post.findFirst({
    where: { id, username }
  });
}

export function getPostListItems({ username }: Pick<Post, "username">) {
  return prisma.post.findMany({
    where: { username },
    orderBy: { updatedAt: "desc" }
  });
}

export function createPost({ content, username }: Pick<Post, "content" | "username">) {
  return prisma.post.create({
    data: {
      content,
      user: { connect: { username } }
    }
  });
}

export function deletePost({ id, username }: Pick<Post, "id" | "username">) {
  return prisma.post.deleteMany({
    where: { id, username }
  });
}

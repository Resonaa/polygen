import type { Post } from "@prisma/client";

import { prisma } from "~/db.server";

import type { User } from "./user.server";

export type { Post } from "@prisma/client";

export async function getPost(id: Post["id"]) {
  await prisma.post.updateMany({
    where: { id },
    data: { viewCount: { increment: 1 } }
  });

  return prisma.post.findUnique({
    where: { id },
    include: {
      _count: { select: { comments: true } }
    }
  });
}

export async function getPosts(page: number) {
  const firstPost = await prisma.post.findFirst({ orderBy: { id: "desc" } });
  const maxId = firstPost ? firstPost.id : 0;

  await prisma.post.updateMany({
    where: { id: { gt: maxId - page * 10 } },
    data: { viewCount: { increment: 1 } }
  });

  return prisma.post.findMany({
    orderBy: { id: "desc" },
    skip: (page - 1) * 10,
    take: 10,
    include: {
      _count: { select: { comments: true } }
    }
  });
}

export async function getPostsByUsername(
  username: User["username"],
  page: number
) {
  const firstPost = await prisma.post.findFirst({
    where: { username },
    orderBy: { id: "desc" }
  });
  const maxId = firstPost?.id ?? 0;

  await prisma.post.updateMany({
    where: { id: { gt: maxId - page * 10 }, username },
    data: { viewCount: { increment: 1 } }
  });

  return prisma.post.findMany({
    where: { username },
    orderBy: { id: "desc" },
    skip: (page - 1) * 10,
    take: 10,
    include: {
      _count: { select: { comments: true } }
    }
  });
}

export function createPost(
  username: Post["username"],
  content: Post["content"]
) {
  return prisma.post.create({
    data: { content, user: { connect: { username } } }
  });
}

export function updatePost(content: Post["content"], id: Post["id"]) {
  return prisma.post.update({ data: { content }, where: { id } });
}

export function deletePost(id: Post["id"]) {
  return prisma.post.delete({ where: { id } });
}

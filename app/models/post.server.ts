import type { Post } from "@prisma/client";

import prisma from "~/db.server";

import { cuid } from "./cuid.server";
import type { User } from "./user.server";

export type { Post } from "@prisma/client";

export async function getPost(cuid: Post["cuid"]) {
  return prisma.post.findUnique({
    where: { cuid },
    include: {
      _count: { select: { comments: true } }
    }
  });
}

export async function getPosts(page: number) {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
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
  return prisma.post.findMany({
    where: { username },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * 10,
    take: 10,
    include: {
      _count: { select: { comments: true } }
    }
  });
}

export async function createPost(
  username: Post["username"],
  content: Post["content"]
) {
  return prisma.post.create({
    data: { content, user: { connect: { username } }, cuid: cuid() }
  });
}

export async function updatePost(content: Post["content"], cuid: Post["cuid"]) {
  return prisma.post.update({ data: { content }, where: { cuid } });
}

export function deletePost(cuid: Post["cuid"]) {
  return prisma.post.delete({ where: { cuid } });
}

export async function rankList() {
  const ranks = await prisma.user.findMany({
    orderBy: { posts: { _count: "desc" } },
    select: { _count: { select: { posts: true } }, username: true }
  });

  return ranks.filter(({ _count: { posts } }) => posts > 0);
}

export async function getRank(cur: User["username"]) {
  const list = await rankList();

  for (const [
    rank,
    {
      username,
      _count: { posts }
    }
  ] of list.entries()) {
    if (username === cur) {
      return { rank: rank + 1, posts };
    }
  }

  return null;
}

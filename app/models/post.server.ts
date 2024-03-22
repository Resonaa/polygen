import type { Post } from "@prisma/client";
import sortBy from "lodash/sortBy";

import prisma from "~/db.server";
import { cuid } from "~/utils/cuid";

import { POSTS_PER_PAGE } from "./common";
import type { User } from "./user.server";

export type { Post } from "@prisma/client";

export function getPost(cuid: Post["cuid"]) {
  return prisma.post.findUnique({
    where: { cuid },
    include: {
      _count: { select: { comments: true } }
    }
  });
}

export function getPosts(page: number, getPrivate: string | boolean) {
  const where =
    typeof getPrivate === "string"
      ? {
          OR: [{ username: getPrivate }, { isPrivate: false }]
        }
      : getPrivate
        ? undefined
        : {
            isPrivate: false
          };

  return prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
    include: {
      _count: { select: { comments: true } }
    }
  });
}

export function getPostsByUsername(username: User["username"], page: number) {
  return prisma.post.findMany({
    where: { username, isPrivate: false },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
    include: {
      _count: { select: { comments: true } }
    }
  });
}

export function createPost(
  username: Post["username"],
  content: Post["content"],
  isPrivate: Post["isPrivate"]
) {
  return prisma.post.create({
    data: { content, user: { connect: { username } }, cuid: cuid(), isPrivate }
  });
}

export function updatePost(content: Post["content"], cuid: Post["cuid"]) {
  return prisma.post.update({ data: { content }, where: { cuid } });
}

export function deletePost(cuid: Post["cuid"]) {
  return prisma.post.delete({ where: { cuid } });
}

export async function rankList() {
  const ranks = await prisma.user.findMany({
    select: {
      _count: { select: { posts: { where: { isPrivate: false } } } },
      username: true
    }
  });

  const filtered = ranks.filter(({ _count: { posts } }) => posts > 0);

  return sortBy(filtered, user => -user._count.posts);
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

import type { User, Post } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Post } from "@prisma/client";

export function getPost({
                          id, authorname
                        }: Pick<Post, "id"> & {
  authorname: User["username"];
}) {
  return prisma.post.findFirst({
    where: { id, authorname }
  });
}

export function getPostListItems({ authorname }: { authorname: User["username"] }) {
  return prisma.post.findMany({
    where: { authorname },
    orderBy: { updatedAt: "desc" }
  });
}

export function createPost({
                             content,
                             username
                           }: Pick<Post, "content"> & {
  username: User["username"];
}) {
  return prisma.post.create({
    data: {
      content,
      author: {
        connect:
          { username }
      }
    }
  });
}

export function deletePost({
                             id,
                             authorname
                           }: Pick<Post, "id"> & { authorname: User["username"] }) {
  return prisma.post.deleteMany({
    where: { id, authorname }
  });
}

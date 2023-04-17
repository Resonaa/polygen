import type { Announcement } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Announcement } from "@prisma/client";

export function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { id: "desc" }
  });
}

export function createAnnouncement({ title, content }: Pick<Announcement, "title"> & Pick<Announcement, "content">) {
  return prisma.announcement.create({
    data: {
      title,
      content
    }
  });
}
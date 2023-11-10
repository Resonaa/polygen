import type { Announcement } from "@prisma/client";

import prisma from "~/db.server";

export type { Announcement } from "@prisma/client";

export function getAnnouncement(id: Announcement["id"]) {
  return prisma.announcement.findUnique({ where: { id } });
}

export function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { id: "desc" }
  });
}

export function deleteAnnouncement(id: Announcement["id"]) {
  return prisma.announcement.delete({ where: { id } });
}

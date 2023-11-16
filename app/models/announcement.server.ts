import type { Announcement } from "@prisma/client";

import prisma from "~/db.server";

export type { Announcement } from "@prisma/client";

export async function getAnnouncement(id: Announcement["id"]) {
  return await prisma.announcement.findUnique({ where: { id } });
}

export async function getAnnouncements() {
  return await prisma.announcement.findMany({
    orderBy: { id: "desc" }
  });
}

export async function deleteAnnouncement(id: Announcement["id"]) {
  return await prisma.announcement.delete({ where: { id } });
}

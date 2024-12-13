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

export function updateAnnouncement(
  id: Announcement["id"],
  title: Announcement["title"],
  content: Announcement["content"]
) {
  return prisma.announcement.update({
    where: { id },
    data: { title, content }
  });
}

export function createAnnouncement(
  lang: Announcement["lang"],
  title: Announcement["title"],
  content: Announcement["content"]
) {
  return prisma.announcement.create({ data: { lang, title, content } });
}

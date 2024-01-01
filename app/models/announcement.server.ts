import type { Announcement } from "@prisma/client";

import prisma from "~/db.server";

export type { Announcement } from "@prisma/client";

export async function getAnnouncement(id: Announcement["id"]) {
  return prisma.announcement.findUnique({ where: { id } });
}

export async function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { id: "desc" }
  });
}

export async function deleteAnnouncement(id: Announcement["id"]) {
  return prisma.announcement.delete({ where: { id } });
}

export async function updateAnnouncement(
  id: Announcement["id"],
  title: Announcement["title"],
  content: Announcement["content"]
) {
  return prisma.announcement.update({
    where: { id },
    data: { title, content }
  });
}

export async function createAnnouncement(
  lang: Announcement["lang"],
  title: Announcement["title"],
  content: Announcement["content"]
) {
  return prisma.announcement.create({ data: { lang, title, content } });
}

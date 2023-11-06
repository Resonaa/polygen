import prisma from "~/db.server";

export type { Announcement } from "@prisma/client";

export function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { id: "desc" }
  });
}

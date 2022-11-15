import { prisma } from "~/db.server";

export function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { id: "desc" }
  });
}
import type { Announcement } from "@prisma/client";

import prisma from "~/db.server";

export type { Announcement } from "@prisma/client";

export function getAnnouncements(lang: Announcement["lang"]) {
  return prisma.announcement.findMany({
    where: { lang },
    orderBy: { id: "desc" }
  });
}

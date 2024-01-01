import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import Access from "~/access";
import { createAnnouncement } from "~/models/announcement.server";
import { requireUser } from "~/session.server";
import { validateCreateAnnouncementFormData } from "~/validators/community.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUser(request, Access.ManageAnnouncement);

  const data = await request.formData();
  const res = validateCreateAnnouncementFormData(data);

  if (res.success) {
    const { lang, title, content } = res.data;

    await createAnnouncement(lang, title, content);
  }

  return null;
}

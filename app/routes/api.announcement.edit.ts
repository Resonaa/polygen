import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import Access from "~/access";
import { updateAnnouncement } from "~/models/announcement.server";
import { requireUser } from "~/session.server";
import { validateEditAnnouncementFormData } from "~/validators/community.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUser(request, Access.ManageAnnouncement);

  const data = await request.formData();
  const res = validateEditAnnouncementFormData(data);

  if (res.success) {
    const { id, title, content } = res.data;

    await updateAnnouncement(id, title, content);
  }

  return null;
}

import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import Access from "~/access";
import {
  deleteAnnouncement,
  getAnnouncement
} from "~/models/announcement.server";
import { requireUser } from "~/session.server";
import { validateDeleteAnnouncementFormData } from "~/validators/community.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUser(request, Access.ManageAnnouncement);

  const data = await request.formData();
  const res = validateDeleteAnnouncementFormData(data);

  if (res.success) {
    const { id } = res.data;

    if (!(await getAnnouncement(id))) {
      return null;
    }

    await deleteAnnouncement(id);
  }

  return null;
}

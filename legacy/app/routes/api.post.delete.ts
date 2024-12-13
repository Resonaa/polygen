import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import Access from "~/access";
import { deletePost, getPost } from "~/models/post.server";
import { requireUser } from "~/session.server";
import { validateDeletePostFormData } from "~/validators/community.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request, Access.Community);

  const data = await request.formData();
  const res = validateDeletePostFormData(data);

  if (res.success) {
    const { cuid } = res.data;

    const post = await getPost(cuid);
    if (!post) {
      return null;
    }

    if (user.username !== post.username) {
      await requireUser(request, Access.ManageCommunity);
    }

    await deletePost(cuid);

    return redirect("/");
  }

  return null;
}

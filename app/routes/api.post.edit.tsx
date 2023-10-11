import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import Access from "~/access";
import { getPost, updatePost } from "~/models/post.server";
import { requireAuthenticatedUser } from "~/session.server";
import { validateEditPostFormData } from "~/validators/community.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuthenticatedUser(request, Access.Community);

  const data = await request.formData();
  const res = validateEditPostFormData(data);

  if (res.success) {
    const { id, content } = res.data;

    const post = await getPost(id);
    if (!post) {
      return null;
    }

    if (user.username !== post.username) {
      await requireAuthenticatedUser(request, Access.ManageCommunity);
    }

    await updatePost(content, id);
  }

  return null;
}

import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import Access from "~/access";
import { deletePost, getPost } from "~/models/post.server";
import { requireAuthenticatedUser } from "~/session.server";
import { validatePage } from "~/validator.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  const user = await requireAuthenticatedUser(request, Access.Community);

  const formData = await request.formData();
  const id = Number(formData.get("id"));

  if (!validatePage(id)) {
    return json("说说ID不合法", { status: 400 });
  }

  const post = await getPost(id);
  if (!post) {
    return json("说说不存在", { status: 400 });
  }

  if (user.username !== post.username) {
    await requireAuthenticatedUser(request, Access.ManageCommunity);
  }

  await deletePost(id);

  return json("删除成功");
}
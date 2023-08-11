import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import Access from "~/access";
import { getPost, updatePost } from "~/models/post.server";
import { requireAuthenticatedUser } from "~/session.server";
import { validatePage, validatePostContent } from "~/validator.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  const user = await requireAuthenticatedUser(request, Access.Community);

  const formData = await request.formData();
  const id = Number(formData.get("id"));
  const content = formData.get("content");

  if (!validatePage(id)) {
    return json("说说ID不合法", { status: 400 });
  }

  if (!validatePostContent(content)) {
    return json("说说内容不合法", { status: 400 });
  }

  const post = await getPost(id);
  if (!post) {
    return json("说说不存在", { status: 400 });
  }

  if (user.username !== post.username) {
    await requireAuthenticatedUser(request, Access.ManageCommunity);
  }

  await updatePost(content, id);

  return json("编辑成功");
}
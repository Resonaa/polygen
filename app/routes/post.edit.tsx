import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { updatePost } from "~/models/post.server";
import { requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";
import { validatePostContent } from "~/utils.server";

export async function loader({ request }: ActionArgs) {
  return await requireAuthenticatedUser(request, Access.Community);
}

export async function action({ request }: ActionArgs) {
  const { username } = await requireAuthenticatedUser(request, Access.Community);

  const data = await request.json();
  const id = data.id, content = data.content;

  if (typeof id !== "number" || id <= 0) {
    return json("说说ID不合法", { status: 400 });
  }

  if (!validatePostContent(content)) {
    return json("说说内容不合法", { status: 400 });
  }

  await updatePost(username, content, id);

  return json("修改成功");
}
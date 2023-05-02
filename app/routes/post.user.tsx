import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { getPostsByUsername } from "~/models/post.server";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";
import { renderText } from "~/utils.server";

export async function loader({ request }: ActionArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.Basic);
}

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);

  const data = await request.json();
  const username = data.username;
  const page = data.page;

  if (typeof username !== "string") {
    return json("用户名不合法", { status: 400 });
  }

  if (typeof page !== "number" || page <= 0) {
    return json("页数不合法", { status: 400 });
  }

  const posts = await getPostsByUsername({ username, page });

  for (let post of posts) {
    post.content = renderText(post.content);
  }

  return json(posts);
}
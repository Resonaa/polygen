import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { getPosts } from "~/models/post.server";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";
import { renderText } from "~/utils.server";

export async function loader({ request }: ActionArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.Basic);
}

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);

  const data = await request.json();
  const page = data.page;

  if (typeof page !== "number" || page <= 0)
    return json("页数不合法", { status: 400 });

  const posts = await getPosts(page);

  for (let post of posts) {
    post.content = renderText(post.content);
  }

  return json(posts);
}
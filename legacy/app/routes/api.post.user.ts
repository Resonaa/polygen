import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import Access from "~/access";
import { getPostsByUsername } from "~/models/post.server";
import { badRequest } from "~/reponses.server";
import { requireOptionalUser } from "~/session.server";
import { validateGetUserPostFormData } from "~/validators/community.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  await requireOptionalUser(request, Access.Basic);

  const data = await request.formData();
  const res = validateGetUserPostFormData(data);

  if (res.success) {
    const { username, page } = res.data;
    return getPostsByUsername(username, page);
  }

  return badRequest;
}

import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import Access, { access } from "~/access";
import { getPosts } from "~/models/post.server";
import { badRequest } from "~/reponses.server";
import { requireOptionalUser } from "~/session.server";
import { validateGetPostPageFormData } from "~/validators/community.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireOptionalUser(request, Access.Basic);
  const getPrivate = user
    ? access(user, Access.ManageCommunity)
      ? true
      : user.username
    : false;

  const data = await request.formData();
  const res = validateGetPostPageFormData(data);

  if (res.success) {
    const { page } = res.data;

    return json(await getPosts(page, getPrivate));
  }

  return badRequest;
}

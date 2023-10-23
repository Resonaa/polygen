import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import Access from "~/access";
import { getPosts } from "~/models/post.server";
import { badRequest } from "~/reponses.server";
import { requireOptionalUser } from "~/session.server";
import { validateGetPostPageFormData } from "~/validators/community.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  await requireOptionalUser(request, Access.Basic);

  const data = await request.formData();
  const res = validateGetPostPageFormData(data);

  if (res.success) {
    const { page } = res.data;

    return json(await getPosts(page));
  }

  return badRequest;
}

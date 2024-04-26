import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import Access from "~/access";
import { getComments } from "~/models/comment.server";
import { badRequest, turbo } from "~/reponses.server";
import { requireOptionalUser } from "~/session.server";
import { validateGetCommentPageFormData } from "~/validators/community.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  await requireOptionalUser(request, Access.Basic);

  const data = await request.formData();
  const res = validateGetCommentPageFormData(data);

  if (res.success) {
    const { parentCuid, page } = res.data;

    return turbo(await getComments(page, parentCuid));
  }

  return badRequest;
}

import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import Access from "~/access";
import { deleteComment, getComment } from "~/models/comment.server";
import { requireUser } from "~/session.server";
import { validateDeleteCommentFormData } from "~/validators/community.server";

export function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request, Access.Community);

  const data = await request.formData();
  const res = validateDeleteCommentFormData(data);

  if (res.success) {
    const { id } = res.data;

    const comment = await getComment(id);
    if (!comment) {
      return null;
    }

    if (user.username !== comment.username) {
      await requireUser(request, Access.ManageCommunity);
    }

    await deleteComment(id);
  }

  return null;
}

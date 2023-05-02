import type { ActionArgs, NodeOnDiskFile } from "@remix-run/node";
import {
  json,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler, unstable_parseMultipartFormData
} from "@remix-run/node";

import { updateAvatarByUsername, updateBioByUsername } from "~/models/user.server";
import { requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";

export async function loader({ request }: ActionArgs) {
  const user = await requireAuthenticatedUser(request, Access.Settings);
  return redirect("/user/" + user.username);
}

export async function action({ request }: ActionArgs) {
  const user = await requireAuthenticatedUser(request, Access.Settings);

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename,
    }),
    unstable_createMemoryUploadHandler()
  );

  try {
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );

    const avatar = formData.get("avatar");
    const bio = formData.get("bio");

    if (typeof bio !== "string" || bio.length > 161) {
      return json("个性签名不合法", { status: 400 });
    }

    await updateBioByUsername(user.username, bio);

    if (!avatar) {
      return json("编辑成功");
    }

    const data = avatar as unknown as NodeOnDiskFile;
    await updateAvatarByUsername(user.username, data);
    await data.remove();
  } catch (_) {
  }

  return json("编辑成功");
}
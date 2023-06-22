import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { deleteScore } from "~/models/score.server";
import { requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";

export async function loader({ request }: ActionArgs) {
  return await requireAuthenticatedUser(request, Access.Community);
}

export async function action({ request }: ActionArgs) {
  const { username } = await requireAuthenticatedUser(request, Access.Community);
  await deleteScore(username);
  return redirect("/leaderboard");
}
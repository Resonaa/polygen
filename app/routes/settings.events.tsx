import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { Button } from "semantic-ui-react";

import { deleteScore } from "~/models/score.server";
import { requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedUser(request, Access.Settings);
}

export async function action({ request }: ActionArgs) {
  const { username } = await requireAuthenticatedUser(request, Access.Settings);
  await deleteScore(username);
  return redirect("/settings/events");
}

export default function Events() {
  const navigation = useNavigation();

  return (
    <div>
      <p>
        <strong>成绩删除后不可撤销，请谨慎操作</strong>
      </p>

      <form method="post">
        <Button negative type="submit" loading={navigation.state === "submitting"}
                disabled={navigation.state === "submitting"}>删除成绩</Button>
      </form>
    </div>
  );
}
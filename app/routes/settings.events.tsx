import type { LoaderArgs } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { Button } from "semantic-ui-react";

import { requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedUser(request, Access.Settings);
}

export default function Events() {
  const navigation = useNavigation();

  return (
    <div>
      <p>
        <strong>成绩删除后不可撤销，请谨慎操作</strong>
      </p>

      <form action="/events/deleteScore" method="post">
        <Button negative type="submit" loading={navigation.state === "submitting"}
                disabled={navigation.state === "submitting"}>删除成绩</Button>
      </form>
    </div>
  );
}
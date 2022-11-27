import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import fs from "fs";

export async function loader({ params }: LoaderArgs) {
  const username = params?.username?.replace(".jpg", "");

  try {
    const data = fs.readFileSync(`${process.cwd()}/public/usercontent/avatar/${username}.jpg`);

    return new Response(data, { status: 200 });
  } catch (_) {
    return redirect("/images/defaultAvatar.jpg");
  }
}
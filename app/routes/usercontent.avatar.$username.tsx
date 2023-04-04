import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import fs from "fs-extra";

export async function loader({ params }: LoaderArgs) {
  try {
    return new Response(await fs.readFile("./public/usercontent/avatar/" + params?.username));
  } catch (_) {
    return redirect("/images/defaultAvatar.jpg");
  }
}
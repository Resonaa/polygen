import type { LoaderArgs } from "@remix-run/node";
import fs from "fs-extra";

const defaultAvatar = fs.readFileSync("./public/images/defaultAvatar.jpg");

export async function loader({ params }: LoaderArgs) {
  try {
    return new Response(await fs.readFile("./usercontent/avatar/" + params?.username));
  } catch (_) {
    return new Response(defaultAvatar);
  }
}
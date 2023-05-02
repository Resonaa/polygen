import type { LoaderArgs } from "@remix-run/node";
import fs from "fs-extra";

const defaultAvatar = fs.readFileSync("./public/images/defaultAvatar.webp");

export async function loader({ params }: LoaderArgs) {
  const headers = {
    "Cache-Control": "public, max-age=3600"
  };

  try {
    return new Response(await fs.readFile("./usercontent/avatar/" + params?.username), { headers });
  } catch (_) {
    return new Response(defaultAvatar, { headers });
  }
}
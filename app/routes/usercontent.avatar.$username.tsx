import path from "path";

import type { LoaderArgs } from "@remix-run/node";
import fs from "fs-extra";

import { USERCONTENT_DIR } from "~/const";

const defaultAvatar = fs.readFileSync("./static/defaultAvatar.webp");

export async function loader({ params }: LoaderArgs) {
  const headers = {
    "Cache-Control": "public, max-age=3600"
  };

  try {
    return new Response(await fs.readFile(path.join(USERCONTENT_DIR, "avatar", params.username ? params.username : "")), { headers });
  } catch (_) {
    return new Response(defaultAvatar, { headers });
  }
}
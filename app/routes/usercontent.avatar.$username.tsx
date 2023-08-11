import path from "path";

import type { LoaderArgs } from "@remix-run/node";
import { readFile } from "fs-extra";

import { USERCONTENT_DIR } from "~/constants.server";

const headers = new Headers();
headers.append("Cache-Control", "public, max-age=3600");

export async function loader({ params }: LoaderArgs) {
  try {
    return new Response(await readFile(path.join(USERCONTENT_DIR, "avatar", params.username ?? "")), { headers });
  } catch (_) {
    return new Response(null, { headers });
  }
}
import { join } from "path";
import { cwd } from "process";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { readFile } from "fs-extra";

const headers = new Headers();
headers.append("Cache-Control", "public, max-age=3600");

const baseDir = join(cwd(), "usercontent/avatar");

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    return new Response(await readFile(join(baseDir, params.username ?? "")), {
      headers
    });
  } catch {
    return new Response(null, { headers });
  }
}

import { createReadStream } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { PassThrough } from "node:stream";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";

const headers = new Headers({
  "Cache-Control": "public, max-age=3600",
  "Content-Type": "image/avif"
});

const baseDir = join(cwd(), "usercontent", "avatar");

export function loader({ params }: LoaderFunctionArgs) {
  const path = join(baseDir, params.username ?? "");
  const stream = createReadStream(path);
  const body = new PassThrough();

  stream.on("error", () => body.destroy()).pipe(body);

  return new Response(createReadableStreamFromReadable(body), {
    headers
  });
}

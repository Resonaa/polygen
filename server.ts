import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

import { fastifyStatic } from "@fastify/static";
import { createRequestHandler } from "@mcansh/remix-fastify";
import fastify from "fastify";
import fastifySocketIO from "fastify-socket.io";
import parser from "socket.io-msgpack-parser";

import { MODE, PORT } from "~/env.server";
import setServer from "~/game/socket/server/index";
import type { Server } from "~/game/socket/types";

declare module "fastify" {
  /**
   * Socket.IO server.
   */
  interface FastifyInstance {
    io: Server;
  }
}

const USERCONTENT_DIR = join(cwd(), "static", "usercontent");
const PUBLIC_DIR = join(cwd(), "build", "client");

// Create usercontent directory.
await mkdir(join(USERCONTENT_DIR, "avatar"), { recursive: true });

// Create Vite dev server.
const vite =
  MODE === "production"
    ? undefined
    : await import("vite").then(vite =>
        vite.createServer({
          server: { middlewareMode: true }
        })
      );

// Construct Fastify app.
const app = fastify({
  logger: { transport: { target: "@fastify/one-line-logger" } }
});

// Handle asset requests.
if (vite) {
  await app.register(import("@fastify/middie"));
  await app.use(vite.middlewares);
} else {
  await app.register(fastifyStatic, {
    root: PUBLIC_DIR,
    decorateReply: false,
    wildcard: false,
    maxAge: "1y",
    immutable: true
  });
}

app.removeAllContentTypeParsers();

// Allow all content types.
app.addContentTypeParser("*", (_request, payload, done) => {
  done(null, payload);
});

// Register Socket.IO server.
await app.register(fastifySocketIO, {
  transports: ["websocket"],
  parser,
  serveClient: false
});
setServer(app.io);

const build = vite
  ? () => vite.ssrLoadModule("virtual:remix/server-build")
  : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line import/no-unresolved
    await import("./build/server/index.js");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.all("*", createRequestHandler({ build }));

await app.listen({ port: PORT });

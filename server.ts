import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

import { fastifyStatic } from "@fastify/static";
import { createRequestHandler } from "@mcansh/remix-fastify";
import fastify from "fastify";
import fastifySocketIO from "fastify-socket.io";
import parser from "socket.io-msgpack-parser";
import { install } from "source-map-support";

import { setServer } from "~/core/server";
import type { Server } from "~/core/types";
import { MODE, PORT } from "~/env.server";

declare module "fastify" {
  /**
   * Socket.IO server.
   */
  interface FastifyInstance {
    io: Server;
  }
}

const USERCONTENT_DIR = join(cwd(), "usercontent");
const PUBLIC_DIR = join(cwd(), "build", "client");

// Install source map support.
install();

// Create usercontent directory.
await mkdir(join(USERCONTENT_DIR, "avatar"), { recursive: true });

// Create Vite dev server.
const viteDevServer =
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
if (viteDevServer) {
  await app.register(await import("@fastify/middie"));
  await app.use(viteDevServer.middlewares);
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
  parser
});
setServer(app.io);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line import/no-unresolved
    await import("./build/server/index.js");

app.all("*", createRequestHandler({ build }));

await app.listen({ port: PORT });

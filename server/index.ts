import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

import fastifyEarlyHints from "@fastify/early-hints";
import { fastifyStatic } from "@fastify/static";
import { createRequestHandler, getEarlyHintLinks } from "@mcansh/remix-fastify";
import * as build from "@remix-run/dev/server-build";
import { broadcastDevReady } from "@remix-run/node";
import fastify from "fastify";
import type { FastifyContentTypeParser } from "fastify/types/content-type-parser";
import fastifySocketIO from "fastify-socket.io";
import { install } from "source-map-support";

import { setServer } from "~/core/server";
import type { Server } from "~/core/types";
import { MODE, PORT } from "~/env.server";

const USERCONTENT_DIR = join(cwd(), "usercontent");
const PUBLIC_DIR = join(cwd(), "public");
const ASSET_DIR = join(PUBLIC_DIR, "build");

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

(async () => {
  install();

  await mkdir(join(USERCONTENT_DIR, "avatar"), { recursive: true });

  const app = fastify({
    logger: { transport: { target: "@fastify/one-line-logger" } }
  });

  const noopContentParser: FastifyContentTypeParser = (_, payload, done) => {
    done(null, payload);
  };

  app.addContentTypeParser("application/json", noopContentParser);
  app.addContentTypeParser("*", noopContentParser);

  const requestHandler = createRequestHandler({ build, mode: build.mode });

  await app
    .register(fastifySocketIO, { transports: ["websocket"] })
    .register(fastifyEarlyHints, { warn: true })
    .register(fastifyStatic, {
      root: PUBLIC_DIR,
      wildcard: false,
      maxAge: "1h"
    })
    .register(fastifyStatic, {
      root: ASSET_DIR,
      prefix: "/build",
      decorateReply: false,
      maxAge: "1y",
      immutable: true
    })
    .all("*", async (request, reply) => {
      const links = getEarlyHintLinks(request, build);
      await reply.writeEarlyHintsLinks(links);
      return requestHandler(request, reply);
    })
    .listen({ port: PORT });

  if (MODE === "development") {
    await broadcastDevReady(build);
  }

  setServer(app.io);
})();

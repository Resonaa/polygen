import { join } from "path";
import { cwd, exit } from "process";

import fastifyEarlyHints from "@fastify/early-hints";
import { createRequestHandler, getEarlyHintLinks, staticFilePlugin } from "@mcansh/remix-fastify";
import { broadcastDevReady } from "@remix-run/node";
import fastify from "fastify";
import type { FastifyContentTypeParser } from "fastify/types/content-type-parser";
import fastifySocketIO from "fastify-socket.io";
import { ensureDir, exists } from "fs-extra";

import { MODE, PORT } from "~/constants.server";
import { setServer } from "~/core/server";

const BUILD_DIR = join(cwd(), "server/build");
const USERCONTENT_DIR = join(cwd(), "usercontent");

(async () => {
  if (!await exists(BUILD_DIR)) {
    console.warn(
      "Build directory doesn't exist, please run `npm run build` before starting the server."
    );
    exit(1);
  }

  const build = await import(BUILD_DIR);

  await ensureDir(join(USERCONTENT_DIR, "avatar"));

  const app = fastify({ logger: { transport: { target: "@fastify/one-line-logger" } } });

  const noopContentParser: FastifyContentTypeParser = (_, payload, done) => {
    done(null, payload);
  };

  app.addContentTypeParser("application/json", noopContentParser);
  app.addContentTypeParser("*", noopContentParser);

  await app
    .register(fastifySocketIO, { transports: ["websocket"] })
    .register(fastifyEarlyHints, { warn: true })
    .register(staticFilePlugin, {
      assetsBuildDirectory: "public/build",
      publicPath: "/build/"
    })
    .all("*", async (request, reply) => {
      const links = getEarlyHintLinks(request, build);
      await reply.writeEarlyHintsLinks(links);
      return createRequestHandler({ build, mode: build.mode })(request, reply);
    })
    .listen({ port: PORT });

  if (MODE === "development") {
    await broadcastDevReady(build);
  }

  // @ts-ignore
  setServer(app.io);
})();
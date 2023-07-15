import path from "path";
import * as process from "process";

import compress from "@fastify/compress";
import { remixFastifyPlugin } from "@mcansh/remix-fastify";
import { broadcastDevReady } from "@remix-run/node";
import fastify from "fastify";
import httpsRedirect from "fastify-https-redirect";
import fastifySocketIO from "fastify-socket.io";
import fs from "fs-extra";

import { BUILD_DIR, MODE, SSL_CERT, SSL_KEY, USERCONTENT_DIR } from "~/const";
import { setServer } from "~/core/server";

(async () => {
  if (!(await fs.exists(BUILD_DIR))) {
    console.warn(
      "Build directory doesn't exist, please run `npm run build` before starting the server."
    );
    process.exit(1);
  }

  await fs.ensureDir(path.join(USERCONTENT_DIR, "avatar"));

  let app: any;

  let logger = {
    logger: { transport: { target: "@fastify/one-line-logger" } }
  };

  if (MODE === "production" && SSL_KEY && SSL_CERT) {
    const cert = await fs.readFile(SSL_CERT);
    const key = await fs.readFile(SSL_KEY);
    app = fastify({
      http2: true,
      https: { key, cert, allowHTTP1: true },
      ...logger
    });

    await app.register(httpsRedirect);
  } else {
    app = fastify(logger);
  }

  const build = require(BUILD_DIR);

  await app.register(compress);
  await app.register(remixFastifyPlugin, {
    build,
    mode: MODE,
    purgeRequireCacheInDevelopment: false
  });
  await app.register(fastifySocketIO);

  await app.listen({ port: MODE === "production" && SSL_KEY && SSL_CERT ? 443 : 80, host: "0.0.0.0" });

  if (MODE === "development") {
    broadcastDevReady(build);
  }

  setServer(app.io);
})
();
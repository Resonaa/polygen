import { join } from "path";
import { exit } from "process";

import compress from "@fastify/compress";
import fastifyRateLimit from "@fastify/rate-limit";
import { remixFastifyPlugin } from "@mcansh/remix-fastify";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import fastify from "fastify";
import httpsRedirect from "fastify-https-redirect";
import fastifySocketIO from "fastify-socket.io";
import { ensureDir, exists, readFile } from "fs-extra";
import sourceMapSupport from "source-map-support";

import { BUILD_DIR, MODE, SSL_CERT, SSL_KEY, USERCONTENT_DIR } from "~/constants.server";
import { setServer } from "~/core/server";

(async () => {
  sourceMapSupport.install();

  installGlobals();

  if (!(await exists(BUILD_DIR))) {
    console.warn(
      "Build directory doesn't exist, please run `npm run build` before starting the server."
    );
    exit(1);
  }

  await ensureDir(join(USERCONTENT_DIR, "avatar"));

  let app: any;

  let logger = {
    logger: { transport: { target: "@fastify/one-line-logger" } }
  };

  if (MODE === "production" && SSL_KEY && SSL_CERT) {
    const cert = await readFile(SSL_CERT);
    const key = await readFile(SSL_KEY);
    app = fastify({
      https: { key, cert },
      ...logger
    });

    await app.register(httpsRedirect);
  } else {
    app = fastify(logger);
    if (MODE === "production") {
      await app.register(fastifyRateLimit, {
        max: 161,
        timeWindow: "1 minute"
      });
    }
  }

  const build = require(BUILD_DIR);

  await app.register(compress);
  await app.register(remixFastifyPlugin, {
    build,
    mode: MODE,
    purgeRequireCacheInDevelopment: false,
    unstable_earlyHints: true
  });
  await app.register(fastifySocketIO);

  await app.listen({ port: MODE === "production" && SSL_KEY && SSL_CERT ? 443 : 80, host: "0.0.0.0" });

  if (MODE === "development") {
    await broadcastDevReady(build);
  }

  setServer(app.io);
})();
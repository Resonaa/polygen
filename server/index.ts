import http from "http";
import https from "https";
import path from "path";
import * as process from "process";

import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import compression from "compression";
import express from "express";
import fs from "fs-extra";
import morgan from "morgan";
import { Server } from "socket.io";

import { BUILD_DIR, MODE, SSL_CERT, SSL_KEY, USERCONTENT_DIR } from "~/const";
import { setServer } from "~/core/server";

if (!fs.existsSync(BUILD_DIR)) {
  console.warn(
    "Build directory doesn't exist, please run `npm run build` before starting the server."
  );
  process.exit(1);
}

fs.ensureDirSync(path.join(USERCONTENT_DIR, "avatar"));

const app = express();

app.disable("x-powered-by");

let io;

const httpServer = http.createServer(app).listen(80, "0.0.0.0", () => {
  console.log("HTTP server listening on 0.0.0.0:80");
  if (MODE === "development") {
    const build = require(BUILD_DIR);
    broadcastDevReady(build);
  }
});

if (MODE === "production" && SSL_CERT && SSL_KEY) {
  const cert = fs.readFileSync(SSL_CERT);
  const key = fs.readFileSync(SSL_KEY);

  const httpsServer = https.createServer({ key, cert }, app).listen(443, "0.0.0.0", () => {
    console.log("HTTPS server listening on 0.0.0.0:443");
  });

  app.all("*", (req, res, next) => {
    let host = req.headers.host;

    if (host && (req.protocol === "http" || host.startsWith("www"))) {
      host = host.replace(/:\d+$/, "")
        .replace(/^www./, "");

      return res.redirect(307, `https://${host}${req.path}`);
    }

    next();
  });

  io = new Server(httpsServer);
} else {
  io = new Server(httpServer);
}

setServer(io);

app.use(compression());

app.use(express.static("public", { immutable: true, maxAge: "1y" }));

app.use(morgan(":method :url :status - :response-time ms"));

app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({ build: require(BUILD_DIR) })
    : (req, res, next) => {
      const build = require(BUILD_DIR);
      return createRequestHandler({ build, mode: MODE })(req, res, next);
    }
);
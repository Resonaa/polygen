import http from "http";
import https from "https";
import path from "path";

import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import dotenv from "dotenv";
import express from "express";
import fs from "fs-extra";
import morgan from "morgan";
import { Server } from "socket.io";
import parser from "socket.io-msgpack-parser";

import { setServer } from "~/core/server";

dotenv.config();

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "server/build");

if (!fs.existsSync(BUILD_DIR)) {
  console.warn(
    "Build directory doesn't exist, please run `npm run build` before starting the server."
  );
  process.exit(1);
}

const app = express();

let io;

const httpServer = http.createServer(app).listen(80, "0.0.0.0", () => {
  console.log("HTTP server listening on 0.0.0.0:80");
});

if (MODE === "production" && process.env.SSL_CERT && process.env.SSL_KEY) {
  const cert = fs.readFileSync(process.env.SSL_CERT);
  const key = fs.readFileSync(process.env.SSL_KEY);

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

  io = new Server(httpsServer, { parser });
} else {
  io = new Server(httpServer, { parser });
}

setServer(io);

app.use(compression());

app.use(express.static("public", { maxAge: "10m" }));

app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));

app.use(express.static("node_modules/vditor", { immutable: true, maxAge: "1y" }));

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
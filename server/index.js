const path = require("path");
const fs = require("fs");

const http = require("http");
const https = require("https");
const express = require("express");
const { Server } = require("socket.io");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("@remix-run/express");

require("dotenv").config({ path: ".env" });

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "server/build");

if (!fs.existsSync(BUILD_DIR)) {
  console.warn(
    "Build directory doesn't exist, please run `npm run dev` or `npm run build` before starting the server."
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

    if (req.protocol === "http" || host.startsWith("www")) {
      host = host.replace(/:\d+$/, "");
      host = host.replace(/^www./, "");

      return res.redirect(307, `https://${host}${req.path}`);
    }

    next();
  });

  io = new Server(httpsServer);
} else {
  io = new Server(httpServer);
}

io.on("connection", (socket) => {
  console.log(socket.id, "connected");

  socket.emit("confirmation", "connected!");

  socket.on("event", (data) => {
    console.log(socket.id, data);
    socket.emit("event", "pong");
  });
});

app.use(compression());

app.use(express.static("public", { maxAge: "1m" }));

app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));

app.use(morgan("tiny"));
app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({ build: require("./build") })
    : (req, res, next) => {
      purgeRequireCache();
      const build = require("./build");
      return createRequestHandler({ build, mode: MODE })(req, res, next);
    }
);

////////////////////////////////////////////////////////////////////////////////
function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
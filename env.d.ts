/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

import type { Server } from "~/core/types";

declare module "wasm-server" {
  /**
   * Raw handle to the underlying WebAssembly instance.
   */
  const __wasm: {
    memory: WebAssembly.Memory;
  };
}

declare module "fastify" {
  /**
   * Socket.IO server.
   */
  interface FastifyInstance {
    io: Server;
  }
}

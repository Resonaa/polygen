import { z } from "zod";

import type { ServerSocket } from "../types";

import { register } from "./utils";

const schema = z.function().returns(z.void());

export type Event = (data: z.infer<typeof schema>) => void;

/**
 * Receives an ack and sends it back immediately.
 */
export default (socket: ServerSocket) => {
  register(socket, "ping", schema, cb => {
    cb();
  });
};

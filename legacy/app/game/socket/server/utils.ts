import type { z } from "zod";

import type { ServerSocket } from "../types";

type ListenEvents = Parameters<ServerSocket["on"]>[0];

/**
 * Registers a type-safe event handler with automatic validation.
 */
export function register<Schema extends z.ZodType, Data = z.infer<Schema>>(
  socket: ServerSocket,
  event: ListenEvents,
  schema: Schema,
  callback: (data: Data) => void
) {
  // If validation fails, disconnect the socket forcibly.
  const listener = (data: unknown) => {
    try {
      callback(schema.parse(data));
    } catch {
      socket.disconnect(true);
    }
  };

  socket.on(event, listener);
}

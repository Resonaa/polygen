import { env } from "node:process";

import { config } from "dotenv";
import invariant from "tiny-invariant";

config({
  path: [".env.local", ".env"]
});

// Ensure that SESSION_SECRET is set.
invariant(env.SESSION_SECRET, "SESSION_SECRET must be set");

/**
 * Node mode.
 */
export const MODE = env.NODE_ENV;

/**
 * Set by user for encryption.
 */
export const SESSION_SECRET = env.SESSION_SECRET;

/**
 * Port for HTTP server to listen on.
 */
export const PORT = Number(env.PORT);

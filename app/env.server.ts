import { env } from "node:process";

import { config } from "dotenv";
import invariant from "tiny-invariant";

// Load .env file.
config();

// Ensure that SESSION_SECRET is set.
invariant(env.SESSION_SECRET, "SESSION_SECRET must be set");

export const MODE = env.NODE_ENV;
export const SESSION_SECRET = env.SESSION_SECRET;
export const PORT = Number(env.PORT);

import { env } from "process";

import { config } from "dotenv";
import invariant from "tiny-invariant";

config();

invariant(env.SESSION_SECRET, "SESSION_SECRET must be set");

export const MODE = env.NODE_ENV;
export const SESSION_SECRET = env.SESSION_SECRET;
export const PORT = Number(env.PORT);

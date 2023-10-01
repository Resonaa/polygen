import { env } from "process";

import dotenv from "dotenv";

dotenv.config();

export const MODE = env.NODE_ENV;
export const SESSION_SECRET = env.SESSION_SECRET;
export const PORT = Number(env.PORT);
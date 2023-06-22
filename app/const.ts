import path from "path";
import process from "process";

import dotenv from "dotenv";

dotenv.config();

export const MODE = process.env.NODE_ENV;
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const SSL_CERT = process.env.SSL_CERT;
export const SSL_KEY = process.env.SSL_KEY;

export const CWD = process.cwd();
export const BUILD_DIR = path.join(CWD, "server/build/");
export const USERCONTENT_DIR = path.join(CWD, "usercontent/");
export const ARTICLES_DIR = path.join(CWD, "articles/");

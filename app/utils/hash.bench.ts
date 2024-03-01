import { getRandomValues } from "node:crypto";

import { bench } from "vitest";

import { hash } from "./hash";

const data = new Uint8Array(65536);

const setup = () => {
  getRandomValues(data);
};

bench(
  "fnv1a 32-bit",
  () => {
    hash(data);
  },
  { setup }
);

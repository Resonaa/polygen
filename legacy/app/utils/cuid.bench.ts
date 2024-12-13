import { bench } from "vitest";

import { cuid } from "./cuid";

bench("CUID v2", () => {
  cuid();
});

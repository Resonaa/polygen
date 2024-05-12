import { expect, it } from "vitest";

import { Palette } from "./palette";

it("creates a palette", () => {
  const palette = Palette.colors(20);

  expect(palette).toHaveLength(21);
  expect(palette[0]).toBe(0x808080);
});

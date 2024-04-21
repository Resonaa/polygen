import { expect, it } from "vitest";

import type { Pos } from "./matrix";
import { Matrix } from "./matrix";
import { Patch } from "./patch";

it("creates a patch", () => {
  const pos: Pos = [1, 2],
    item = 0;
  const patch = new Patch(pos, item);

  expect(patch.pos).toBe(pos);
  expect(patch.item).toBe(item);
});

it("diffs two matrices", () => {
  const a = Matrix.from([
    [0, 0, 0],
    [0, 1, 0],
    [0, 1, 0]
  ]);

  const b = Matrix.from([
    [0, 0, 0],
    [0, 1, 0],
    [0, 2, 3]
  ]);

  const aDiffB = [
    [[2, 1], 2],
    [[2, 2], 3]
  ];

  const bDiffA = [
    [[2, 1], 1],
    [[2, 2], 0]
  ];

  expect(a.diff(b)).toEqual(aDiffB);
  expect(b.diff(a)).toEqual(bDiffA);
});

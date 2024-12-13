import { expect, it, describe } from "vitest";

import { Gm } from "./gm";
import type { Land } from "./land";

it("creates a gm", () => {
  const gm = Gm.empty(Gm.Mode.Hexagon, 2, 1);

  const lands = [
    [
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [0, 0, 0],
      [0, 0, 0]
    ]
  ];

  expect(gm.height).toBe(2);
  expect(gm.width).toBe(1);
  expect(gm.downgrade()).toEqual(lands);
});

it("serializes and parses a gm", () => {
  const gm = Gm.empty(Gm.Mode.Hexagon, 2, 1);

  const lands = [
    [
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [0, 0, 0],
      [0, 0, 0]
    ],
    [
      [0, 0, 0],
      [0, 0, 0]
    ]
  ] as Land[][];

  const json = {
    mode: Gm.Mode.Hexagon,
    lands
  };

  expect(gm.toJSON()).toEqual(json);
  expect(Gm.fromJSON(json)).toEqual(gm);
});

describe("gets neighbours of a pos", () => {
  it("works for Hexagon gm", () => {
    const gm = Gm.empty(Gm.Mode.Hexagon, 3, 3);

    expect(gm.neighbors([1, 1])).toStrictEqual([
      [1, 2],
      [2, 1]
    ]);

    expect(gm.neighbors([1, 2])).toStrictEqual([
      [1, 1],
      [1, 3],
      [2, 3],
      [2, 2],
      [2, 1]
    ]);

    expect(gm.neighbors([2, 2])).toStrictEqual([
      [2, 1],
      [1, 2],
      [2, 3],
      [3, 3],
      [3, 2],
      [3, 1]
    ]);
  });

  it("works for Square gm", () => {
    const gm = Gm.empty(Gm.Mode.Square, 3, 3);

    expect(gm.neighbors([1, 1])).toStrictEqual([
      [2, 1],
      [1, 2]
    ]);

    expect(gm.neighbors([1, 2])).toStrictEqual([
      [1, 1],
      [2, 2],
      [1, 3]
    ]);

    expect(gm.neighbors([2, 2])).toStrictEqual([
      [1, 2],
      [2, 1],
      [3, 2],
      [2, 3]
    ]);
  });

  it("works for Triangle gm", () => {
    const gm = Gm.empty(Gm.Mode.Triangle, 3, 3);

    expect(gm.neighbors([1, 1])).toStrictEqual([
      [2, 1],
      [1, 2]
    ]);

    expect(gm.neighbors([1, 2])).toStrictEqual([
      [1, 1],
      [1, 3]
    ]);

    expect(gm.neighbors([2, 2])).toStrictEqual([
      [3, 2],
      [2, 1],
      [2, 3]
    ]);
  });
});

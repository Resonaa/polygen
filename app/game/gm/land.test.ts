import { expect, it } from "vitest";

import { Land } from "./land";

it("creates a land", () => {
  const land = new Land(1, 2, 3);

  expect(land.color).toBe(1);
  expect(land.type).toBe(2);
  expect(land.amount).toBe(3);
});

it("serializes a land", () => {
  const land = new Land(1, 2, 3);
  const exported = [1, 2, 3];

  expect(JSON.stringify(land)).toBe(JSON.stringify(exported));
});

it("deserializes a land", () => {
  const exported = [1, 2, 3] as const;
  const land = new Land(1, 2, 3);

  expect(Land.from(exported)).toStrictEqual(land);
});

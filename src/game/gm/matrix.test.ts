import { expect, it } from "vitest";

import { Matrix } from "./matrix";

it("creates a matrix", () => {
  const height = 2,
    width = 1;
  const items = [
    [0, 0],
    [0, 0],
    [0, 0]
  ];
  const matrix = Matrix.default(height, width, 0);

  expect(matrix.width).toBe(width);
  expect(matrix.height).toBe(height);
  expect(matrix).toEqual(items);
});

it("serializes a matrix", () => {
  const matrix = Matrix.default(2, 1, 0);
  const items = [
    [0, 0],
    [0, 0],
    [0, 0]
  ];

  expect(JSON.stringify(matrix)).toBe(JSON.stringify(items));
});

it("deserializes a matrix", () => {
  const items = [
    [0, 0],
    [0, 0],
    [0, 0]
  ];
  const matrix = Matrix.default(2, 1, 0);

  expect(Matrix.from(items)).toStrictEqual(matrix);
});

it("gets an item", () => {
  const matrix = Matrix.default(2, 1, 0);

  expect(matrix.get([1, 1])).toStrictEqual(0);
});

it("sets an item", () => {
  const matrix = Matrix.default(2, 2, 0);
  matrix.set([1, 1], 1);
  const items = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ];

  expect(matrix).toEqual(items);
});

it("checks a pos", () => {
  const matrix = Matrix.default(1, 2, 0);

  expect(matrix.check([1, 1])).toBe(true);
  expect(matrix.check([1, 2])).toBe(true);

  expect(matrix.check([1, 3])).toBe(false);
  expect(matrix.check([0, 1])).toBe(false);
  expect(matrix.check([2, 1])).toBe(false);
  expect(matrix.check([1, 0])).toBe(false);
});

it("returns all positions", () => {
  const matrix = Matrix.default(1, 2, 0);
  const positions = [
    [1, 1],
    [1, 2]
  ];

  expect(matrix.positions()).toStrictEqual(positions);
});

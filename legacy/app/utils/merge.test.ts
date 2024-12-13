import { expect, it } from "vitest";

import { merge } from "./merge";

it("overrides existing properties", () => {
  const schema = {
    foo: "foo"
  };

  const input = {
    foo: "bar"
  };

  expect(merge(schema, input)).toStrictEqual(input);
});

it("merges missing properties", () => {
  const schema = {
    foo: "foo"
  };

  const input = {};

  expect(merge(schema, input)).toStrictEqual(schema);
});

it("replaces arrays", () => {
  const schema = {
    arr: [1, 2, 3]
  };

  const input = {
    arr: [3, 4, 5]
  };

  expect(merge(schema, input)).toStrictEqual(input);
});

it("merges nested properties", () => {
  const schema = {
    single: "single",
    nested: {
      foo: "foo",
      moreNested: {
        bar: "bar"
      }
    }
  };

  const input = {
    single: "value",
    nested: {
      foo: "bar"
    }
  };

  const expected = {
    single: "value",
    nested: {
      foo: "bar",
      moreNested: {
        bar: "bar"
      }
    }
  };

  expect(merge(schema, input)).toStrictEqual(expected);
});

import { validateUsername } from "./utils";

test("validateUsername returns false for invalid usernames", () => {
  expect(validateUsername(undefined)).toBe(false);
  expect(validateUsername(null)).toBe(false);
  expect(validateUsername("")).toBe(false);
  expect(validateUsername("this name has 27 characters")).toBe(false);
  expect(validateUsername("!!!")).toBe(false);
});

test("validateUsername returns true for valid usernames", () => {
  expect(validateUsername("161")).toBe(true);
});

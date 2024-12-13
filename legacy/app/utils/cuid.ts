import { init } from "@paralleldrive/cuid2";

export const CUID_LENGTH = 8;

/**
 * Generates a single CUID.
 */
export const cuid = init({
  length: CUID_LENGTH
});

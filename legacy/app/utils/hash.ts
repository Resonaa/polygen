/**
 * Hashes the given data.
 */
export function hash(data: Uint8Array) {
  let hash = 0x811c9dc5;

  data.forEach(i => {
    hash ^= i;
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  });

  return hash >>> 0;
}

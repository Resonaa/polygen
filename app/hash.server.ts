export default function hash(buf: Buffer) {
  let hash = 2166136261;

  for (let i = 0; i < buf.length; ) {
    hash ^= buf[i++];
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(36);
}

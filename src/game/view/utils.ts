import { deepmerge } from "@fastify/deepmerge";
import type { PartialDeep } from "type-fest";

const mergeFn = deepmerge({
  mergeArray: ({ clone }) => {
    return (_, source) => clone(source);
  },
});

export function merge<Schema extends object>(
  from: Schema,
  to: PartialDeep<Schema>,
) {
  return mergeFn(from, to) as Schema;
}

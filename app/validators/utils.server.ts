import type { Params } from "@remix-run/react";
import type { z } from "zod";

function toObject(data: FormData | Params) {
  const object: Record<string, any> = {};

  if (data instanceof FormData) {
    for (const [key, value] of data) {
      object[key] = value;
    }
  } else {
    for (const [key, value] of Object.entries(data)) {
      object[key] = value;
    }
  }

  return object;
}

function mapError<Input>(error: z.typeToFlattenedError<Input>["fieldErrors"]) {
  const res: { [P in keyof Input]?: string } = {};

  for (const key in error) {
    res[key as keyof Input] = error[key as keyof Input]?.at(0);
  }

  return res;
}

function flattenError<Input, Output>(res: z.SafeParseReturnType<Input, Output>) {
  if (res.success) {
    return res;
  } else {
    const error = mapError(res.error.flatten().fieldErrors);
    return { success: false, error } as {
      success: false,
      error: typeof error
    };
  }
}

export function safeParseAndFlatten<T>(schema: z.ZodType<T>, data: FormData | Params) {
  return flattenError(schema.safeParse(toObject(data)));
}

export type ErrorType<F extends (...args: any) => any> = ReturnType<F> extends ({
  success: true
} | {
  success: false,
  error: infer ErrorType
}) ? ErrorType : never;
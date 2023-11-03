import type { Params } from "@remix-run/react";
import type { z } from "zod";

type RawErrorValue = number | boolean | FormDataEntryValue | undefined;

function toObject(data: FormData | Params): Record<string, RawErrorValue> {
  if (data instanceof FormData) {
    return Object.fromEntries(data);
  } else {
    return data;
  }
}

function mapError<Input>(error: z.typeToFlattenedError<Input>["fieldErrors"]) {
  const res: { [P in keyof Input]?: string } = {};

  for (const key in error) {
    res[key as keyof Input] = error[key as keyof Input]?.at(0);
  }

  return res;
}

function flattenError<Input, Output>(
  res: z.SafeParseReturnType<Input, Output>
) {
  if (res.success) {
    return res;
  } else {
    const error = mapError(res.error.flatten().fieldErrors);
    return { success: false, error } as {
      success: false;
      error: typeof error;
    };
  }
}

export function safeParseAndFlatten<T>(
  schema: z.ZodType<T>,
  data: FormData | Params
) {
  return flattenError(schema.safeParse(toObject(data)));
}

export type ErrorType<F extends (arg: FormData) => void> =
  ReturnType<F> extends
    | {
        success: true;
      }
    | {
        success: false;
        error: infer ErrorType;
      }
    ? ErrorType
    : never;

import type { Params } from "@remix-run/react";
import { z } from "zod";

import { safeParseAndFlatten } from "./utils.server";

const ridSchema = z.string().min(1).max(161);

const getRoomSchema = z
  .object({
    rid: ridSchema
  })
  .strict();

export function validateGetRoomParams(params: Params) {
  return safeParseAndFlatten(getRoomSchema, params);
}

import { z } from "zod";

export const sessionSchema = z
  .object({
    username: z.string().optional(),
    captcha: z.string().optional()
  })
  .strict();

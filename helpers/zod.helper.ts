import { ZodError } from "zod";

export function isZodError(err: unknown): err is ZodError {
  return Boolean(
    err && // Ensures err is not null or undefined
    (err instanceof ZodError || (err as ZodError).name === "ZodError"), // Checks instance or name as a fallback
  );
}

import { ApiError } from './api.ts';
import type { ActionResult } from './types.ts';

export function toActionError<I extends string>(intent: I, err: unknown): ActionResult<I> {
  if (err instanceof ApiError) {
    return { ok: false, intent, message: err.message, errors: err.fieldErrors() };
  }
  return {
    ok: false,
    intent,
    message: 'We couldn’t reach Kiddin’. Check your connection and try again.',
    errors: {},
  };
}

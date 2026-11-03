/**
 * Result type used by every service.
 * Services never throw for expected failures (bad input, wrong password);
 * they return `fail(...)` so the presentation layer decides how to show it.
 */
export type Ok<T> = { ok: true; value: T };
export type Fail = { ok: false; error: string; field?: string };
export type Result<T = void> = Ok<T> | Fail;

export function ok<T>(value: T): Ok<T>;
export function ok(): Ok<void>;
export function ok<T>(value?: T): Ok<T | void> {
  return { ok: true, value };
}

export function fail(error: string, field?: string): Fail {
  return { ok: false, error, field };
}

/** Shape returned by server actions to `useActionState`. */
export type ActionState = { ok?: boolean; error?: string; field?: string; message?: string };

export function toActionState(result: Result<unknown>, message?: string): ActionState {
  return result.ok ? { ok: true, message } : { ok: false, error: result.error, field: result.field };
}

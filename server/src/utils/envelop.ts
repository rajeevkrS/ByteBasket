export type APIenvelop<T> = {
  status: "success" | "error";
  data: T | null;
  meta?: Record<string, unknown>;
  errors?: Array<{ message: string; code?: string }>;
};

export function ok<T>(data: T, meta?: Record<string, unknown>): APIenvelop<T> {
  return { status: "success", data, meta };
}

export function fail(message: string, code?: string): APIenvelop<null> {
  return { status: "error", data: null, errors: [{ message, code }] };
}

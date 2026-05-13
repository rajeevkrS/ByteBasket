// Generic Response Type
export type APIenvelop<T> = {
  status: "success" | "error";
  data: T | null;
  meta?: Record<string, unknown>;
  errors?: Array<{ message: string; code?: string }>;
};

// Success Helper Function
export function ok<T>(data: T, meta?: Record<string, unknown>): APIenvelop<T> {
  return { status: "success", data, meta };
}

// Error Helper Function
export function fail(message: string, code?: string): APIenvelop<null> {
  return { status: "error", data: null, errors: [{ message, code }] };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function fail(message: string, code?: string, details?: unknown): ApiError {
  return { success: false, error: { message, code, details } };
}

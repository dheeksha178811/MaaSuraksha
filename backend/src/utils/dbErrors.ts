export interface PgError extends Error {
  code?: string;
  table?: string;
  constraint?: string;
  detail?: string;
}

export function isPgError(error: unknown): error is PgError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502',
} as const;

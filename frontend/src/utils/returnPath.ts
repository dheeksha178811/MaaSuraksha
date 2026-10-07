// Login "return to" support. Only plain in-app paths such as "/q" or
// "/doctor/scan-qr" are accepted: a single leading slash followed by letters,
// digits, "-" and "_" segments. Anything else — absolute URLs, protocol-relative
// "//host", backslashes, queries, fragments — is rejected, so a return path can
// never send the user to another site.
const SAFE_RETURN_PATH = /^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/;

export function getSafeReturnPath(value: unknown): string | null {
  return typeof value === 'string' && value.length <= 100 && SAFE_RETURN_PATH.test(value) ? value : null;
}

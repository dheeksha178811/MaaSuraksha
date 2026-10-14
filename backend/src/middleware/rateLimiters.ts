import rateLimit, { Options } from 'express-rate-limit';

// Per-IP limits for the unauthenticated auth endpoints. Behind a reverse
// proxy, set Express's `trust proxy` so req.ip is the client, not the proxy.
// Limits can be tuned per environment without code changes.
const envInt = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

function limiter(message: string, windowMs: number, limit: number, extra: Partial<Options> = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ success: false, message });
    },
    ...extra,
  });
}

const MIN = 60 * 1000;

// Successful logins are not counted, so a legitimate user is never locked out
// by their own valid sign-ins; only failed attempts (guessing) consume budget.
export const loginRateLimiter = limiter(
  'Too many sign-in attempts. Please wait a few minutes and try again.',
  15 * MIN,
  envInt('RATE_LIMIT_LOGIN_MAX', 10),
  { skipSuccessfulRequests: true }
);

export const registerRateLimiter = limiter(
  'Too many registration attempts. Please try again later.',
  60 * MIN,
  envInt('RATE_LIMIT_REGISTER_MAX', 10)
);

// Shared by forgot-password and reset-password.
export const passwordResetRateLimiter = limiter(
  'Too many password reset attempts. Please wait a few minutes and try again.',
  15 * MIN,
  envInt('RATE_LIMIT_PASSWORD_RESET_MAX', 5)
);

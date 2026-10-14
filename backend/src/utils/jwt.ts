import jwt from 'jsonwebtoken';

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Define it in backend/.env');
  }
  // A short or guessable secret lets anyone forge a token for any user/role.
  // Enforced in production only so existing local .env files keep working.
  if (process.env.NODE_ENV === 'production') {
    if (secret.length < 32 || /^\d+$/.test(secret)) {
      throw new Error('JWT_SECRET is too weak for production: use a random value of at least 32 characters.');
    }
  }
  return secret;
})();

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

export interface TokenPayload {
  userId: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

  if (typeof decoded === 'string') {
    throw new Error('Unexpected token payload.');
  }

  const { userId, role } = decoded as Partial<TokenPayload>;
  if (!userId || !role) {
    throw new Error('Token payload is missing required fields.');
  }

  return { userId, role };
}

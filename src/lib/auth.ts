import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-access-token';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'super-secret-refresh-token';

export const signAccessToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30m' });
};

export const signRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AuthUser } from '../types/express.js';

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): AuthUser => {
  return jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
};

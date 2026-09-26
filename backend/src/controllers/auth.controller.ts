import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export class AuthController {
  static signup = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const result = await AuthService.signup({ name, email, password, role });
    res.status(201).json(result);
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = await AuthService.login({ email, password });
    res.json(result);
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const user = await AuthService.getMe(req.user.id);
    res.json(user);
  });

  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const result = await AuthService.forgotPassword(email);
    res.json(result);
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and newPassword are required.' });
    }
    const result = await AuthService.resetPassword({ email, otp, newPassword });
    res.json(result);
  });
}

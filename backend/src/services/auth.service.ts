import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

export class AuthService {
  static async signup(data: { name: string; email: string; password: string; role?: UserRole }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role || UserRole.WAREHOUSE_STAFF,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.isActive) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new Error('User not found.');
    return user;
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success to avoid email enumeration
      return { message: 'If the email exists, an OTP has been generated.' };
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashPassword(otp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.otpToken.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
      },
    });

    // Return OTP in response for testing/demo purposes
    return {
      message: 'OTP sent successfully.',
      devOtpNotice: `Demo OTP: ${otp} (Expires in 15 mins)`,
    };
  }

  static async resetPassword(data: { email: string; otp: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error('Invalid email or OTP.');

    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new Error('Invalid or expired OTP.');

    const isValid = await comparePassword(data.otp, otpRecord.otpHash);
    if (!isValid) throw new Error('Invalid OTP code.');

    // Mark OTP as used and update password
    const newPasswordHash = await hashPassword(data.newPassword);

    await prisma.$transaction([
      prisma.otpToken.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
    ]);

    return { message: 'Password reset successfully.' };
  }
}

import { apiFetch } from './api';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('stocksense_token', res.token);
    return res;
  }

  static async signup(data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('stocksense_token', res.token);
    return res;
  }

  static async getMe(): Promise<User> {
    return await apiFetch<User>('/auth/me');
  }

  static async forgotPassword(email: string): Promise<{ message: string; devOtpNotice?: string }> {
    return await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    return await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  static logout() {
    localStorage.removeItem('stocksense_token');
  }
}

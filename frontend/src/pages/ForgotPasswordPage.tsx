import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { KeyRound, Mail, Lock, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [devOtpNotice, setDevOtpNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const res = await AuthService.forgotPassword(email);
      setMessage(res.message);
      if (res.devOtpNotice) setDevOtpNotice(res.devOtpNotice);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Failed to request OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const res = await AuthService.resetPassword(email, otp, newPassword);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
      <p className="text-xs text-slate-400 mb-6">
        {step === 'request'
          ? 'Enter your registered email to receive a password reset OTP'
          : 'Enter the OTP sent to your email and your new password'}
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {devOtpNotice && (
        <div className="mb-4 p-3 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-mono font-bold">
          {devOtpNotice}
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stocksense.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 mt-6"
          >
            <KeyRound className="w-4 h-4" />
            <span>{submitting ? 'Sending OTP...' : 'Send OTP Code'}</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 mt-6"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{submitting ? 'Resetting...' : 'Update Password'}</span>
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        Remembered your password?{' '}
        <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

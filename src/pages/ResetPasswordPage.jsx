import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { Eye, EyeOff, Zap, Key } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      showError('Password must be 8+ characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&).');
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      showSuccess('Password reset successful! Please log in.');
      navigate('/auth/login');
    } catch (err) {
      showError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Decorative Panel ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-surface-container-lowest flex-col justify-between p-12">
        <div className="orb-glow w-[500px] h-[500px] bg-orange-500 top-[-150px] left-[-100px]" />
        <div className="orb-glow w-[300px] h-[300px] bg-amber-600 bottom-[0px] right-[-100px]" />

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 bg-primary-container rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-on-primary-container" fill="currentColor" />
          </div>
          <span className="font-bold text-lg text-on-surface">
            Mentor<span className="text-primary-container">OS</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-black text-on-surface">
            Create new password.
          </h2>
          <p className="text-secondary leading-relaxed">
            Please enter your new password below. Make sure it's at least 8 characters long and secure.
          </p>
        </div>

        <p className="text-xs text-secondary relative z-10">
          &copy; {new Date().getFullYear()} MentorOS. All rights reserved.
        </p>
      </div>

      {/* ── Right Form Panel ──────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-16 lg:py-0">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div>
            <div className="lg:hidden mb-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-on-primary-container" fill="currentColor" />
                </div>
                <span className="font-bold text-base text-on-surface">
                  Mentor<span className="text-primary-container">OS</span>
                </span>
              </Link>
            </div>
            <h1 className="text-3xl font-black text-on-surface">Reset password</h1>
            <p className="text-secondary mt-2 text-sm">
              Remembered your password?{' '}
              <Link to="/auth/login" className="text-primary-container font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-4 py-3 pr-11 text-sm text-on-surface transition-all placeholder:text-secondary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-4 py-3 pr-11 text-sm text-on-surface transition-all placeholder:text-secondary/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Reset Password</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

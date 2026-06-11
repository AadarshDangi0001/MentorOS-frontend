import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      showSuccess('Reset instructions sent to your email!');
      setSubmitted(true);
    } catch (err) {
      showError(err.message || 'Failed to request password reset');
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
            Reset your password.
          </h2>
          <p className="text-secondary leading-relaxed">
            Enter your email address and we'll send you a link to reset your password and regain access to your account.
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
            <h1 className="text-3xl font-black text-on-surface">Forgot password?</h1>
            <p className="text-secondary mt-2 text-sm">
              Remember your password?{' '}
              <Link to="/auth/login" className="text-primary-container font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {submitted ? (
            <div className="p-6 border border-emerald-500/20 bg-emerald-950/15 rounded-2xl space-y-4 animate-fade-in">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-on-surface text-base">Check your inbox</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  If an account exists with email <span className="text-on-surface font-semibold">{email}</span>, we've sent instructions to reset your password.
                </p>
              </div>
              <Link
                to="/auth/login"
                className="btn-primary w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-surface-input border border-border-strong rounded-xl px-4 py-3 pl-11 text-sm text-on-surface transition-all placeholder:text-secondary/50"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

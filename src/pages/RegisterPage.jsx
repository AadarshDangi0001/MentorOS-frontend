import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Eye, EyeOff, Zap, ArrowRight, GraduationCap, Briefcase } from 'lucide-react';
import { GOOGLE_AUTH_URL } from '../utils/config';

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'mentor' ? 'mentor' : 'student';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      showError('Password must be 8+ characters with at least 1 uppercase, 1 number, and 1 special character.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/auth/login');
    } catch {
      // toast already shown in context
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'student',
      label: 'I want to learn',
      sublabel: 'Find a mentor',
      icon: GraduationCap,
    },
    {
      id: 'mentor',
      label: 'I want to teach',
      sublabel: 'Become a mentor',
      icon: Briefcase,
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left Decorative Panel ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-surface-container-lowest flex-col justify-between p-12">
        <div className="orb-glow w-[500px] h-[500px] bg-orange-500 top-[-200px] right-[-100px]" />
        <div className="orb-glow w-[300px] h-[300px] bg-amber-600 bottom-[50px] left-[-100px]" />

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 bg-primary-container rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-on-primary-container" fill="currentColor" />
          </div>
          <span className="font-bold text-lg text-on-surface">
            Mentor<span className="text-primary-container">OS</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-on-surface mb-3">
              {role === 'mentor'
                ? 'Share your expertise, earn on your terms.'
                : 'Accelerate your career with expert guidance.'}
            </h2>
            <p className="text-secondary leading-relaxed">
              {role === 'mentor'
                ? 'Set your own hours, packages, and pricing. Join a community of elite engineers helping the next generation.'
                : 'Get 1:1 mentorship from engineers at Google, Meta, Amazon and more. Personalized guidance to fast-track your goals.'}
            </p>
          </div>

          <div className="p-5 border border-border-strong rounded-2xl bg-surface/30 backdrop-blur-sm">
            <p className="text-sm text-secondary italic">
              {role === 'mentor'
                ? '"MentorOS made it incredibly easy to set up my mentoring practice. I earn ₹40k/month helping developers like me."'
                : '"I landed my dream job at a FAANG company after just 4 sessions with my MentorOS mentor."'}
            </p>
            <p className="text-xs text-secondary mt-3 font-semibold">
              {role === 'mentor'
                ? '— Priya R., Sr. Engineer @ Stripe'
                : '— Aditya K., SDE-2 @ Microsoft'}
            </p>
          </div>
        </div>

        <p className="text-xs text-secondary relative z-10">
          &copy; {new Date().getFullYear()} MentorOS. All rights reserved.
        </p>
      </div>

      {/* ── Right Form Panel ──────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-16 lg:py-0">
        <div className="w-full max-w-md space-y-7">
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
            <h1 className="text-3xl font-black text-on-surface">Create your account</h1>
            <p className="text-secondary mt-2 text-sm">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary-container font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3">
            {roles.map(({ id, label, sublabel, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-center ${
                  role === id
                    ? 'border-primary-container bg-primary-container/8 shadow-[0_0_16px_rgba(249,115,22,0.12)]'
                    : 'border-border-strong bg-surface-container hover:border-secondary/50 hover:bg-surface-container-high'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  role === id ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-secondary'
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className={`text-sm font-bold transition-all ${role === id ? 'text-primary-container' : 'text-on-surface'}`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-secondary">{sublabel}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button
            onClick={() => window.location.href = `${GOOGLE_AUTH_URL}?role=${role}`}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border-strong rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold transition-all duration-200 hover:border-secondary/50"
          >
            <GoogleIcon />
            {role === 'mentor' ? 'Sign up as Mentor' : 'Sign up as Student'} with Google
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border-strong" />
            <span className="text-xs text-secondary font-semibold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border-strong" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-surface-input border border-border-strong rounded-xl px-4 py-3 text-sm text-on-surface transition-all placeholder:text-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface-input border border-border-strong rounded-xl px-4 py-3 text-sm text-on-surface transition-all placeholder:text-secondary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Password
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
              <p className="text-[11px] text-secondary mt-1.5">
                Min 8 chars, 1 uppercase, 1 number, 1 special character (@$!%*?&)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create {role === 'mentor' ? 'Mentor' : 'Student'} Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-secondary text-center">
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-on-surface">Terms</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-on-surface">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

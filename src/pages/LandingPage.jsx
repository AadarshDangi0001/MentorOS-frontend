import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MentorScroll from '../components/MentorScroll';
import MentorCard from '../components/MentorCard';
import { ArrowRight, Star, Users, Calendar, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react';

const featuredMentors = [
  {
    name: 'Ananya Gupta',
    role: 'Staff Engineer',
    company: 'Google',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    rating: 4.9,
    reviewsCount: 120,
    skills: ['System Design', 'Career Pivot', 'Java'],
    startingPrice: 1499,
  },
  {
    name: 'David Larsson',
    role: 'Senior Developer',
    company: 'Meta',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    rating: 5.0,
    reviewsCount: 85,
    skills: ['React', 'Web3', 'Node.js'],
    startingPrice: 999,
  },
  {
    name: 'Maya Patel',
    role: 'Product Lead',
    company: 'Amazon',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
    rating: 4.8,
    reviewsCount: 210,
    skills: ['Product Strategy', 'Leadership', 'UI/UX'],
    startingPrice: 2499,
  },
];

const stats = [
  { value: '500+', label: 'Expert Mentors', icon: Users },
  { value: '10k+', label: 'Sessions Held', icon: Calendar },
  { value: '4.9★', label: 'Avg. Rating', icon: Star },
  { value: '98%', label: 'Success Rate', icon: TrendingUp },
];

const steps = [
  {
    number: '01',
    icon: 'search',
    title: 'Browse',
    description: 'Find the perfect mentor by role, company, or area of expertise.',
  },
  {
    number: '02',
    icon: 'event_available',
    title: 'Book',
    description: 'Schedule a 1:1 session at a time that works for both of you.',
  },
  {
    number: '03',
    icon: 'video_call',
    title: 'Grow',
    description: 'Join via video call and get personalized guidance to accelerate your career.',
  },
];

const testimonials = [
  {
    quote: "Within 2 months of mentorship, I landed a Senior role at a FAANG company. Best investment I've ever made.",
    name: 'Rahul M.',
    role: 'Sr. Engineer @ Amazon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop',
  },
  {
    quote: "The mentor I worked with gave me a clear roadmap for transitioning into Product Management. Couldn't have done it without MentorOS.",
    name: 'Priya S.',
    role: 'PM @ Flipkart',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
  },
  {
    quote: "I cracked my dream company's system design interview after just 3 sessions. The structured feedback was invaluable.",
    name: 'Aditya K.',
    role: 'SDE-2 @ Microsoft',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-hidden">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-5 overflow-hidden">
        {/* Background orbs */}
        <div className="orb-glow w-[600px] h-[600px] bg-orange-500 top-[-200px] left-1/2 -translate-x-1/2" />
        <div className="orb-glow w-[300px] h-[300px] bg-orange-600 bottom-[10%] left-[10%] opacity-10" />
        <div className="orb-glow w-[200px] h-[200px] bg-amber-500 bottom-[20%] right-[5%] opacity-10" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/5 text-primary-container text-xs font-semibold mb-8 animate-fade-in">
            <Zap size={12} fill="currentColor" />
            Trusted by 10,000+ developers worldwide
          </div>

          <h1 className="font-black text-5xl sm:text-6xl md:text-7xl text-on-surface tracking-tight leading-[1.05] mb-6">
            Learn from people{' '}
            <br className="hidden sm:block" />
            who've{' '}
            <span className="gradient-text">been there.</span>
          </h1>

          <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            1:1 mentorship sessions with engineers at top companies. Skip the guessing game and accelerate your career with proven experts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/explore')}
              className="btn-primary w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
            >
              Find a Mentor <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/auth/register?role=mentor')}
              className="w-full sm:w-auto border border-border-strong hover:border-primary-container/40 text-on-surface px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/3 transition-all duration-200"
            >
              Become a Mentor
            </button>
          </div>

          {/* Social proof avatars */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop',
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=32&h=32&fit=crop',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop',
              ].map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            <p className="text-sm text-secondary">
              <span className="text-on-surface font-bold">500+</span> mentors ready to help
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="border-y border-border-subtle bg-surface-container-lowest">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon size={20} className="text-primary-container" />
              </div>
              <p className="text-2xl font-black text-on-surface">{value}</p>
              <p className="text-xs text-secondary mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mentor Scroll Ribbon ──────────────────────────────── */}
      <div className="py-12 overflow-hidden">
        <p className="text-center text-xs text-secondary uppercase tracking-widest font-bold mb-8">
          Mentors from leading companies
        </p>
        <MentorScroll />
      </div>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-5 md:px-8 max-w-[1280px] mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <p className="text-xs text-primary-container font-bold uppercase tracking-widest mb-3">Simple & Fast</p>
          <h2 className="text-4xl font-black text-on-surface mb-4">How MentorOS works</h2>
          <p className="text-secondary max-w-md mx-auto">Get started with your first mentor session in under 5 minutes.</p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center group">
              <div className="relative w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mx-auto mb-5 border border-border-strong group-hover:border-primary-container/50 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all duration-300">
                <span className="material-symbols-outlined text-primary-container text-2xl">{step.icon}</span>
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-container text-on-primary-container text-[9px] font-black rounded-full flex items-center justify-center">
                  {step.number.slice(-1)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">{step.title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Mentors ──────────────────────────────────── */}
      <section className="py-24 border-t border-border-subtle bg-surface-container-lowest">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-xs text-primary-container font-bold uppercase tracking-widest mb-2">Top Rated</p>
              <h2 className="text-4xl font-black text-on-surface">Featured Mentors</h2>
              <p className="text-secondary mt-2">Handpicked experts to help you level up.</p>
            </div>
            <Link
              to="/explore"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary-container hover:underline"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMentors.map((mentor, index) => (
              <MentorCard
                key={index}
                {...mentor}
                onBookSession={() => navigate('/explore')}
              />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-container hover:underline"
            >
              View All Mentors <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 px-5 md:px-8 max-w-[1280px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs text-primary-container font-bold uppercase tracking-widest mb-3">Success Stories</p>
          <h2 className="text-4xl font-black text-on-surface">Real results from real mentees</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl glow-hover transition-all duration-300">
              <div className="flex gap-0.5 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-secondary leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-border-strong" />
                <div>
                  <p className="text-sm font-semibold text-on-surface">{t.name}</p>
                  <p className="text-xs text-secondary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-20 px-5 md:px-8 border-t border-border-subtle">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-on-surface mb-4">
            Ready to <span className="gradient-text">level up?</span>
          </h2>
          <p className="text-secondary mb-8">
            Join thousands of developers who've accelerated their careers with personalized 1:1 mentorship.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/explore')}
              className="btn-primary w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
            >
              Find Your Mentor <ArrowRight size={18} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-secondary">
            {['No subscription required', 'Pay per session', 'Cancel anytime'].map(feat => (
              <span key={feat} className="flex items-center gap-1">
                <CheckCircle size={12} className="text-green-500" /> {feat}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

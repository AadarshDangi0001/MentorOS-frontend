import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative text-sm font-medium pb-0.5 transition-all duration-200 ${
        isActive(to)
          ? 'text-primary-container'
          : 'text-secondary hover:text-on-surface'
      }`}
    >
      {children}
      {isActive(to) && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-container rounded-full" />
      )}
    </Link>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-2xl border-b border-border-subtle shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <nav className="flex justify-between items-center w-full px-5 md:px-8 max-w-[1280px] mx-auto h-16">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
        >
          <div className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(249,115,22,0.5)] transition-all duration-300">
            <Zap size={15} className="text-on-primary-container" fill="currentColor" />
          </div>
          <span className="font-bold text-[17px] text-on-surface tracking-tight">
            Mentor<span className="text-primary-container">OS</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/explore">Explore</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          <NavLink to="/how-it-works">How It Works</NavLink>
        </div>

        {/* Right CTA Cluster */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2" ref={userMenuRef}>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=1a0800&bold=true`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-border-strong object-cover"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-on-surface max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-secondary transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container border border-border-strong rounded-xl shadow-2xl shadow-black/50 animate-scale-in overflow-hidden">
                    <div className="p-3 border-b border-border-strong">
                      <p className="text-xs font-semibold text-on-surface truncate">{user.name}</p>
                      <p className="text-[11px] text-secondary truncate">{user.email}</p>
                      <span className="mt-1 inline-block px-2 py-0.5 bg-primary-container/10 border border-primary-container/20 text-primary-container text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-secondary hover:text-on-surface hover:bg-white/5 transition-all"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-secondary hover:text-on-surface hover:bg-white/5 transition-all"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer border-t border-border-strong"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hidden sm:block text-sm font-medium text-secondary hover:text-on-surface transition-all duration-200 px-3 py-2"
              >
                Log In
              </Link>
              <Link
                to="/auth/register"
                className="btn-primary text-sm px-5 py-2.5 rounded-xl font-semibold"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-secondary hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-border-subtle bg-background/95 backdrop-blur-2xl px-5 py-5 space-y-1 animate-slide-down">
          <Link
            to="/explore"
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive('/explore') ? 'text-primary-container bg-primary-container/5' : 'text-secondary hover:text-on-surface hover:bg-white/5'
            }`}
          >
            Explore Mentors
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive('/dashboard') ? 'text-primary-container bg-primary-container/5' : 'text-secondary hover:text-on-surface hover:bg-white/5'
              }`}
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/how-it-works"
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive('/how-it-works') ? 'text-primary-container bg-primary-container/5' : 'text-secondary hover:text-on-surface hover:bg-white/5'
            }`}
          >
            How It Works
          </Link>

          <div className="border-t border-border-strong pt-4 mt-2">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-surface-container rounded-xl">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=1a0800&bold=true`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-border-strong object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{user.name}</p>
                    <p className="text-xs text-secondary capitalize">{user.role}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive('/profile') ? 'text-primary-container bg-primary-container/5' : 'text-secondary hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="w-full text-center text-sm font-medium text-rose-400 py-2.5 rounded-xl bg-rose-950/20 border border-rose-500/10 hover:bg-rose-950/40 cursor-pointer transition-all"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/auth/login"
                  className="block text-center text-sm font-medium text-secondary py-2.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/auth/register"
                  className="block text-center btn-primary text-sm py-2.5 rounded-xl"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

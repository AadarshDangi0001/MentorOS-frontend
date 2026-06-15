import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Import Pages from reorganized folders
import LandingPage from '../pages/landing/LandingPage';
import ExplorePage from '../pages/explore/ExplorePage';
import MentorProfilePage from '../pages/mentor/MentorProfilePage';
import ProfilePage from '../pages/profile/ProfilePage';
import HowItWorksPage from '../pages/how-it-works/HowItWorksPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import GoogleAuthSuccess from '../pages/auth/GoogleAuthSuccess';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AboutPage from '../pages/info/AboutPage';
import BlogPage from '../pages/info/BlogPage';
import CareersPage from '../pages/info/CareersPage';
import PrivacyPage from '../pages/info/PrivacyPage';
import TermsPage from '../pages/info/TermsPage';
import CookiesPage from '../pages/info/CookiesPage';

// Import Components
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// Routes that have their own full-screen layout (no navbar/footer)
const FULLSCREEN_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/google/success',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/reset-password'
];

export default function AppRoutes() {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some(r => location.pathname.startsWith(r));

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      {!isFullscreen && <Navbar />}

      <main className={`flex-grow ${!isFullscreen ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/mentor/:mentorId" element={<MentorProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
        </Routes>
      </main>

      {!isFullscreen && <Footer />}
    </div>
  );
}

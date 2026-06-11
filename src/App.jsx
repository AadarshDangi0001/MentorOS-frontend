import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import MentorProfilePage from './pages/MentorProfilePage';
import ProfilePage from './pages/ProfilePage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';


// Routes that have their own full-screen layout (no navbar/footer)
const FULLSCREEN_ROUTES = ['/auth/login', '/auth/register', '/auth/google/success', '/auth/forgot-password', '/auth/reset-password', '/reset-password'];

function AppLayout() {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some(r => location.pathname.startsWith(r));

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
        </Routes>
      </main>

      {!isFullscreen && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;

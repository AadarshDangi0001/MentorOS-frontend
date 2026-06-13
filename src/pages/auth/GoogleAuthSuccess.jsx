import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { Zap } from 'lucide-react';

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      showError(decodeURIComponent(error));
      navigate('/auth/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      const refreshToken = searchParams.get('refreshToken');
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      refreshProfile()
        .then(() => {
          showSuccess('Welcome to MentorOS! Signed in with Google successfully.');
          navigate('/dashboard');
        })
        .catch(() => {
          showError('Failed to load your profile. Please try logging in again.');
          navigate('/auth/login');
        });
    } else {
      showError('Authentication failed. No token received.');
      navigate('/auth/login');
    }
  }, [navigate, refreshProfile, searchParams, showError, showSuccess]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6">
      {/* Orbs */}
      <div className="orb-glow w-64 h-64 bg-orange-500 top-1/4 left-1/3" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-pulse">
            <Zap size={28} className="text-on-primary-container" fill="currentColor" />
          </div>
          {/* Spinning ring */}
          <div className="absolute -inset-2 border-2 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-black text-on-surface mb-1">
            Signing you in with Google
          </h1>
          <p className="text-sm text-secondary">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
}

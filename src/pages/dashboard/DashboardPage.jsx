import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import {
  Calendar, Clock, Award, User as UserIcon, AlertCircle, Zap, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Tab Components
import BookingsTab from '../../components/dashboard/BookingsTab';
import PackagesTab from '../../components/dashboard/PackagesTab';
import AvailabilityTab from '../../components/dashboard/AvailabilityTab';
import EarningsTab from '../../components/dashboard/EarningsTab';
import AdminStatsTab from '../../components/admin/AdminStatsTab';
import AdminUsersTab from '../../components/admin/AdminUsersTab';
import AdminMentorsTab from '../../components/admin/AdminMentorsTab';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showError, showWarning, showInfo } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role === 'admin' || u.role === 'super_admin') {
          return 'admin-stats';
        }
      } catch {
        // ignore
      }
    }
    return 'bookings';
  });

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [mentorProfile, setMentorProfile] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    if (!user.isEmailVerified) {
      setBookings([]);
      setLoadingBookings(false);
      return;
    }
    if (user.role !== 'student' && user.role !== 'mentor') {
      setBookings([]);
      setLoadingBookings(false);
      return;
    }
    try {
      setLoadingBookings(true);
      const res = user.role === 'mentor'
        ? await api.bookings.getMentorBookings()
        : await api.bookings.getStudentBookings();
      setBookings(res.data?.bookings || res.data || []);
    } catch (err) {
      const isForbidden = err && (
        String(err.message || '').includes('403') ||
        String(err.message || '').toLowerCase().includes('forbidden') ||
        String(err.message || '').toLowerCase().includes('verify')
      );
      if (!isForbidden) {
        showError('Failed to load bookings');
      }
    } finally {
      setLoadingBookings(false);
    }
  }, [user, showError]);

  const fetchMentorProfile = useCallback(async () => {
    try {
      const res = await api.mentor.getProfile();
      setMentorProfile(res.data?.mentor || res.data || null);
    } catch {
      // No profile yet
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      if (!activeTab.startsWith('admin-')) {
        Promise.resolve().then(() => {
          setActiveTab('admin-stats');
        });
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) {
      showInfo('Please log in to view your dashboard');
      navigate('/auth/login');
      return;
    }
    if (!user.isEmailVerified) {
      showWarning('Your email address is not verified. Please check your inbox.');
    }
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchBookings();
        if (user.role === 'mentor') {
          fetchMentorProfile();
        }
      }
    });
    return () => { active = false; };
  }, [user, navigate, fetchBookings, fetchMentorProfile, showInfo, showWarning]);

  if (!user) return null;

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  const tabConfig = isAdmin
    ? [
        { id: 'admin-stats', label: 'System Stats', icon: Zap },
        { id: 'admin-users', label: 'Manage Users', icon: UserIcon },
        { id: 'admin-mentors', label: 'Manage Mentors', icon: Award },
      ]
    : [
        { id: 'bookings', label: 'Booked Sessions', icon: Calendar },
        ...(user.role === 'mentor' ? [
          { id: 'earnings', label: 'Earnings', icon: DollarSign },
          { id: 'packages', label: 'Packages', icon: Award },
          { id: 'availability', label: 'Availability', icon: Clock },
        ] : []),
      ];

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-10 pb-16 min-h-screen">
      {/* Unverified Email Banner */}
      {!user.isEmailVerified && (
        <div className="mb-6 p-4 border border-amber-500/20 bg-amber-950/15 rounded-2xl flex items-start gap-3 text-amber-300 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Email Verification Required: </span>
            Please check your inbox for the verification link. Unverified accounts cannot book sessions.
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="relative overflow-hidden p-6 md:p-8 border border-border-strong rounded-2xl bg-surface-container-lowest mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative flex-shrink-0">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=1a0800&bold=true&size=96`}
              alt={user.name}
              className="w-20 h-20 rounded-2xl border-2 border-primary-container/30 object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
          </div>
          <div className="flex-grow text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
              <h1 className="text-2xl font-black text-on-surface">{user.name}</h1>
              <span className="px-2.5 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container text-[10px] font-black uppercase tracking-wider rounded-full">
                {user.role}
              </span>
            </div>
            <p className="text-sm text-secondary">{user.email}</p>
            {user.role === 'mentor' && mentorProfile && (
              <p className="text-sm text-secondary mt-1">
                {mentorProfile.currentRole && <span>{mentorProfile.currentRole}</span>}
                {mentorProfile.company && <span className="text-on-surface font-semibold"> @ {mentorProfile.company}</span>}
                {mentorProfile.experience && <span className="text-secondary"> · {mentorProfile.experience} yrs exp</span>}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          {!isAdmin && (
            <div className="flex gap-6 sm:flex-col sm:gap-3 sm:text-right flex-shrink-0">
              <div>
                <p className="text-2xl font-black text-on-surface">{bookings.length}</p>
                <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">Total Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-black text-primary-container">{upcomingBookings.length}</p>
                <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">Upcoming</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid md:grid-cols-4 gap-7">
        {/* Sidebar Navigation */}
        <aside className="md:col-span-1">
          <div className="sticky top-24 space-y-1.5">
            {tabConfig.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  activeTab === id
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'text-secondary hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Panel */}
        <main className="md:col-span-3">
          {/* TAB: System Stats */}
          {activeTab === 'admin-stats' && <AdminStatsTab />}

          {/* TAB: Manage Users */}
          {activeTab === 'admin-users' && <AdminUsersTab currentUser={user} />}

          {/* TAB: Manage Mentors */}
          {activeTab === 'admin-mentors' && <AdminMentorsTab />}

          {/* TAB: Bookings */}
          {activeTab === 'bookings' && (
            <BookingsTab
              user={user}
              bookings={bookings}
              loadingBookings={loadingBookings}
              fetchBookings={fetchBookings}
            />
          )}

          {/* TAB: Earnings */}
          {activeTab === 'earnings' && user.role === 'mentor' && (
            <EarningsTab user={user} bookings={bookings} />
          )}

          {/* TAB: Packages */}
          {activeTab === 'packages' && user.role === 'mentor' && (
            <PackagesTab user={user} />
          )}

          {/* TAB: Availability */}
          {activeTab === 'availability' && user.role === 'mentor' && (
            <AvailabilityTab user={user} />
          )}
        </main>
      </div>
    </div>
  );
}

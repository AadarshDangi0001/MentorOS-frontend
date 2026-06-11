import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import {
  Calendar, Clock, ExternalLink, Plus, Trash2, Edit, Award,
  User as UserIcon, Check, AlertCircle, BookOpen, Zap, X, AlertTriangle,
  DollarSign, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Inline Confirmation Dialog ─────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border-strong rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-rose-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-on-surface mb-1">Confirm Action</h3>
            <p className="text-sm text-secondary">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border-strong hover:bg-white/5 text-secondary text-sm rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Loader ────────────────────────────────────────
const SkeletonRow = () => (
  <div className="p-5 border border-border-strong bg-surface-container-lowest rounded-xl space-y-3">
    <div className="flex gap-2">
      <div className="skeleton h-5 w-20 rounded-full" />
      <div className="skeleton h-5 w-32 rounded-full" />
    </div>
    <div className="skeleton h-5 w-48 rounded-lg" />
    <div className="flex gap-4">
      <div className="skeleton h-4 w-28 rounded-lg" />
      <div className="skeleton h-4 w-24 rounded-lg" />
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, updateProfileState } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role === 'admin' || u.role === 'super_admin') {
          return 'admin-stats';
        }
      } catch (e) {}
    }
    return 'bookings';
  });
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

  // Admin Panel State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [adminUsers, setAdminUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [adminMentors, setAdminMentors] = useState([]);
  const [totalMentors, setTotalMentors] = useState(0);
  const [mentorsPage, setMentorsPage] = useState(1);
  const [loadingMentors, setLoadingMentors] = useState(false);

  const [expandedMentorId, setExpandedMentorId] = useState(null);
  const [isCreatingMentor, setIsCreatingMentor] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    mentorStatus: 'approved',
    isVerified: true,
    expertise: '',
    experience: 0,
    currentRole: '',
    company: '',
    linkedIn: '',
    github: '',
    hourlyRate: 1000,
    languages: 'English',
  });

  // Mentor Profile State
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Packages State
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageTitle, setPackageTitle] = useState('');
  const [packageDuration, setPackageDuration] = useState(60);
  const [packagePrice, setPackagePrice] = useState(1000);
  const [packageDesc, setPackageDesc] = useState('');

  // Availability State
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:00');
  const [addingSlot, setAddingSlot] = useState(false);

  // Reschedule / Cancel actions
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

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
  }, [user]);

  const fetchMentorProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await api.mentor.getProfile();
      setMentorProfile(res.data?.mentor || res.data || null);
    } catch {
      // No profile yet
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingPackages(true);
      const res = await api.packages.list(user._id);
      setPackages(res.data?.packages || res.data || []);
    } catch {
      showError('Failed to load packages');
    } finally {
      setLoadingPackages(false);
    }
  }, [user]);

  const fetchSlots = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingSlots(true);
      const res = await api.availability.list(user._id, false);
      setSlots(res.data?.slots || res.data || []);
    } catch {
      showError('Failed to load availability slots');
    } finally {
      setLoadingSlots(false);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await api.admin.getStats();
      setStats(res.data || res);
    } catch (err) {
      showError('Failed to fetch stats: ' + (err.message || ''));
    } finally {
      setLoadingStats(false);
    }
  }, [showError]);

  const fetchAdminUsers = useCallback(async (page = 1) => {
    try {
      setLoadingUsers(true);
      const res = await api.admin.listUsers(page, 10);
      setAdminUsers(res.data?.users || res.users || []);
      setTotalUsers(res.data?.total || res.total || 0);
    } catch (err) {
      showError('Failed to fetch users: ' + (err.message || ''));
    } finally {
      setLoadingUsers(false);
    }
  }, [showError]);

  const fetchAdminMentors = useCallback(async (page = 1) => {
    try {
      setLoadingMentors(true);
      const res = await api.admin.listMentors(page, 10);
      setAdminMentors(res.data?.mentors || res.mentors || []);
      setTotalMentors(res.data?.total || res.total || 0);
    } catch (err) {
      showError('Failed to fetch mentors: ' + (err.message || ''));
    } finally {
      setLoadingMentors(false);
    }
  }, [showError]);

  const handleBlockUser = async (id) => {
    confirmAction('Are you sure you want to block this user? They will not be able to log in.', async () => {
      setConfirmDialog(null);
      try {
        await api.admin.blockUser(id);
        showSuccess('User blocked successfully');
        fetchAdminUsers(usersPage);
      } catch (err) {
        showError(err.message || 'Failed to block user');
      }
    });
  };

  const handleUnblockUser = async (id, targetRole = 'student') => {
    try {
      await api.admin.unblockUser(id, targetRole);
      showSuccess('User unblocked successfully');
      fetchAdminUsers(usersPage);
    } catch (err) {
      showError(err.message || 'Failed to unblock user');
    }
  };

  const handleDeleteUser = async (id) => {
    confirmAction('Are you sure you want to delete this user? This is permanent.', async () => {
      setConfirmDialog(null);
      try {
        await api.admin.deleteUser(id);
        showSuccess('User deleted successfully');
        fetchAdminUsers(usersPage);
      } catch (err) {
        showError(err.message || 'Failed to delete user');
      }
    });
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await api.admin.changeRole(id, newRole);
      showSuccess(`Role changed to ${newRole}`);
      fetchAdminUsers(usersPage);
    } catch (err) {
      showError(err.message || 'Failed to change role');
    }
  };

  const handleApproveMentor = async (userId) => {
    try {
      await api.admin.approveMentor(userId);
      showSuccess('Mentor application approved');
      fetchAdminMentors(mentorsPage);
    } catch (err) {
      showError(err.message || 'Failed to approve mentor');
    }
  };

  const handleRejectMentor = async (userId) => {
    try {
      await api.admin.rejectMentor(userId);
      showWarning('Mentor application rejected');
      fetchAdminMentors(mentorsPage);
    } catch (err) {
      showError(err.message || 'Failed to reject mentor');
    }
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...createForm,
        expertise: createForm.expertise.split(',').map(s => s.trim()).filter(Boolean),
        languages: createForm.languages.split(',').map(s => s.trim()).filter(Boolean),
        experience: Number(createForm.experience),
        hourlyRate: Number(createForm.hourlyRate),
      };

      const res = await api.admin.createMentor(payload);
      if (res.success) {
        showSuccess('Mentor profile created successfully!');
        setIsCreatingMentor(false);
        setCreateForm({
          name: '',
          email: '',
          password: '',
          mentorStatus: 'approved',
          isVerified: true,
          expertise: '',
          experience: 0,
          currentRole: '',
          company: '',
          linkedIn: '',
          github: '',
          hourlyRate: 1000,
          languages: 'English',
        });
        fetchAdminMentors(mentorsPage);
      }
    } catch (err) {
      showError(err.message || 'Failed to create mentor profile');
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      if (!activeTab.startsWith('admin-')) {
        setActiveTab('admin-stats');
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (isAdmin) {
      if (activeTab === 'admin-stats') {
        fetchStats();
      } else if (activeTab === 'admin-users') {
        fetchAdminUsers(usersPage);
      } else if (activeTab === 'admin-mentors') {
        fetchAdminMentors(mentorsPage);
      }
    }
  }, [user, activeTab, usersPage, mentorsPage, fetchStats, fetchAdminUsers, fetchAdminMentors]);

  useEffect(() => {
    if (!user) {
      showInfo('Please log in to view your dashboard');
      navigate('/auth/login');
      return;
    }
    if (!user.isEmailVerified) {
      showWarning('Your email address is not verified. Please check your inbox.');
    }
    fetchBookings();
    if (user.role === 'mentor') {
      fetchMentorProfile();
      fetchPackages();
      fetchSlots();
    }
  }, [user, navigate]);

  const confirmAction = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  };

  // ── Reschedule & Cancellation Operations ──────────────────
  const handleOpenRescheduleModal = async (bookingId) => {
    setRescheduleBookingId(bookingId);
    setRescheduleReason('');
    setRescheduleSlotId('');
    try {
      setLoadingRescheduleSlots(true);
      const res = await api.availability.list(user._id, true);
      setRescheduleSlots(res.data?.slots || res.data || []);
    } catch {
      showError('Failed to load availability slots');
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleRequestReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleSlotId) {
      showError('Please select a new availability slot');
      return;
    }
    try {
      const res = await api.bookings.requestReschedule(
        rescheduleBookingId,
        rescheduleReason,
        rescheduleSlotId
      );
      if (res.success) {
        showSuccess('Reschedule request sent to the student!');
        setRescheduleBookingId(null);
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to request reschedule');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await api.bookings.cancel(bookingId);
      if (res.success) {
        showSuccess('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to cancel booking');
    }
  };

  const handleAcceptReschedule = async (bookingId) => {
    try {
      const res = await api.bookings.acceptReschedule(bookingId);
      if (res.success) {
        showSuccess('Reschedule accepted! The session is updated.');
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to accept reschedule');
    }
  };

  const handleRejectReschedule = async (bookingId) => {
    try {
      const res = await api.bookings.rejectReschedule(bookingId);
      if (res.success) {
        showWarning('Reschedule request rejected. Original booking time restored.');
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to reject reschedule');
    }
  };

  // ── Package Operations ────────────────────────────────────
  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        const res = await api.packages.update(editingPackage._id, packageTitle, packageDuration, packagePrice, packageDesc);
        if (res.success) { showSuccess('Package updated!'); setEditingPackage(null); }
      } else {
        const res = await api.packages.create(packageTitle, packageDuration, packagePrice, packageDesc);
        if (res.success) { showSuccess('Package created!'); setIsAddingPackage(false); }
      }
      setPackageTitle(''); setPackageDuration(60); setPackagePrice(1000); setPackageDesc('');
      fetchPackages();
    } catch (err) {
      showError(err.message || 'Failed to save package');
    }
  };

  const handleDeletePackage = (id) => {
    confirmAction('Are you sure you want to delete this package? This cannot be undone.', async () => {
      setConfirmDialog(null);
      try {
        await api.packages.delete(id);
        showSuccess('Package deleted');
        fetchPackages();
      } catch (err) {
        showError(err.message || 'Failed to delete package');
      }
    });
  };

  // ── Availability Operations ───────────────────────────────
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlotDate) { showError('Please select a date'); return; }
    try {
      setAddingSlot(true);
      const startTime = new Date(`${newSlotDate}T${newSlotStart}:00`);
      const endTime = new Date(`${newSlotDate}T${newSlotEnd}:00`);
      if (endTime <= startTime) { showError('End time must be after start time'); return; }

      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      if (startTime > oneMonthFromNow) {
        showError('You can only create availability slots within 1 month from now');
        return;
      }

      await api.availability.create(startTime.toISOString(), endTime.toISOString());
      showSuccess('Availability slot added!');
      setNewSlotDate('');
      fetchSlots();
    } catch (err) {
      showError(err.message || 'Failed to add slot (possible overlap)');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = (id) => {
    confirmAction('Delete this availability slot?', async () => {
      setConfirmDialog(null);
      try {
        await api.availability.delete(id);
        showSuccess('Slot deleted');
        fetchSlots();
      } catch (err) {
        showError(err.message || 'Failed to delete slot');
      }
    });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const calculateEndTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + 60, 0, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

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

  const InputField = ({ label, name, type = 'text', defaultValue, placeholder, required, min, max }) => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all"
      />
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-24 pb-16 min-h-screen">
      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

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
          {/* ── TAB: System Stats ── */}
          {activeTab === 'admin-stats' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-on-surface">System Statistics</h2>
              {loadingStats ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stats ? (
                <>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">Total Users</p>
                        <UserIcon className="w-4 h-4 text-primary-container" />
                      </div>
                      <p className="text-3xl font-black text-on-surface">
                        {stats.users?.total || 0}
                      </p>
                    </div>
                    <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">Total Bookings</p>
                        <Calendar className="w-4 h-4 text-primary-container" />
                      </div>
                      <p className="text-3xl font-black text-on-surface">
                        {stats.bookings?.total || 0}
                      </p>
                    </div>
                    <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">Total Revenue</p>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-3xl font-black text-emerald-400">
                        ₹{Number(stats.payments?.revenueINR || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="border border-border-strong rounded-2xl bg-surface-container-lowest p-6">
                    <h3 className="text-sm font-bold text-on-surface mb-4">User Roles Distribution</h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(stats.users?.roles || {}).map(([roleName, count]) => (
                        <div key={roleName} className="p-4 border border-border-strong/50 rounded-xl bg-black/10 flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase font-bold text-secondary tracking-wide">{roleName.replace('_', ' ')}</span>
                            <p className="text-lg font-black text-on-surface mt-1">{count}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            roleName === 'super_admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                            roleName === 'admin' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            roleName === 'mentor' ? 'bg-primary-container/10 border-primary-container/20 text-primary-container' :
                            roleName === 'student' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {roleName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-secondary">No statistics available.</div>
              )}
            </div>
          )}

          {/* ── TAB: Manage Users ── */}
          {activeTab === 'admin-users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-on-surface">Manage Users</h2>
                <span className="text-xs text-secondary">{totalUsers} total users</span>
              </div>

              {loadingUsers ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                </div>
              ) : adminUsers.length > 0 ? (
                <div className="space-y-4">
                  <div className="border border-border-strong rounded-2xl bg-surface-container-lowest overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border-strong bg-white/3 text-secondary font-bold uppercase tracking-wider">
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-strong">
                          {adminUsers.map((u) => {
                            const isUserBlocked = u.role === 'blocked' || u.status === 'suspended';
                            const isUserDeleted = u.role === 'deleted' || u.status === 'inactive';
                            const canChangeRole = user.role === 'super_admin' && u._id !== user._id;

                            return (
                              <tr key={u._id} className="hover:bg-white/3 transition-colors">
                                <td className="p-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f97316&color=1a0800&bold=true&size=32`}
                                      alt=""
                                      className="w-8 h-8 rounded-xl object-cover border border-border-strong"
                                    />
                                    <div>
                                      <div className="font-semibold text-on-surface text-sm">{u.name}</div>
                                      <div className="text-secondary text-[11px]">{u.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  {canChangeRole ? (
                                    <select
                                      value={u.role}
                                      onChange={(e) => handleChangeRole(u._id, e.target.value)}
                                      className="bg-surface border border-border-strong rounded-lg px-2 py-1 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                                    >
                                      <option value="student">student</option>
                                      <option value="mentor">mentor</option>
                                      <option value="admin">admin</option>
                                      {user.role === 'super_admin' && (
                                        <option value="super_admin">super_admin</option>
                                      )}
                                      <option value="blocked">blocked</option>
                                      <option value="deleted">deleted</option>
                                    </select>
                                  ) : (
                                    <span className="font-semibold text-on-surface">{u.role}</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                    isUserBlocked ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                    isUserDeleted ? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400' :
                                    u.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                  }`}>
                                    {u.status}
                                  </span>
                                </td>
                                <td className="p-4 text-secondary whitespace-nowrap">
                                  {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                                  {u._id !== user._id ? (
                                    <>
                                      {isUserBlocked ? (
                                        <button
                                          onClick={() => handleUnblockUser(u._id)}
                                          className="px-2.5 py-1.5 bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/40 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                        >
                                          Unblock
                                        </button>
                                      ) : (
                                        !isUserDeleted && (
                                          <button
                                            onClick={() => handleBlockUser(u._id)}
                                            className="px-2.5 py-1.5 bg-rose-600/25 border border-rose-500/30 text-rose-400 hover:bg-rose-600/40 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                          >
                                            Block
                                          </button>
                                        )
                                      )}
                                      {!isUserDeleted && (
                                        <button
                                          onClick={() => handleDeleteUser(u._id)}
                                          className="p-1.5 border border-border-strong text-secondary hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                                          title="Delete User"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-secondary text-[11px] italic pr-2">You</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalUsers > 10 && (
                    <div className="flex justify-between items-center pt-2">
                      <button
                        disabled={usersPage <= 1}
                        onClick={() => setUsersPage(p => p - 1)}
                        className="px-3 py-1.5 border border-border-strong hover:bg-white/5 text-secondary disabled:opacity-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-secondary">
                        Page {usersPage} of {Math.ceil(totalUsers / 10)}
                      </span>
                      <button
                        disabled={usersPage >= Math.ceil(totalUsers / 10)}
                        onClick={() => setUsersPage(p => p + 1)}
                        className="px-3 py-1.5 border border-border-strong hover:bg-white/5 text-secondary disabled:opacity-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary">No users found.</div>
              )}
            </div>
          )}

          {/* ── TAB: Manage Mentors ── */}
          {activeTab === 'admin-mentors' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-on-surface">Manage Mentors</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-secondary">{totalMentors} total mentors</span>
                  <button
                    onClick={() => setIsCreatingMentor(true)}
                    className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Create Mentor
                  </button>
                </div>
              </div>

              {loadingMentors ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                </div>
              ) : adminMentors.length > 0 ? (
                <div className="space-y-4">
                  <div className="border border-border-strong rounded-2xl bg-surface-container-lowest overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border-strong bg-white/3 text-secondary font-bold uppercase tracking-wider">
                            <th className="p-4">Mentor</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Role & Company</th>
                            <th className="p-4">Rate</th>
                            <th className="p-4 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-strong">
                          {adminMentors.map((m) => {
                            const isExpanded = expandedMentorId === m._id;
                            const u = m.user || {};
                            const mentorStatusColors = {
                              approved: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                              rejected: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                              pending_review: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                            }[m.mentorStatus] || 'bg-white/5 border-border-strong text-secondary';

                            return (
                              <React.Fragment key={m._id}>
                                <tr className="hover:bg-white/3 transition-colors">
                                  <td className="p-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'M')}&background=f97316&color=1a0800&bold=true&size=32`}
                                        alt=""
                                        className="w-8 h-8 rounded-xl object-cover border border-border-strong"
                                      />
                                      <div>
                                        <div className="font-semibold text-on-surface text-sm">{u.name || 'Unknown'}</div>
                                        <div className="text-secondary text-[11px]">{u.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${mentorStatusColors}`}>
                                      {m.mentorStatus?.replace('_', ' ') || 'pending review'}
                                    </span>
                                  </td>
                                  <td className="p-4 whitespace-nowrap text-on-surface">
                                    <span className="font-semibold">{m.currentRole || '—'}</span>
                                    {m.company && <span className="text-secondary"> @ {m.company}</span>}
                                  </td>
                                  <td className="p-4 whitespace-nowrap font-semibold text-primary-container">
                                    ₹{Number(m.hourlyRate || 0).toLocaleString('en-IN')}/hr
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => setExpandedMentorId(isExpanded ? null : m._id)}
                                      className="p-1.5 border border-border-strong text-secondary hover:text-on-surface hover:bg-white/5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center gap-1 text-[11px]"
                                    >
                                      {isExpanded ? 'Hide' : 'Review'}
                                      <ChevronDown size={12} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                  </td>
                                </tr>

                                {isExpanded && (
                                  <tr>
                                    <td colSpan="5" className="p-5 bg-black/20 border-t border-border-strong">
                                      <div className="grid md:grid-cols-2 gap-6 text-xs text-secondary animate-fade-in">
                                        <div className="space-y-3">
                                          <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Expertise</span>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                              {m.expertise && m.expertise.length > 0 ? (
                                                m.expertise.map((exp, idx) => (
                                                  <span key={idx} className="bg-white/5 border border-border-strong text-on-surface px-2 py-0.5 rounded-md text-[10px]">
                                                    {exp}
                                                  </span>
                                                ))
                                              ) : (
                                                <span>No expertise tags provided</span>
                                              )}
                                            </div>
                                          </div>
                                          {u.bio && (
                                            <div>
                                              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Bio</span>
                                              <p className="mt-1 text-on-surface leading-relaxed text-sm bg-black/10 p-3 rounded-xl border border-border-strong/50">{u.bio}</p>
                                            </div>
                                          )}
                                          <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Experience</span>
                                            <p className="text-sm font-semibold text-on-surface mt-0.5">{m.experience} Years</p>
                                          </div>
                                        </div>

                                        <div className="space-y-3">
                                          <div className="flex gap-4">
                                            {m.linkedIn && (
                                              <div>
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block">LinkedIn</span>
                                                <a href={m.linkedIn} target="_blank" rel="noreferrer" className="text-primary-container hover:underline inline-flex items-center gap-1 mt-1 font-semibold">
                                                  View Profile <ExternalLink size={11} />
                                                </a>
                                              </div>
                                            )}
                                            {m.github && (
                                              <div>
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block">GitHub</span>
                                                <a href={m.github} target="_blank" rel="noreferrer" className="text-primary-container hover:underline inline-flex items-center gap-1 mt-1 font-semibold">
                                                  View Profile <ExternalLink size={11} />
                                                </a>
                                              </div>
                                            )}
                                          </div>

                                          {m.documents && m.documents.length > 0 && (
                                            <div>
                                              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Submitted Documents / Resumes</span>
                                              <div className="space-y-1 mt-1.5">
                                                {m.documents.map((doc, idx) => (
                                                  <a key={idx} href={doc} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary-container hover:underline text-left">
                                                    <BookOpen size={12} /> Document #{idx + 1}
                                                  </a>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <div className="pt-4 border-t border-border-strong/50 flex gap-3">
                                            {m.mentorStatus !== 'approved' && (
                                              <button
                                                onClick={() => handleApproveMentor(u._id)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                              >
                                                <Check size={14} /> Approve Profile
                                              </button>
                                            )}
                                            {m.mentorStatus !== 'rejected' && (
                                              <button
                                                onClick={() => handleRejectMentor(u._id)}
                                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                              >
                                                <X size={14} /> Reject Profile
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalMentors > 10 && (
                    <div className="flex justify-between items-center pt-2">
                      <button
                        disabled={mentorsPage <= 1}
                        onClick={() => setMentorsPage(p => p - 1)}
                        className="px-3 py-1.5 border border-border-strong hover:bg-white/5 text-secondary disabled:opacity-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-secondary">
                        Page {mentorsPage} of {Math.ceil(totalMentors / 10)}
                      </span>
                      <button
                        disabled={mentorsPage >= Math.ceil(totalMentors / 10)}
                        onClick={() => setMentorsPage(p => p + 1)}
                        className="px-3 py-1.5 border border-border-strong hover:bg-white/5 text-secondary disabled:opacity-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary">No mentors found.</div>
              )}
            </div>
          )}

          {/* ── TAB: Bookings ── */}
          {activeTab === 'bookings' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-on-surface">
                {user.role === 'mentor' ? 'Your Booked Sessions' : 'Upcoming & Past Sessions'}
              </h2>
              {loadingBookings ? (
                <div className="space-y-4">
                  <SkeletonRow /><SkeletonRow /><SkeletonRow />
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const counterparty = user.role === 'mentor' ? booking.student : booking.mentor;
                    const meetingLink = booking.meeting?.meetingLink;
                    const statusConfig = {
                      confirmed: { cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
                      completed: { cls: 'bg-sky-500/10 border-sky-500/20 text-sky-400', dot: 'bg-sky-400' },
                      pending:   { cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
                      reschedule_requested: { cls: 'bg-purple-500/10 border-purple-500/20 text-purple-400', dot: 'bg-purple-400' },
                      rescheduled: { cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400', dot: 'bg-blue-400' },
                      cancelled: { cls: 'bg-rose-500/10 border-rose-500/20 text-rose-400', dot: 'bg-rose-400' },
                    }[booking.status] || { cls: 'bg-white/5 border-border-strong text-secondary', dot: 'bg-secondary' };

                    const isConfirmedOrRescheduled = ['confirmed', 'rescheduled'].includes(booking.status);

                    return (
                      <div key={booking._id} className="p-5 border border-border-strong bg-surface-container-lowest rounded-2xl flex flex-col hover:border-border-strong/80 transition-all space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                {booking.status.replace('_', ' ')}
                              </span>
                              {booking.package?.title && (
                                <span className="text-xs text-secondary">{booking.package.title}</span>
                              )}
                            </div>

                            <h3 className="font-bold text-on-surface">
                              Session with {counterparty?.name || 'User'}
                            </h3>

                            <div className="flex flex-wrap gap-4 text-xs text-secondary">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-primary-container" />
                                {formatDate(booking.scheduledAt)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={13} className="text-primary-container" />
                                {formatTime(booking.scheduledAt)} · {booking.duration}m
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2.5 items-center">
                            {isConfirmedOrRescheduled && meetingLink && (
                              <a
                                href={meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                              >
                                Join Call <ExternalLink size={13} />
                              </a>
                            )}
                            
                            {isConfirmedOrRescheduled && user.role === 'mentor' && (
                              <>
                                <button
                                  onClick={() => handleOpenRescheduleModal(booking._id)}
                                  className="px-4 py-2.5 border border-border-strong hover:bg-white/5 text-secondary hover:text-on-surface text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => confirmAction('Are you sure you want to cancel this booking? This cannot be undone and will free the availability slot.', () => handleCancelBooking(booking._id))}
                                  className="px-4 py-2.5 border border-rose-500/20 text-rose-400 hover:bg-rose-950/20 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Reschedule Request UI */}
                        {booking.status === 'reschedule_requested' && (
                          <div className="p-4 border border-purple-500/20 bg-purple-950/10 rounded-xl space-y-3">
                            <p className="text-xs text-purple-300">
                              <span className="font-bold">Reschedule Requested:</span>{' '}
                              {user.role === 'student' 
                                ? 'The mentor has requested to reschedule this session.' 
                                : 'You requested to reschedule this session. Pending student approval.'}
                            </p>
                            {booking.rescheduleNewAvailability && (
                              <div className="text-xs text-on-surface bg-black/20 p-2.5 rounded-lg border border-border-strong space-y-1">
                                <span className="text-secondary">Proposed Time:</span>{' '}
                                <span className="font-semibold text-primary-container">
                                  {formatDate(booking.rescheduleNewAvailability.startTime)} at {formatTime(booking.rescheduleNewAvailability.startTime)}
                                </span>
                                {booking.rescheduleReason && (
                                  <p className="mt-1 text-secondary italic">Reason: "{booking.rescheduleReason}"</p>
                                )}
                              </div>
                            )}
                            {user.role === 'student' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptReschedule(booking._id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
                                >
                                  Accept New Time
                                </button>
                                <button
                                  onClick={() => handleRejectReschedule(booking._id)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
                                >
                                  Keep Original Time
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border-strong rounded-2xl text-center">
                  <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-5">
                    <Calendar className="w-7 h-7 text-secondary" />
                  </div>
                  <p className="font-bold text-on-surface text-lg mb-2">No sessions yet</p>
                  <p className="text-secondary text-sm max-w-xs">
                    {user.role === 'student' ? "Book your first mentorship session to get started." : "Students haven't booked sessions with you yet."}
                  </p>
                  {user.role === 'student' && (
                    <button
                      onClick={() => navigate('/explore')}
                      className="mt-5 btn-primary text-sm px-6 py-2.5 rounded-xl"
                    >
                      Find a Mentor
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Packages ── */}
          {activeTab === 'packages' && user.role === 'mentor' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-on-surface">Mentorship Packages</h2>
                {!isAddingPackage && !editingPackage && (
                  <button
                    onClick={() => { setPackageTitle(''); setPackageDuration(60); setPackagePrice(1000); setPackageDesc(''); setIsAddingPackage(true); }}
                    className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Package
                  </button>
                )}
              </div>

              {(isAddingPackage || editingPackage) && (
                <form onSubmit={handleSavePackage} className="p-5 border border-border-strong bg-surface rounded-2xl space-y-4 animate-fade-in">
                  <h3 className="font-bold text-on-surface text-sm">{editingPackage ? 'Edit Package' : 'Create Package'}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Package Title</label>
                      <input type="text" required value={packageTitle} onChange={e => setPackageTitle(e.target.value)}
                        placeholder="e.g. System Design Mock Interview"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Duration (minutes)</label>
                      <input type="number" required min="15" max="180" value={packageDuration}
                        onChange={e => setPackageDuration(Number(e.target.value))}
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Price (INR)</label>
                    <input type="number" required min="0" value={packagePrice}
                      onChange={e => setPackagePrice(Number(e.target.value))}
                      className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Description</label>
                    <textarea rows="3" value={packageDesc} onChange={e => setPackageDesc(e.target.value)}
                      placeholder="What does this session cover?"
                      className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all resize-none" />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => { setIsAddingPackage(false); setEditingPackage(null); }}
                      className="px-4 py-2 border border-border-strong hover:bg-white/5 text-secondary text-xs rounded-xl transition-all cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit"
                      className="btn-primary text-xs px-4 py-2 rounded-xl">
                      Save Package
                    </button>
                  </div>
                </form>
              )}

              {loadingPackages ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                </div>
              ) : packages.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <div key={pkg._id} className="p-5 border border-border-strong bg-surface-container-lowest rounded-2xl flex flex-col justify-between glow-hover transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-on-surface">{pkg.title}</h4>
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-secondary flex items-center gap-1 flex-shrink-0 ml-2">
                            <Clock size={11} /> {pkg.duration}m
                          </span>
                        </div>
                        <p className="text-xs text-secondary line-clamp-3 mb-4">{pkg.description}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-border-strong pt-4">
                        <p className="text-lg font-bold text-primary-container">₹{Number(pkg.price).toLocaleString('en-IN')}</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setEditingPackage(pkg); setPackageTitle(pkg.title); setPackageDuration(pkg.duration); setPackagePrice(pkg.price); setPackageDesc(pkg.description || ''); }}
                            className="p-2 hover:bg-white/5 rounded-xl text-secondary hover:text-on-surface cursor-pointer transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeletePackage(pkg._id)}
                            className="p-2 hover:bg-rose-950/30 rounded-xl text-secondary hover:text-rose-400 cursor-pointer transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface border border-border-strong rounded-2xl">
                  <Award className="w-10 h-10 text-secondary mx-auto mb-3" />
                  <p className="text-sm text-secondary">No packages yet. Create one so students can book you!</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Availability ── */}
          {activeTab === 'availability' && user.role === 'mentor' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-on-surface">Manage Availability</h2>

              <form onSubmit={handleAddSlot} className="p-5 border border-border-strong bg-surface rounded-2xl">
                <h3 className="text-sm font-bold text-on-surface mb-4">Add New Slot</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Date</label>
                    <input type="date" required value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max={(() => {
                        const d = new Date();
                        d.setMonth(d.getMonth() + 1);
                        return d.toISOString().split('T')[0];
                      })()}
                      className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Start Time</label>
                    <input type="time" required value={newSlotStart} onChange={e => {
                      const val = e.target.value;
                      setNewSlotStart(val);
                      setNewSlotEnd(calculateEndTime(val));
                    }}
                      className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">End Time (Auto-calculated)</label>
                    <input type="time" disabled value={newSlotEnd}
                      className="w-full bg-surface-input/50 border border-border-strong rounded-xl px-3 py-2.5 text-sm text-secondary transition-all cursor-not-allowed" />
                  </div>
                </div>
                <div className="mt-4">
                  <button type="submit" disabled={addingSlot}
                    className="btn-primary text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50">
                    {addingSlot ? (
                      <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                    ) : <Plus size={16} />}
                    Add Slot
                  </button>
                </div>
              </form>

              {loadingSlots ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                </div>
              ) : slots.length > 0 ? (
                <div className="border border-border-strong rounded-2xl bg-surface-container-lowest overflow-hidden">
                  <div className="divide-y divide-border-strong">
                    {slots.map((slot) => (
                      <div key={slot._id} className="p-4 flex items-center justify-between hover:bg-white/3 transition-all">
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{formatDate(slot.startTime)}</p>
                          <p className="text-xs text-secondary">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {slot.isBooked ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">
                              Booked
                            </span>
                          ) : (
                            <>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-secondary px-2.5 py-1 rounded-full border border-border-strong">
                                Available
                              </span>
                              <button onClick={() => handleDeleteSlot(slot._id)}
                                className="text-secondary hover:text-rose-400 p-2 rounded-xl hover:bg-rose-950/20 transition-all cursor-pointer">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-surface border border-border-strong rounded-2xl">
                  <Clock className="w-10 h-10 text-secondary mx-auto mb-3" />
                  <p className="text-sm text-secondary">No slots defined. Add slots above so students can book you!</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Earnings ── */}
          {activeTab === 'earnings' && user.role === 'mentor' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-on-surface">Earnings Overview</h2>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-bold mb-2">Lifetime Earnings</p>
                  <p className="text-3xl font-black text-primary-container">
                    ₹{bookings
                      .filter(b => ['confirmed', 'rescheduled', 'completed'].includes(b.status))
                      .reduce((sum, b) => sum + (b.package?.price || 0), 0)
                      .toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest">
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-bold mb-2">Completed Sessions</p>
                  <p className="text-3xl font-black text-on-surface">
                    {bookings.filter(b => b.status === 'completed').length}
                  </p>
                </div>
                <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest">
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-bold mb-2">Active Bookings</p>
                  <p className="text-3xl font-black text-on-surface">
                    {bookings.filter(b => ['confirmed', 'rescheduled'].includes(b.status)).length}
                  </p>
                </div>
              </div>

              <div className="border border-border-strong rounded-2xl bg-surface-container-lowest overflow-hidden">
                <div className="p-5 border-b border-border-strong flex justify-between items-center">
                  <h3 className="text-sm font-bold text-on-surface">Booking History</h3>
                  <span className="text-xs text-secondary">{bookings.length} total sessions</span>
                </div>

                {bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border-strong bg-white/3 text-secondary font-bold uppercase tracking-wider">
                          <th className="p-4">Date & Time</th>
                          <th className="p-4">Student</th>
                          <th className="p-4">Package</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-strong">
                        {bookings.map((b) => (
                          <tr key={b._id} className="hover:bg-white/3 transition-colors">
                            <td className="p-4 whitespace-nowrap">
                              <div className="font-semibold text-on-surface">{formatDate(b.scheduledAt)}</div>
                              <div className="text-[10px] text-secondary">{formatTime(b.scheduledAt)}</div>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <img
                                  src={b.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.student?.name || 'S')}&background=f97316&color=1a0800&bold=true&size=32`}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover border border-border-strong"
                                />
                                <span className="font-semibold text-on-surface">{b.student?.name || 'Student'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-on-surface">{b.package?.title || '—'}</span>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="font-black text-on-surface text-sm">
                                ₹{Number(b.package?.price || 0).toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                {
                                  confirmed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                                  completed: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
                                  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                                  reschedule_requested: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                                  rescheduled: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                                  cancelled: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                                }[b.status] || 'bg-white/5 border-border-strong text-secondary'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-secondary">
                    No bookings found.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reschedule Modal */}
      {rescheduleBookingId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleRequestReschedule} className="bg-surface border border-border-strong rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border-strong">
              <h3 className="font-bold text-on-surface">Reschedule Session</h3>
              <button type="button" onClick={() => setRescheduleBookingId(null)} className="text-secondary hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            {loadingRescheduleSlots ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rescheduleSlots.length > 0 ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Select New Slot</label>
                  <div className="max-h-48 overflow-y-auto border border-border-strong rounded-xl divide-y divide-border-strong">
                    {rescheduleSlots.map(slot => (
                      <label key={slot._id} className="flex items-center gap-3 p-3 hover:bg-white/3 cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="rescheduleSlot"
                          value={slot._id}
                          checked={rescheduleSlotId === slot._id}
                          onChange={() => setRescheduleSlotId(slot._id)}
                          className="accent-primary-container"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-on-surface">{formatDate(slot.startTime)}</p>
                          <p className="text-secondary">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Reason for Rescheduling</label>
                  <textarea
                    rows="2"
                    value={rescheduleReason}
                    onChange={e => setRescheduleReason(e.target.value)}
                    placeholder="Provide a brief explanation for the student..."
                    className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all resize-none focus:outline-none focus:border-primary-container"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleBookingId(null)}
                    className="px-4 py-2 border border-border-strong hover:bg-white/5 text-secondary text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs px-4 py-2 rounded-xl font-semibold"
                  >
                    Send Request
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-xs text-secondary mb-4">No available slots. Create some slots in the 'Availability' tab first.</p>
                <button
                  type="button"
                  onClick={() => {
                    setRescheduleBookingId(null);
                    setActiveTab('availability');
                  }}
                  className="btn-primary text-xs px-4 py-2 rounded-xl"
                >
                  Manage Availability
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Create Mentor Modal */}
      {isCreatingMentor && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <form onSubmit={handleCreateMentor} className="bg-surface border border-border-strong rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-scale-in my-8 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border-strong">
              <h3 className="font-bold text-on-surface text-lg">Create New Mentor Profile</h3>
              <button
                type="button"
                onClick={() => setIsCreatingMentor(false)}
                className="text-secondary hover:text-on-surface cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Verification Status</label>
                <select
                  value={createForm.mentorStatus}
                  onChange={e => setCreateForm(prev => ({ ...prev, mentorStatus: e.target.value, isVerified: e.target.value === 'approved' }))}
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                >
                  <option value="approved">Approved & Verified</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Current Job Title</label>
                <input
                  type="text"
                  value={createForm.currentRole}
                  onChange={e => setCreateForm(prev => ({ ...prev, currentRole: e.target.value }))}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={createForm.company}
                  onChange={e => setCreateForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g. Google"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  value={createForm.experience}
                  onChange={e => setCreateForm(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g. 5"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Hourly Rate (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={createForm.hourlyRate}
                  onChange={e => setCreateForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="e.g. 1500"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Expertise Skills (comma separated)</label>
                <input
                  type="text"
                  value={createForm.expertise}
                  onChange={e => setCreateForm(prev => ({ ...prev, expertise: e.target.value }))}
                  placeholder="e.g. React, Node.js, System Design"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">Languages (comma separated)</label>
                <input
                  type="text"
                  value={createForm.languages}
                  onChange={e => setCreateForm(prev => ({ ...prev, languages: e.target.value }))}
                  placeholder="e.g. English, Hindi"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={createForm.linkedIn}
                  onChange={e => setCreateForm(prev => ({ ...prev, linkedIn: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">GitHub Profile URL</label>
                <input
                  type="url"
                  value={createForm.github}
                  onChange={e => setCreateForm(prev => ({ ...prev, github: e.target.value }))}
                  placeholder="https://github.com/username"
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2 text-xs text-on-surface transition-all focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border-strong/50">
              <button
                type="button"
                onClick={() => setIsCreatingMentor(false)}
                className="px-4 py-2 border border-border-strong hover:bg-white/5 text-secondary text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs px-5 py-2 rounded-xl font-semibold flex items-center gap-1.5"
              >
                Create Mentor Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

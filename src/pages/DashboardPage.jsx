import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import {
  Calendar, Clock, ExternalLink, Plus, Trash2, Edit, Award,
  User as UserIcon, Check, AlertCircle, BookOpen, Zap, X, AlertTriangle
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

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

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

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingBookings(true);
      const res = user.role === 'mentor'
        ? await api.bookings.getMentorBookings()
        : await api.bookings.getStudentBookings();
      setBookings(res.data || []);
    } catch {
      showError('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  }, [user]);

  const fetchMentorProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await api.mentor.getProfile();
      setMentorProfile(res.data || null);
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

  // ── Profile Operations ────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profileData = {
      expertise: (formData.get('expertise') || '').split(',').map(s => s.trim()).filter(Boolean),
      experience: Number(formData.get('experience') || 0),
      currentRole: formData.get('currentRole'),
      company: formData.get('company'),
      linkedIn: formData.get('linkedIn'),
      github: formData.get('github'),
      hourlyRate: Number(formData.get('hourlyRate') || 500),
      bio: formData.get('bio'),
    };
    try {
      setSavingProfile(true);
      const res = await api.mentor.updateProfile(profileData);
      if (res.success) {
        setMentorProfile(res.data);
        showSuccess('Mentor profile updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
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

  if (!user) return null;

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');

  const tabConfig = [
    { id: 'bookings', label: 'Booked Sessions', icon: Calendar },
    ...(user.role === 'mentor' ? [
      { id: 'packages', label: 'Packages', icon: Award },
      { id: 'availability', label: 'Availability', icon: Clock },
      { id: 'profile', label: 'Mentor Profile', icon: UserIcon },
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
                    }[booking.status] || { cls: 'bg-white/5 border-border-strong text-secondary', dot: 'bg-secondary' };

                    return (
                      <div key={booking._id} className="p-5 border border-border-strong bg-surface-container-lowest rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-border-strong/80 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                              {booking.status}
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

                        {booking.status === 'confirmed' && meetingLink && (
                          <a
                            href={meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
                          >
                            Join Call <ExternalLink size={13} />
                          </a>
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
                      className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Start Time</label>
                    <input type="time" required value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)}
                      className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">End Time</label>
                    <input type="time" required value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)}
                      className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
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

          {/* ── TAB: Profile ── */}
          {activeTab === 'profile' && user.role === 'mentor' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-on-surface">Mentor Profile</h2>
              {loadingProfile ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="p-5 border border-border-strong bg-surface rounded-2xl space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Current Title / Role</label>
                      <input type="text" name="currentRole" defaultValue={mentorProfile?.currentRole || ''} required
                        placeholder="e.g. Senior Frontend Developer"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Company</label>
                      <input type="text" name="company" defaultValue={mentorProfile?.company || ''} required
                        placeholder="e.g. Netflix, Stripe, Google"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Experience (years)</label>
                      <input type="number" name="experience" defaultValue={mentorProfile?.experience || 0} required min="0"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Hourly Rate (INR)</label>
                      <input type="number" name="hourlyRate" defaultValue={mentorProfile?.hourlyRate || 500} required min="0"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Expertise (comma separated)</label>
                      <input type="text" name="expertise" defaultValue={mentorProfile?.expertise?.join(', ') || ''} required
                        placeholder="React, TypeScript, System Design"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">LinkedIn URL</label>
                      <input type="url" name="linkedIn" defaultValue={mentorProfile?.linkedIn || ''}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">GitHub URL</label>
                      <input type="url" name="github" defaultValue={mentorProfile?.github || ''}
                        placeholder="https://github.com/username"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Bio</label>
                    <textarea name="bio" rows="4" defaultValue={mentorProfile?.bio || mentorProfile?.user?.bio || ''}
                      placeholder="Describe your career, specialties, and how you help students..."
                      className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all resize-none" />
                  </div>

                  <button type="submit" disabled={savingProfile}
                    className="btn-primary text-sm px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-60">
                    {savingProfile ? (
                      <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                    ) : <Check size={15} />}
                    Save Changes
                  </button>
                </form>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

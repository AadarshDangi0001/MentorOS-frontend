import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import {
  User, Briefcase, DollarSign, Save, Upload, Loader2, AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfileState } = useAuth();
  const { showSuccess, showError } = useToast();

  // General Loading/Saving states
  const [savingUser, setSavingUser] = useState(false);
  const [savingMentor, setSavingMentor] = useState(false);
  const [loadingMentor, setLoadingMentor] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    try {
      setSendingVerification(true);
      await api.auth.resendVerificationEmail(user.email);
      showSuccess('Verification email sent! Please check your inbox.');
    } catch (err) {
      showError(err.message || 'Failed to resend verification email.');
    } finally {
      setSendingVerification(false);
    }
  };

  // User fields
  const [name, setName] = useState(() => user?.name || '');
  const [phone, setPhone] = useState(() => user?.phone || '');
  const [bio, setBio] = useState(() => user?.bio || '');
  const [avatar, setAvatar] = useState(() => user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Mentor fields
  const [mentorProfile, setMentorProfile] = useState(null);
  const [currentRole, setCurrentRole] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(500);
  const [expertise, setExpertise] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [github, setGithub] = useState('');

  const fetchMentorProfile = useCallback(async () => {
    try {
      setLoadingMentor(true);
      const res = await api.mentor.getProfile();
      const profile = res.data?.mentor || res.data || null;
      if (profile) {
        setMentorProfile(profile);
        setCurrentRole(profile.currentRole || '');
        setCompany(profile.company || '');
        setExperience(profile.experience || 0);
        setHourlyRate(profile.hourlyRate || 500);
        setExpertise(profile.expertise?.join(', ') || '');
        setLinkedIn(profile.linkedIn || '');
        setGithub(profile.github || '');
      }
    } catch (err) {
      console.error('Failed to load mentor profile details', err);
    } finally {
      setLoadingMentor(false);
    }
  }, []);

  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setBio(user?.bio || '');
    setAvatar(user?.avatar || '');
  }

  useEffect(() => {
    if (user && user.role === 'mentor') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMentorProfile();
    }
  }, [user, fetchMentorProfile]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Image size exceeds 5MB limit.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file (JPEG, PNG, WEBP).');
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await api.media.upload(file);
      if (res.success && res.data?.url) {
        setAvatar(res.data.url);
        if (res.data?.user) {
          updateProfileState(res.data.user);
        }
        showSuccess('Profile picture updated successfully!');
      } else {
        throw new Error(res.message || 'Failed to upload image');
      }
    } catch (err) {
      showError(err.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Name is required');
      return;
    }
    try {
      setSavingUser(true);
      const res = await api.auth.updateMe({ name, phone, bio, avatar });
      if (res.success && res.data?.user) {
        updateProfileState(res.data.user);
        showSuccess('Personal details updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update personal details');
    } finally {
      setSavingUser(false);
    }
  };

  const handleUpdateMentor = async (e) => {
    e.preventDefault();
    try {
      setSavingMentor(true);
      const profileData = {
        currentRole,
        company,
        experience: Number(experience),
        hourlyRate: Number(hourlyRate),
        expertise: expertise.split(',').map(s => s.trim()).filter(Boolean),
        linkedIn,
        github,
      };
      const res = await api.mentor.updateProfile(profileData);
      if (res.success) {
        setMentorProfile(res.data?.mentor || res.data);
        showSuccess('Mentorship details updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update mentorship details');
    } finally {
      setSavingMentor(false);
    }
  };



  if (!user) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 pt-24 text-center">
        <p className="text-secondary">Please log in to manage your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-24 pb-16 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-primary-container font-bold uppercase tracking-widest mb-2">Account Settings</p>
        <h1 className="text-4xl font-black text-on-surface">My Profile</h1>
        <p className="text-secondary mt-1">Manage your public information and mentorship preferences</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Unverified Email Warning Notification */}
        {!user.isEmailVerified && (
          <div className="p-5 border border-amber-500/20 bg-amber-950/15 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-300 animate-fade-in shadow-[0_0_24px_rgba(245,158,11,0.03)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
              <div className="text-sm">
                <span className="font-bold block sm:inline">Email Verification Required: </span>
                Your email address is not verified. Please check your inbox or request a new verification link.
              </div>
            </div>
            <button
              type="button"
              disabled={sendingVerification}
              onClick={handleResendVerification}
              className="sm:self-center bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-colors text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer self-start w-full sm:w-auto"
            >
              {sendingVerification && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Resend Verification Link
            </button>
          </div>
        )}

        {/* Card: Personal Details */}
          <div className="relative overflow-hidden p-6 md:p-8 border border-border-strong rounded-2xl bg-surface-container-lowest shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary-container">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface">Personal Info</h2>
                <p className="text-xs text-secondary">Your profile details displayed across the platform</p>
              </div>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-5">
              {/* Profile Image Preview & Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-3">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <img
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=f97316&color=1a0800&bold=true&size=128`}
                    alt={user?.name || 'User'}
                    className="w-full h-full rounded-2xl border-2 border-primary-container/30 object-cover bg-surface-container"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=f97316&color=1a0800&bold=true&size=128`;
                    }}
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-background/70 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                    </div>
                  )}
                </div>
                <div className="w-full space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary">Profile Image</label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-surface-container border border-border-strong text-on-surface hover:bg-surface-container-high transition-colors text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                    >
                      <Upload size={14} className="text-secondary" />
                      Upload Image
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="border border-red-500/20 bg-red-950/10 hover:bg-red-950/25 text-red-400 transition-colors text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-secondary leading-relaxed">
                    Support JPG, PNG or WEBP. Max size 5MB.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Bio</label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all resize-none focus:border-primary-container focus:outline-none"
                />
                <p className="text-[10px] text-secondary text-right mt-1">{bio.length}/500 characters</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingUser}
                  className="btn-primary text-sm px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-60 font-bold"
                >
                  {savingUser ? (
                    <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                  ) : <Save size={16} />}
                  Save Profile Info
                </button>
              </div>
            </form>
          </div>

          {/* Card: Mentorship Settings (Mentor Only) */}
          {user.role === 'mentor' && (
            <div className="relative overflow-hidden p-6 md:p-8 border border-border-strong rounded-2xl bg-surface-container-lowest shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary-container">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">Mentorship Details</h2>
                    <p className="text-xs text-secondary">Configure your availability details, pricing, and social handles</p>
                  </div>
                </div>
                {mentorProfile?.mentorStatus && (
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                    mentorProfile.mentorStatus === 'approved'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : mentorProfile.mentorStatus === 'pending'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {mentorProfile.mentorStatus}
                  </span>
                )}
              </div>

              {loadingMentor ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleUpdateMentor} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Current Role / Title</label>
                      <input
                        type="text"
                        required
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Company</label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Google, Netflix, Stripe"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Experience (years)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={experience}
                        onChange={(e) => setExperience(Number(e.target.value))}
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Hourly Rate (INR)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                          type="number"
                          required
                          min="0"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(Number(e.target.value))}
                          className="w-full bg-surface-input border border-border-strong rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Expertise (comma-separated)</label>
                      <input
                        type="text"
                        required
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                        placeholder="React, TypeScript, System Design"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        value={linkedIn}
                        onChange={(e) => setLinkedIn(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">GitHub URL</label>
                      <input
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingMentor}
                      className="btn-primary text-sm px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-60 font-bold"
                    >
                      {savingMentor ? (
                        <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                      ) : <Save size={16} />}
                      Save Mentorship Preferences
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
      </div>
    </div>
  );
}

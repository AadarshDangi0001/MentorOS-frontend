import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import {
  User, Lock, Briefcase, Award, Globe, DollarSign, Check, Eye, EyeOff, Save, Link as LinkIcon
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfileState } = useAuth();
  const { showSuccess, showError } = useToast();

  // General Loading/Saving states
  const [savingUser, setSavingUser] = useState(false);
  const [savingMentor, setSavingMentor] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loadingMentor, setLoadingMentor] = useState(false);

  // Password visibility states
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // User fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mentor fields
  const [mentorProfile, setMentorProfile] = useState(null);
  const [currentRole, setCurrentRole] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(500);
  const [expertise, setExpertise] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [github, setGithub] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');

      if (user.role === 'mentor') {
        fetchMentorProfile();
      }
    }
  }, [user]);

  const fetchMentorProfile = async () => {
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await api.auth.changePassword(currentPassword, newPassword);
      showSuccess('Password updated successfully! Please log in again.');
      // Auto logout
      setTimeout(() => {
        api.auth.logout();
        window.location.href = '/auth/login';
      }, 1500);
    } catch (err) {
      showError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
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
        <p className="text-secondary mt-1">Manage your public information, mentorship preferences, and security settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column: Preview & Personal Info */}
        <div className="lg:col-span-2 space-y-8">
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
              {/* Profile Image Preview & URL input */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-3">
                <img
                  src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=f97316&color=1a0800&bold=true&size=128`}
                  alt={name}
                  className="w-20 h-20 rounded-2xl border-2 border-primary-container/30 object-cover flex-shrink-0 bg-surface-container"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=f97316&color=1a0800&bold=true&size=128`;
                  }}
                />
                <div className="w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-surface-input border border-border-strong rounded-xl px-3.5 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                  />
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

        {/* Right column: Security & password settings */}
        <div className="space-y-8">
          {/* Card: Change Password */}
          <div className="relative overflow-hidden p-6 md:p-8 border border-border-strong rounded-2xl bg-surface-container-lowest shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary-container">
                <Lock size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface">Change Password</h2>
                <p className="text-xs text-secondary">Keep your account secure by rotating your password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-input border border-border-strong rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-surface-input border border-border-strong rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-input border border-border-strong rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-on-surface transition-all focus:border-primary-container focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full btn-primary text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 font-bold"
                >
                  {savingPassword ? (
                    <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                  ) : <Check size={16} />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

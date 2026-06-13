import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function CreateMentorModal({ isOpen, onClose, onSuccess }) {
  const { showSuccess, showError } = useToast();

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

  if (!isOpen) return null;

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
        onSuccess();
        onClose();
      }
    } catch (err) {
      showError(err.message || 'Failed to create mentor profile');
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <form onSubmit={handleCreateMentor} className="bg-surface border border-border-strong rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-scale-in my-8 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border-strong">
          <h3 className="font-bold text-on-surface text-lg">Create New Mentor Profile</h3>
          <button
            type="button"
            onClick={onClose}
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
            onClick={onClose}
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
  );
}

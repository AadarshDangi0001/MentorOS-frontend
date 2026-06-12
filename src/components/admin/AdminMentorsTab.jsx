import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Award, ChevronDown, ExternalLink, BookOpen, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import CreateMentorModal from './CreateMentorModal';

export default function AdminMentorsTab() {
  const { showSuccess, showError, showWarning } = useToast();

  const [adminMentors, setAdminMentors] = useState([]);
  const [totalMentors, setTotalMentors] = useState(0);
  const [mentorsPage, setMentorsPage] = useState(1);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [expandedMentorId, setExpandedMentorId] = useState(null);
  const [isCreatingMentor, setIsCreatingMentor] = useState(false);

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

  useEffect(() => {
    fetchAdminMentors(mentorsPage);
  }, [mentorsPage, fetchAdminMentors]);

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

  return (
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
                                      <p className="mt-1 text-on-surface leading-relaxed text-sm bg-black/10 p-3 rounded-xl border border-border-strong/55">{u.bio}</p>
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

      {/* Create Mentor Modal */}
      <CreateMentorModal
        isOpen={isCreatingMentor}
        onClose={() => setIsCreatingMentor(false)}
        onSuccess={() => fetchAdminMentors(mentorsPage)}
      />
    </div>
  );
}

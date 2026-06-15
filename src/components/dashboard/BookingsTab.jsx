import { useState } from 'react';
import { Calendar, Clock, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import ConfirmDialog from '../common/ConfirmDialog';
import SkeletonRow from '../common/SkeletonRow';

export default function BookingsTab({ user, bookings, loadingBookings, fetchBookings }) {
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  // Dialog & Reschedule states
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [meetingActionLoading, setMeetingActionLoading] = useState({}); // { [bookingId]: 'create' | 'join' | 'end' | null }
  const [subTab, setSubTab] = useState('upcoming'); // 'upcoming' | 'history'

  const isPastSession = (booking) => {
    if (['completed', 'cancelled'].includes(booking.status)) {
      return true;
    }
    if (booking.meeting?.status === 'completed') {
      return true;
    }
    const scheduledTime = new Date(booking.scheduledAt).getTime();
    const durationMs = (booking.duration || 60) * 60 * 1000;
    if (scheduledTime + durationMs < Date.now()) {
      return true;
    }
    return false;
  };

  const upcomingSessions = bookings
    .filter(b => !isPastSession(b))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastSessions = bookings
    .filter(b => isPastSession(b))
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const currentSessionsList = subTab === 'upcoming' ? upcomingSessions : pastSessions;

  const handleCreateMeeting = async (bookingId) => {
    try {
      setMeetingActionLoading(prev => ({ ...prev, [bookingId]: 'create' }));
      const res = await api.meetings.create(bookingId);
      if (res.success) {
        showSuccess('Meeting created successfully! You can now start/join the call.');
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to create meeting');
    } finally {
      setMeetingActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleJoinHost = async (bookingId) => {
    try {
      setMeetingActionLoading(prev => ({ ...prev, [bookingId]: 'join' }));
      const res = await api.meetings.joinHost(bookingId);
      if (res.success && res.data?.meetLink) {
        window.open(res.data.meetLink, '_blank');
        fetchBookings(); // To refresh status to 'started'
      } else {
        throw new Error('Could not get join link');
      }
    } catch (err) {
      showError(err.message || 'Failed to join meeting as host');
    } finally {
      setMeetingActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleJoinUser = async (bookingId) => {
    try {
      setMeetingActionLoading(prev => ({ ...prev, [bookingId]: 'join' }));
      const res = await api.meetings.joinUser(bookingId);
      if (res.success && res.data?.meetLink) {
        window.open(res.data.meetLink, '_blank');
      } else {
        throw new Error('Could not get join link');
      }
    } catch (err) {
      showError(err.message || 'Failed to join meeting');
    } finally {
      setMeetingActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleEndMeeting = async (bookingId) => {
    try {
      setMeetingActionLoading(prev => ({ ...prev, [bookingId]: 'end' }));
      const res = await api.meetings.end(bookingId);
      if (res.success) {
        showSuccess('Meeting ended successfully.');
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to end meeting');
    } finally {
      setMeetingActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const confirmAction = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  };

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

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-5 animate-fade-in">
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-strong pb-4 gap-4">
        <h2 className="text-xl font-bold text-on-surface">
          {user.role === 'mentor' ? 'Your Booked Sessions' : 'Your Sessions'}
        </h2>
        <div className="flex gap-1.5 p-1 bg-surface-container rounded-xl border border-border-strong self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('upcoming')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${subTab === 'upcoming'
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-secondary hover:text-on-surface'
              }`}
          >
            Upcoming ({upcomingSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${subTab === 'history'
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-secondary hover:text-on-surface'
              }`}
          >
            History ({pastSessions.length})
          </button>
        </div>
      </div>

      {loadingBookings ? (
        <div className="space-y-4">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : currentSessionsList.length > 0 ? (
        <div className="space-y-4">
          {currentSessionsList.map((booking) => {
            const counterparty = user.role === 'mentor' ? booking.student : booking.mentor;
            const meetingLink = booking.meeting?.meetingLink;
            const hasMeeting = !!booking.meeting;
            const meetingStatus = booking.meeting?.status; // 'scheduled' | 'started' | 'completed'
            const statusConfig = {
              confirmed: { cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
              completed: { cls: 'bg-sky-500/10 border-sky-500/20 text-sky-400', dot: 'bg-sky-400' },
              pending: { cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
              reschedule_requested: { cls: 'bg-purple-500/10 border-purple-500/20 text-purple-400', dot: 'bg-purple-400' },
              rescheduled: { cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400', dot: 'bg-blue-400' },
              cancelled: { cls: 'bg-rose-500/10 border-rose-500/20 text-rose-400', dot: 'bg-rose-400' },
            }[booking.status] || { cls: 'bg-white/5 border-border-strong text-secondary', dot: 'bg-secondary' };

            const isConfirmedOrRescheduled = ['confirmed', 'rescheduled'].includes(booking.status);

            const getStatusText = () => {
              if (booking.status === 'cancelled') {
                if (booking.cancelledBy) {
                  const role = typeof booking.cancelledBy === 'object' ? booking.cancelledBy.role : booking.cancelledBy;
                  if (role === 'mentor') return 'cancelled by mentor';
                  if (role === 'student' || role === 'user') return 'cancelled by user';
                }
                return 'cancelled by mentor'; // default legacy
              }
              return booking.status.replace('_', ' ');
            };

            return (
              <div key={booking._id} className="p-5 border border-border-strong bg-surface-container-lowest rounded-2xl flex flex-col hover:border-border-strong/80 transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {getStatusText()}
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
                    {/* MEETING ACTION BUTTONS */}
                    {isConfirmedOrRescheduled && !isPastSession(booking) && (
                      <>
                        {user.role === 'mentor' ? (
                          <>
                            {/* Mentor Actions */}
                            {!hasMeeting && (
                              <button
                                onClick={() => handleCreateMeeting(booking._id)}
                                disabled={meetingActionLoading[booking._id] === 'create'}
                                className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              >
                                {meetingActionLoading[booking._id] === 'create' ? (
                                  <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  'Create Meet'
                                )}
                              </button>
                            )}

                            {hasMeeting && meetingStatus === 'scheduled' && (
                              <button
                                onClick={() => handleJoinHost(booking._id)}
                                disabled={meetingActionLoading[booking._id] === 'join'}
                                className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              >
                                {meetingActionLoading[booking._id] === 'join' ? (
                                  <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>Start Call <ExternalLink size={13} /></>
                                )}
                              </button>
                            )}

                            {hasMeeting && meetingStatus === 'started' && (
                              <>
                                <button
                                  onClick={() => handleJoinHost(booking._id)}
                                  disabled={meetingActionLoading[booking._id] === 'join'}
                                  className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50 animate-pulse cursor-pointer"
                                >
                                  {meetingActionLoading[booking._id] === 'join' ? (
                                    <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <>Join Call <ExternalLink size={13} /></>
                                  )}
                                </button>
                                <button
                                  onClick={() => confirmAction('Are you sure you want to end this meeting? This will disconnect all participants.', () => handleEndMeeting(booking._id))}
                                  disabled={meetingActionLoading[booking._id] === 'end'}
                                  className="px-4 py-2.5 border border-rose-500/20 text-rose-400 hover:bg-rose-950/20 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {meetingActionLoading[booking._id] === 'end' ? (
                                    <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    'End Meet'
                                  )}
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Student Actions */}
                            {(!hasMeeting || meetingStatus === 'scheduled') && (
                              <button
                                disabled
                                className="px-4 py-2.5 bg-white/5 border border-border-strong text-secondary text-xs font-semibold rounded-xl cursor-not-allowed"
                              >
                                Waiting for Mentor
                              </button>
                            )}

                            {hasMeeting && meetingStatus === 'started' && (
                              <button
                                onClick={() => handleJoinUser(booking._id)}
                                disabled={meetingActionLoading[booking._id] === 'join'}
                                className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50 animate-pulse cursor-pointer"
                              >
                                {meetingActionLoading[booking._id] === 'join' ? (
                                  <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>Join Call <ExternalLink size={13} /></>
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {isConfirmedOrRescheduled && user.role === 'mentor' && !isPastSession(booking) && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenRescheduleModal(booking._id)}
                          className="px-4 py-2.5 border border-border-strong hover:bg-white/5 text-secondary hover:text-on-surface text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmAction('Are you sure you want to cancel this booking? This cannot be undone and will free the availability slot.', () => handleCancelBooking(booking._id))}
                          className="px-4 py-2.5 border border-rose-500/20 text-rose-400 hover:bg-rose-950/20 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {isConfirmedOrRescheduled && user.role === 'student' && !isPastSession(booking) && (
                      <>
                        <button
                          type="button"
                          onClick={() => confirmAction('Are you sure you want to cancel this booking? This cannot be undone.', () => handleCancelBooking(booking._id))}
                          className="px-4 py-2.5 border border-rose-500/20 text-rose-400 hover:bg-rose-950/20 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Reschedule Request UI */}
                {booking.status === 'reschedule_requested' && !isPastSession(booking) && (
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
      ) : subTab === 'upcoming' ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border-strong rounded-2xl text-center">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-5">
            <Calendar className="w-7 h-7 text-secondary" />
          </div>
          <p className="font-bold text-on-surface text-lg mb-2">No upcoming sessions</p>
          <p className="text-secondary text-sm max-w-xs">
            {user.role === 'student' ? "Book your first mentorship session to get started." : "You don't have any upcoming booked sessions."}
          </p>
          {user.role === 'student' && (
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="mt-5 btn-primary text-sm px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Find a Mentor
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border-strong rounded-2xl text-center">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-5">
            <Clock className="w-7 h-7 text-secondary" />
          </div>
          <p className="font-bold text-on-surface text-lg mb-2">No past sessions</p>
          <p className="text-secondary text-sm max-w-xs">
            No completed or expired sessions in your history yet.
          </p>
        </div>
      )}

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
                    navigate('/dashboard', { state: { activeTab: 'availability' } }); // Or trigger tab change
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
    </div>
  );
}

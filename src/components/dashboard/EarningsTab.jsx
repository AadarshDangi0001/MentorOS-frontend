import React from 'react';
import { DollarSign, Calendar, Clock } from 'lucide-react';

export default function EarningsTab({ user, bookings }) {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const lifetimeEarnings = bookings
    .filter(b => ['confirmed', 'rescheduled', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.package?.price || 0), 0);

  const completedSessionsCount = bookings.filter(b => b.status === 'completed').length;
  const activeBookingsCount = bookings.filter(b => ['confirmed', 'rescheduled'].includes(b.status)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-on-surface">Earnings Overview</h2>
      
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
          <p className="text-[10px] text-secondary uppercase tracking-wider font-bold mb-2">Lifetime Earnings</p>
          <p className="text-3xl font-black text-primary-container">
            ₹{lifetimeEarnings.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest">
          <p className="text-[10px] text-secondary uppercase tracking-wider font-bold mb-2">Completed Sessions</p>
          <p className="text-3xl font-black text-on-surface">
            {completedSessionsCount}
          </p>
        </div>
        <div className="p-6 border border-border-strong rounded-2xl bg-surface-container-lowest">
          <p className="text-[10px] text-secondary uppercase tracking-wider font-bold mb-2">Active Bookings</p>
          <p className="text-3xl font-black text-on-surface">
            {activeBookingsCount}
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
  );
}

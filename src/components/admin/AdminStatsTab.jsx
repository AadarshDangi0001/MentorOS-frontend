import { useState, useEffect, useCallback } from 'react';
import { User as UserIcon, Calendar, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function AdminStatsTab() {
  const { showError } = useToast();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

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

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchStats();
      }
    });
    return () => { active = false; };
  }, [fetchStats]);

  return (
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
  );
}

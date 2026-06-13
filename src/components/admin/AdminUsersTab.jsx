import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import ConfirmDialog from '../common/ConfirmDialog';

export default function AdminUsersTab({ currentUser }) {
  const { showSuccess, showError } = useToast();

  const [adminUsers, setAdminUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

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

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchAdminUsers(usersPage);
      }
    });
    return () => { active = false; };
  }, [usersPage, fetchAdminUsers]);

  const handleBlockUser = async (id) => {
    setConfirmDialog({
      message: 'Are you sure you want to block this user? They will not be able to log in.',
      onConfirm: async () => {
        try {
          await api.admin.blockUser(id);
          showSuccess('User blocked successfully');
          fetchAdminUsers(usersPage);
        } catch (err) {
          showError(err.message || 'Failed to block user');
        }
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
    setConfirmDialog({
      message: 'Are you sure you want to delete this user? This is permanent.',
      onConfirm: async () => {
        try {
          await api.admin.deleteUser(id);
          showSuccess('User deleted successfully');
          fetchAdminUsers(usersPage);
        } catch (err) {
          showError(err.message || 'Failed to delete user');
        }
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

  return (
    <div className="space-y-6 animate-fade-in">
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
                    const canChangeRole = currentUser?.role === 'super_admin' && u._id !== currentUser?._id;

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
                              {currentUser?.role === 'super_admin' && (
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
                          {u._id !== currentUser?._id ? (
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
  );
}

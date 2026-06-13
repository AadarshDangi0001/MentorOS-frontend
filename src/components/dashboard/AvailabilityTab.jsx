import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import ConfirmDialog from '../common/ConfirmDialog';

export default function AvailabilityTab({ user }) {
  const { showSuccess, showError } = useToast();

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:00');
  const [addingSlot, setAddingSlot] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

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
  }, [user, showError]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchSlots();
      }
    });
    return () => { active = false; };
  }, [fetchSlots]);

  const calculateEndTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + 60, 0, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlotDate) { 
      showError('Please select a date'); 
      return; 
    }
    try {
      setAddingSlot(true);
      const startTime = new Date(`${newSlotDate}T${newSlotStart}:00`);
      const endTime = new Date(`${newSlotDate}T${newSlotEnd}:00`);
      if (endTime <= startTime) { 
        showError('End time must be after start time'); 
        return; 
      }

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
    setConfirmDialog({
      message: 'Delete this availability slot?',
      onConfirm: async () => {
        try {
          await api.availability.delete(id);
          showSuccess('Slot deleted');
          fetchSlots();
        } catch (err) {
          showError(err.message || 'Failed to delete slot');
        }
      }
    });
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
  );
}

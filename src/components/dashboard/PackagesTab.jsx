import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Clock, Award } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';
import ConfirmDialog from '../common/ConfirmDialog';

export default function PackagesTab({ user }) {
  const { showSuccess, showError } = useToast();

  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [packageTitle, setPackageTitle] = useState('');
  const [packageDuration, setPackageDuration] = useState(60);
  const [packagePrice, setPackagePrice] = useState(1000);
  const [packageDesc, setPackageDesc] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

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
  }, [user, showError]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchPackages();
      }
    });
    return () => { active = false; };
  }, [fetchPackages]);

  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        const res = await api.packages.update(editingPackage._id, packageTitle, packageDuration, packagePrice, packageDesc);
        if (res.success) {
          showSuccess('Package updated!');
          setEditingPackage(null);
        }
      } else {
        const res = await api.packages.create(packageTitle, packageDuration, packagePrice, packageDesc);
        if (res.success) {
          showSuccess('Package created!');
          setIsAddingPackage(false);
        }
      }
      setPackageTitle('');
      setPackageDuration(60);
      setPackagePrice(1000);
      setPackageDesc('');
      fetchPackages();
    } catch (err) {
      showError(err.message || 'Failed to save package');
    }
  };

  const handleDeletePackage = (id) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this package? This cannot be undone.',
      onConfirm: async () => {
        try {
          await api.packages.delete(id);
          showSuccess('Package deleted');
          fetchPackages();
        } catch (err) {
          showError(err.message || 'Failed to delete package');
        }
      }
    });
  };

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

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-on-surface">Mentorship Packages</h2>
        {!isAddingPackage && !editingPackage && (
          <button
            onClick={() => {
              setPackageTitle('');
              setPackageDuration(60);
              setPackagePrice(1000);
              setPackageDesc('');
              setIsAddingPackage(true);
            }}
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
                onChange={e => setPackageDuration(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">Price (INR)</label>
            <input type="number" required min="0" value={packagePrice}
              onChange={e => setPackagePrice(e.target.value === '' ? '' : Number(e.target.value))}
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
                    onClick={() => {
                      setEditingPackage(pkg);
                      setPackageTitle(pkg.title);
                      setPackageDuration(pkg.duration);
                      setPackagePrice(pkg.price);
                      setPackageDesc(pkg.description || '');
                    }}
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
  );
}

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, ShieldCheck, Award, ChevronRight, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { useNavigate } from 'react-router-dom';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BookingModal({ mentor, initialPackageId, onClose }) {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState(1); // 1 = package, 2 = slot

  const mentorId = mentor.user?._id || mentor.user || mentor._id;
  const mentorName = mentor.user?.name || mentor.name || 'Mentor';
  const mentorAvatar = mentor.user?.avatar || mentor.avatarUrl;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const [pkgRes, slotRes] = await Promise.all([
          api.packages.list(mentorId),
          api.availability.list(mentorId, true),
        ]);
        const fetchedPackages = pkgRes.data?.packages || pkgRes.data || [];
        setPackages(fetchedPackages);
        setSlots(slotRes.data?.slots || slotRes.data || []);

        if (initialPackageId) {
          const found = fetchedPackages.find(p => p._id === initialPackageId);
          if (found) {
            setSelectedPackage(found);
            setStep(2);
          }
        }
      } catch (err) {
        showError('Failed to load mentor details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [mentorId, showError, initialPackageId]);

  const handlePayment = async () => {
    if (!user) {
      showInfo('Please log in to book a session');
      navigate('/auth/login');
      return;
    }
    if (!user.isEmailVerified) {
      showError('Please verify your email address first before booking a session.');
      return;
    }
    if (user.role === 'mentor') {
      showError('Mentors cannot book mentorship sessions');
      return;
    }
    if (!selectedPackage || !selectedSlot) {
      showError('Please select both a package and a time slot');
      return;
    }

    try {
      setPaying(true);
      const orderRes = await api.payments.createOrder(mentorId, selectedPackage._id, selectedSlot._id);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const { orderId, amount, currency, keyId } = orderRes.data;
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Payment gateway failed to load. Check your internet connection.');

      const options = {
        key: keyId || 'rzp_test_Sz82HCASogAQQv',
        amount,
        currency,
        name: 'MentorOS',
        description: `${selectedPackage.title} with ${mentorName}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Bug fix: removed duplicate setPaying(true)
            const meetingData = {
              roomId: `meet-${Math.random().toString(36).substring(2, 9)}`,
              provider: 'internal',
              meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 11)}`,
            };
            const verifyRes = await api.payments.verify(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              meetingData
            );
            if (verifyRes.success) {
              showSuccess('🎉 Booking confirmed! Check your dashboard for details.');
              onClose();
              navigate('/dashboard');
            } else {
              throw new Error(verifyRes.message || 'Payment verification failed');
            }
          } catch (err) {
            showError(err.message || 'Payment verification failed. Please contact support.');
          } finally {
            setPaying(false);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => {
            setPaying(false);
            showInfo('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showError(err.message || 'Failed to initiate booking. Please try again.');
      setPaying(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  };
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-xl bg-surface border border-border-strong rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-strong flex-shrink-0">
          <img
            src={mentorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=f97316&color=1a0800&bold=true`}
            alt={mentorName}
            className="w-10 h-10 rounded-xl object-cover border border-border-strong"
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=f97316&color=1a0800&bold=true`; }}
          />
          <div className="flex-grow min-w-0">
            <h2 className="text-base font-bold text-on-surface">Book a Session</h2>
            <p className="text-xs text-secondary">with {mentorName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        {!loading && (
          <div className="flex items-center gap-0 px-5 py-3 border-b border-border-strong flex-shrink-0">
            {['Package', 'Time Slot'].map((label, i) => (
              <React.Fragment key={label}>
                <button
                  onClick={() => { if (i === 0 || selectedPackage) setStep(i + 1); }}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    step === i + 1 ? 'text-primary-container' : i + 1 < step ? 'text-on-surface' : 'text-secondary'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                    step === i + 1
                      ? 'bg-primary-container text-on-primary-container border-primary-container'
                      : i + 1 < step
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'border-border-strong text-secondary'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </span>
                  {label}
                </button>
                {i === 0 && <ChevronRight size={12} className="text-secondary mx-1 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Step 1: Package */}
              {step === 1 && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-xs text-secondary mb-3">Choose a mentorship package that fits your needs.</p>
                  {packages.length > 0 ? (
                    packages.map((pkg) => (
                      <div
                        key={pkg._id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedPackage?._id === pkg._id
                            ? 'border-primary-container bg-primary-container/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                            : 'border-border-strong hover:border-secondary/50 bg-surface-container-lowest hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-on-surface text-sm">{pkg.title}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-secondary flex items-center gap-1">
                              <Clock size={10} /> {pkg.duration}min
                            </span>
                            <span className="text-base font-bold text-primary-container">
                              ₹{Number(pkg.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        {pkg.description && (
                          <p className="text-xs text-secondary line-clamp-2">{pkg.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 p-4 border border-amber-500/20 bg-amber-950/10 rounded-xl text-amber-400 text-sm">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      No packages defined by this mentor yet.
                    </div>
                  )}

                  {selectedPackage && (
                    <button
                      onClick={() => setStep(2)}
                      className="w-full btn-primary text-sm py-2.5 rounded-xl mt-2"
                    >
                      Continue — Select Time Slot
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Slot */}
              {step === 2 && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-xs text-secondary mb-3">Pick an available time slot.</p>
                  {slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 border rounded-xl cursor-pointer transition-all text-left ${
                            selectedSlot?._id === slot._id
                              ? 'border-primary-container bg-primary-container text-on-primary-container'
                              : 'border-border-strong hover:border-secondary/50 bg-surface-container-lowest text-secondary hover:text-on-surface'
                          }`}
                        >
                          <p className="text-xs font-bold">{formatDate(slot.startTime)}</p>
                          <p className="text-[11px] mt-0.5">
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 border border-amber-500/20 bg-amber-950/10 rounded-xl text-amber-400 text-sm">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      No available slots. Please check back later.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-5 py-4 border-t border-border-strong flex-shrink-0 flex items-center justify-between gap-3">
            <div className="text-left">
              {selectedPackage && (
                <>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">Total</p>
                  <p className="text-lg font-bold text-primary-container">
                    ₹{Number(selectedPackage.price).toLocaleString('en-IN')}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  disabled={paying}
                  className="px-4 py-2.5 border border-border-strong hover:bg-white/5 text-secondary text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Back
                </button>
              )}
              <button
                onClick={onClose}
                disabled={paying}
                className="px-4 py-2.5 border border-border-strong hover:bg-white/5 text-secondary text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              {step === 2 && (
                <button
                  onClick={handlePayment}
                  disabled={paying || !selectedPackage || !selectedSlot}
                  className="btn-primary text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {paying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} /> Pay & Book
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, StarHalf, Clock, Award, ExternalLink,
  ChevronLeft, ChevronRight, Calendar, Users,
} from 'lucide-react';
import BookingModal from '../../components/mentor/BookingModal';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';

const SkeletonBlock = ({ className }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

export default function MentorProfilePage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [mentor, setMentor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const [prevMentorId, setPrevMentorId] = useState(mentorId);
  if (mentorId !== prevMentorId) {
    setPrevMentorId(mentorId);
    setLoading(true);
  }

  const fetchMentor = useCallback(async () => {
    try {
      const [mentorRes, reviewRes, pkgRes] = await Promise.all([
        api.explore.getById(mentorId),
        api.explore.getReviews(mentorId, 1, 5),
        api.packages.list(mentorId),
      ]);
      setMentor(mentorRes.data?.mentor || mentorRes.data);
      const reviewData = reviewRes.data || [];
      setReviews(Array.isArray(reviewData) ? reviewData : reviewData.reviews || []);
      setReviewMeta({
        total: reviewData.total || reviewData.length || 0,
        page: 1,
        totalPages: reviewData.totalPages || 1,
      });
      setPackages(pkgRes.data?.packages || pkgRes.data || []);
    } catch (err) {
      showError('Failed to load mentor profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mentorId, showError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMentor();
  }, [fetchMentor]);

  const loadMoreReviews = async (page) => {
    try {
      setLoadingReviews(true);
      const res = await api.explore.getReviews(mentorId, page, 5);
      const data = res.data || [];
      setReviews(Array.isArray(data) ? data : data.reviews || []);
      setReviewPage(page);
      setReviewMeta(prev => ({ ...prev, page }));
    } catch {
      showError('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  const mentorName = mentor?.user?.name || mentor?.name || 'Mentor';
  const mentorAvatar = mentor?.user?.avatar || mentor?.avatarUrl;
  const mentorBio = mentor?.user?.bio || mentor?.bio;

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-10 pb-16 min-h-screen">
        <div className="mb-6">
          <SkeletonBlock className="h-4 w-32" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-5">
            <SkeletonBlock className="h-80" />
            <SkeletonBlock className="h-40" />
          </div>
          <div className="lg:col-span-2 space-y-5">
            <SkeletonBlock className="h-48" />
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-10 pb-16 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-surface-container rounded-2xl flex items-center justify-center mb-6">
          <Users size={32} className="text-secondary" />
        </div>
        <h2 className="text-2xl font-black text-on-surface mb-2">Mentor Not Found</h2>
        <p className="text-secondary mb-6">This mentor profile doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/explore')} className="btn-primary px-6 py-3 rounded-xl text-sm font-bold">
          Browse Mentors
        </button>
      </div>
    );
  }

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} size={14} className="text-amber-400 fill-amber-400" />
        ))}
        {half && <StarHalf size={14} className="text-amber-400 fill-amber-400" />}
      </div>
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-10 pb-16 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/explore" className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary-container transition-colors font-medium">
          <ChevronLeft size={16} />
          Back to Explore
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left Sidebar: Profile Card ─── */}
        <aside className="lg:col-span-1 space-y-5">
          {/* Main Profile Card */}
          <div className="relative overflow-hidden border border-border-strong bg-surface-container-lowest rounded-2xl p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
            <div className="relative text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={mentorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=f97316&color=1a0800&bold=true&size=128`}
                  alt={mentorName}
                  className="w-24 h-24 rounded-2xl border-2 border-primary-container/30 object-cover mx-auto"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=f97316&color=1a0800&bold=true&size=128`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
              </div>

              <h1 className="text-xl font-black text-on-surface mb-1">{mentorName}</h1>
              {(mentor.currentRole || mentor.company) && (
                <p className="text-sm text-secondary">
                  {mentor.currentRole}{mentor.company && ` @ ${mentor.company}`}
                </p>
              )}

              {mentor.rating != null && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {renderStars(mentor.rating)}
                  <span className="text-sm font-bold text-on-surface">{Number(mentor.rating).toFixed(1)}</span>
                  {mentor.totalReviews != null && (
                    <span className="text-xs text-secondary">({mentor.totalReviews} reviews)</span>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedPackageId(null);
                  setShowBooking(true);
                }}
                className="w-full btn-primary text-sm py-3 rounded-xl mt-5 font-bold flex items-center justify-center gap-2"
              >
                <Calendar size={16} /> Book a Session
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Experience', value: mentor.experience ? `${mentor.experience}y` : '—' },
              { label: 'Sessions', value: mentor.totalSessions || 0 },
              { label: 'Rate', value: mentor.hourlyRate ? `₹${Number(mentor.hourlyRate).toLocaleString('en-IN')}` : '—' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-3 border border-border-strong rounded-xl bg-surface-container-lowest">
                <p className="text-lg font-black text-on-surface">{stat.value}</p>
                <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Links */}
          {(mentor.linkedIn || mentor.github) && (
            <div className="border border-border-strong rounded-2xl bg-surface-container-lowest p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Connect</h3>
              {mentor.linkedIn && (
                <a href={mentor.linkedIn} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-on-surface hover:text-primary-container transition-colors">
                  <ExternalLink size={14} className="text-primary-container" /> LinkedIn
                </a>
              )}
              {mentor.github && (
                <a href={mentor.github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-on-surface hover:text-primary-container transition-colors">
                  <ExternalLink size={14} className="text-primary-container" /> GitHub
                </a>
              )}
            </div>
          )}
        </aside>

        {/* ── Right Content ─── */}
        <main className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {mentorBio && (
            <div className="border border-border-strong rounded-2xl bg-surface-container-lowest p-6 animate-fade-in">
              <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3">About</h2>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{mentorBio}</p>
            </div>
          )}

          {/* Expertise */}
          {mentor.expertise?.length > 0 && (
            <div className="border border-border-strong rounded-2xl bg-surface-container-lowest p-6 animate-fade-in">
              <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg border border-border-strong"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          <div className="border border-border-strong rounded-2xl bg-surface-container-lowest p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">Mentorship Packages</h2>
              <Award size={18} className="text-primary-container" />
            </div>
            {packages.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {packages.map(pkg => (
                  <div key={pkg._id} className="p-4 border border-border-strong rounded-xl bg-surface hover:border-primary-container/30 transition-all duration-300 glow-hover">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-on-surface text-sm">{pkg.title}</h3>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-secondary flex items-center gap-1 flex-shrink-0 ml-2">
                        <Clock size={10} /> {pkg.duration}min
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-secondary line-clamp-2 mb-3">{pkg.description}</p>
                    )}
                    <div className="flex items-center justify-between border-t border-border-strong pt-3">
                      <span className="text-lg font-bold text-primary-container">
                        ₹{Number(pkg.price).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedPackageId(pkg._id);
                          setShowBooking(true);
                        }}
                        className="btn-primary text-xs px-3 py-1.5 rounded-lg"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary text-center py-6">No packages available yet.</p>
            )}
          </div>

          {/* Reviews */}
          <div className="border border-border-strong rounded-2xl bg-surface-container-lowest p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
                Reviews {reviewMeta.total > 0 && `(${reviewMeta.total})`}
              </h2>
              <Star size={18} className="text-amber-400 fill-amber-400" />
            </div>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={review._id || i} className="p-4 border border-border-strong rounded-xl bg-surface">
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={review.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.student?.name || 'S')}&background=6366f1&color=fff&bold=true&size=40`}
                        alt=""
                        className="w-9 h-9 rounded-full border border-border-strong object-cover flex-shrink-0"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-on-surface">{review.student?.name || 'Student'}</span>
                          <span className="text-[10px] text-secondary">{formatDate(review.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    {review.review && (
                      <p className="text-sm text-secondary leading-relaxed mt-2">{review.review}</p>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {reviewMeta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-3">
                    <button
                      onClick={() => loadMoreReviews(reviewPage - 1)}
                      disabled={reviewPage <= 1 || loadingReviews}
                      className="p-2 border border-border-strong rounded-xl text-secondary hover:text-on-surface disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-secondary">
                      Page {reviewPage} of {reviewMeta.totalPages}
                    </span>
                    <button
                      onClick={() => loadMoreReviews(reviewPage + 1)}
                      disabled={reviewPage >= reviewMeta.totalPages || loadingReviews}
                      className="p-2 border border-border-strong rounded-xl text-secondary hover:text-on-surface disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-secondary text-center py-6">No reviews yet.</p>
            )}
          </div>
        </main>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          mentor={mentor}
          initialPackageId={selectedPackageId}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}

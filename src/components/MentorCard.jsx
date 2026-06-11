import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function MentorCard({
  mentorId,
  name,
  role,
  company,
  avatarUrl,
  rating,
  reviewsCount,
  skills = [],
  startingPrice,
  onBookSession,
}) {
  const navigate = useNavigate();

  // Bug fix: guard against undefined startingPrice
  const priceDisplay = startingPrice != null
    ? `₹${Number(startingPrice).toLocaleString('en-IN')}`
    : 'Contact';

  const displayedSkills = skills.slice(0, 3);

  return (
    <div
      onClick={() => mentorId && navigate(`/mentor/${mentorId}`)}
      className="group relative bg-surface border border-border-strong rounded-2xl p-5 glow-hover transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-primary-container/40"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/0 to-primary-container/0 group-hover:from-primary-container/3 group-hover:to-transparent transition-all duration-500 rounded-2xl pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img
              alt={`${name} profile`}
              className="w-14 h-14 rounded-xl object-cover border border-border-strong"
              src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'M')}&background=f97316&color=1a0800&bold=true&size=56`}
              loading="lazy"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'M')}&background=f97316&color=1a0800&bold=true&size=56`;
              }}
            />
          </div>

          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-base text-on-surface leading-tight truncate">
              {name || 'Mentor'}
            </h3>
            <p className="text-xs text-secondary mt-0.5 truncate">
              {role || 'Software Engineer'}{company ? ` @ ${company}` : ''}
            </p>
            {rating != null && (
              <div className="flex items-center gap-1 mt-1.5">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-on-surface">{Number(rating).toFixed(1)}</span>
                {reviewsCount != null && (
                  <span className="text-[10px] text-secondary">({reviewsCount})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {displayedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {displayedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-surface-container-high text-secondary text-[10px] uppercase tracking-wider font-semibold rounded-lg border border-border-strong"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2.5 py-1 bg-surface-container text-secondary text-[10px] rounded-lg border border-border-strong">
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between border-t border-border-strong pt-4 mt-2">
        <div>
          <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">From</p>
          <p className="text-lg font-bold text-on-surface">{priceDisplay}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookSession();
          }}
          className="btn-primary text-xs px-4 py-2 rounded-xl relative z-10"
        >
          Book Session
        </button>
      </div>
    </div>
  );
}

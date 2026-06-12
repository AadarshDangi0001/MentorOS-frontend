import React from 'react';

const mentorsList = [
  { name: 'Alex Chen', company: 'Google', avatarUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=64&h=64&fit=crop' },
  { name: 'Sarah Miller', company: 'Meta', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop' },
  { name: 'James Wilson', company: 'Amazon', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop' },
  { name: 'Elena Rodriguez', company: 'Netflix', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop' },
  { name: 'Marcus Thorne', company: 'Apple', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop' },
  { name: 'Priya Nair', company: 'Microsoft', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop' },
  { name: 'Arun Kumar', company: 'Stripe', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop' },
  { name: 'Linda Zhang', company: 'Airbnb', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop' },
];

export default function MentorScroll() {
  const doubleMentors = [...mentorsList, ...mentorsList, ...mentorsList];

  return (
    <div className="mentor-scroll-container w-full overflow-hidden">
      <div className="animate-scroll items-center gap-12 px-8 flex">
        {doubleMentors.map((mentor, index) => (
          <div key={index} className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
            <div className="w-12 h-12 rounded-xl border border-border-strong group-hover:border-primary-container/50 overflow-hidden transition-all duration-300 flex-shrink-0">
              <img
                alt={mentor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src={mentor.avatarUrl}
                loading="lazy"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=1a1a1a&color=f97316&bold=true`;
                }}
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-on-surface group-hover:text-primary-container transition-colors">
                {mentor.name}
              </p>
              <p className="text-xs text-secondary">{mentor.company}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

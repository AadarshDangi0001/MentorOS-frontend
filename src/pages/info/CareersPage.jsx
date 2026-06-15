import { Briefcase, MapPin, Clock, Award, Coffee, Laptop, Heart } from 'lucide-react';

const jobs = [
  {
    title: 'Senior Frontend Engineer (React)',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
  },
  {
    title: 'Product Designer (UX/UI)',
    department: 'Design',
    location: 'Remote (US/Europe)',
    type: 'Full-time',
  },
  {
    title: 'Developer Relations Manager',
    department: 'Marketing',
    location: 'Remote (Global)',
    type: 'Full-time',
  },
  {
    title: 'Customer Success Specialist',
    department: 'Operations',
    location: 'Remote (APAC)',
    type: 'Part-time',
  },
];

const perks = [
  { icon: Laptop, title: '100% Remote', desc: 'Work from anywhere in the world. We offer home office stipends.' },
  { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive medical, dental, and mental health coverage.' },
  { icon: Award, title: 'Learning Stipend', desc: 'Annual budget for courses, books, conferences, and mentorship.' },
  { icon: Coffee, title: 'Flexible Hours', desc: 'Manage your own schedule. We trust you to get work done.' },
];

export default function CareersPage() {
  return (
    <div className="w-full relative overflow-x-hidden min-h-screen pb-16">
      {/* Decorative Background Orbs */}
      <div className="orb-glow w-[500px] h-[500px] bg-orange-500 top-[-250px] left-1/2 -translate-x-1/2 opacity-20" />
      <div className="orb-glow w-[300px] h-[300px] bg-amber-600 bottom-[20%] right-[-100px] opacity-10" />

      <div className="max-w-[900px] mx-auto px-5 md:px-8 pt-24 space-y-16 relative z-10">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-container">
            Join Our Team
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight leading-none">
            Work at <span className="gradient-text">MentorOS</span>
          </h1>
          <p className="text-secondary text-sm sm:text-base leading-relaxed">
            We are a fully remote, globally distributed team building the future of peer-to-peer professional mentorship.
          </p>
        </div>

        {/* Benefits Grid */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-black text-on-surface">Perks & Benefits</h2>
            <p className="text-secondary text-xs mt-1">What we offer to help you do your best work</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {perks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div key={idx} className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 space-y-3 hover:border-primary-container/30 transition-all duration-300">
                  <div className="w-10 h-10 bg-primary-container/10 border border-primary-container/20 rounded-xl flex items-center justify-center">
                    <Icon className="text-primary-container" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">{perk.title}</h3>
                  <p className="text-xs text-secondary leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Open Positions */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-on-surface">Open Positions</h2>
            <p className="text-secondary text-xs mt-1">Come build the platform with us</p>
          </div>
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <div key={idx} className="group bg-surface-container-lowest border border-border-strong rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary-container/30 transition-all duration-300">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-on-surface group-hover:text-primary-container transition-colors duration-200">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {job.type}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 border border-border-strong group-hover:border-primary-container/40 text-on-surface text-xs font-semibold rounded-xl hover:bg-white/3 transition-all cursor-pointer">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

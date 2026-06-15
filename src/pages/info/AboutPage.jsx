import { Users, Target, ShieldCheck, Heart } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To democratize access to world-class career guidance, bridging the gap between ambitious learners and experienced industry experts through direct, personalized 1:1 mentorship.',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in building a supportive and collaborative global ecosystem where knowledge flows freely, helping people achieve their fullest potential.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality & Integrity',
      description: 'We vet every mentor on our platform to ensure they meet our high standards of experience, empathy, and professional excellence.',
    },
    {
      icon: Heart,
      title: 'People Centric',
      description: 'We design our platform with users in mind, focusing on creating frictionless scheduling, clear expectations, and successful outcomes.',
    },
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen pb-16">
      {/* Decorative Background Orbs */}
      <div className="orb-glow w-[500px] h-[500px] bg-orange-500 top-[-250px] left-1/2 -translate-x-1/2 opacity-20" />
      <div className="orb-glow w-[300px] h-[300px] bg-amber-600 bottom-[20%] right-[-100px] opacity-10" />

      <div className="max-w-[900px] mx-auto px-5 md:px-8 pt-24 space-y-16 relative z-10">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-container">
            Who We Are
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight leading-none">
            About <span className="gradient-text">MentorOS</span>
          </h1>
          <p className="text-secondary text-sm sm:text-base leading-relaxed">
            We are a team of educators, engineers, and builders dedicated to making career growth accessible, collaborative, and actionable for everyone.
          </p>
        </div>

        {/* Introduction Section */}
        <section className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 sm:p-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-on-surface">The Mentorship Gap</h2>
          <div className="space-y-4 text-xs sm:text-sm text-secondary leading-relaxed">
            <p>
              In today's fast-paced tech and business landscapes, navigating a career path can feel overwhelming. Many learners and professionals struggle to find genuine, contextual advice on how to pass interviews, architect complex systems, or transition into leadership.
            </p>
            <p>
              MentorOS was created to bridge this gap. By offering direct access to verified experts from FAANG and high-growth startups, we eliminate the guesswork and help you make progress in days instead of months.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-on-surface">Our Core Values</h2>
            <p className="text-secondary text-xs">The foundational principles that guide our product and team</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 space-y-4 hover:border-primary-container/30 transition-all duration-300">
                  <div className="w-10 h-10 bg-primary-container/10 border border-primary-container/20 rounded-xl flex items-center justify-center">
                    <Icon className="text-primary-container" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">{val.title}</h3>
                  <p className="text-xs text-secondary leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="p-8 border border-border-strong rounded-2xl bg-gradient-to-r from-surface-container-lowest to-surface-container text-center space-y-4">
          <h2 className="text-xl font-black text-on-surface">Want to join us?</h2>
          <p className="text-secondary text-xs max-w-md mx-auto">
            We are always looking for passionate mentors to join our community and guide the next generation of builders.
          </p>
          <a
            href="/auth/register?role=mentor"
            className="inline-flex items-center btn-primary text-xs font-bold py-3 px-6 rounded-xl cursor-pointer"
          >
            Become a Mentor Today
          </a>
        </section>
      </div>
    </div>
  );
}

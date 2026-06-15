import { Scale, Users, Calendar, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: '1. Account Eligibility & Registration',
      content: 'To access certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete registration info. You are responsible for safeguarding your password and session tokens. You must immediately notify us of any unauthorized use of your account.',
    },
    {
      icon: Calendar,
      title: '2. Mentorship Bookings & Reschedules',
      content: 'Students can book availability slots made public by mentors. Bookings are subject to package terms, rates, and scheduling parameters. If a mentor requests a reschedule, the student may accept or reject the proposed slot. Cancellations must adhere to our platform guidelines to ensure fairness to both parties.',
    },
    {
      icon: Scale,
      title: '3. Acceptable Conduct & Prohibitions',
      content: 'You agree not to use the platform to harass, abuse, or spam other members. All communications and code reviews during sessions must remain professional. Recording sessions without explicit consent from both the student and mentor is strictly prohibited.',
    },
    {
      icon: AlertCircle,
      title: '4. Limitation of Liability',
      content: 'MentorOS provides the platform on an "as-is" basis. We do not guarantee employment, career outcomes, or specific learning achievements. We are not liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform or mentor advice.',
    },
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen pb-16">
      {/* Decorative Background Orbs */}
      <div className="orb-glow w-[500px] h-[500px] bg-orange-500 top-[-250px] left-1/2 -translate-x-1/2 opacity-20" />
      <div className="orb-glow w-[300px] h-[300px] bg-amber-600 bottom-[20%] right-[-100px] opacity-10" />

      <div className="max-w-[800px] mx-auto px-5 md:px-8 pt-24 space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-container">
            Terms & Conditions
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-secondary">
            Last Updated: June 15, 2026
          </p>
        </div>

        {/* Intro */}
        <div className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 text-xs sm:text-sm text-secondary leading-relaxed space-y-4">
          <p>
            Welcome to MentorOS. These Terms of Service govern your access to and use of our platform, website, and associated API services. By registering an account or using our platform, you agree to be bound by these terms.
          </p>
          <p>
            Please read these terms carefully. If you do not agree to these terms, you may not access or use our services.
          </p>
        </div>

        {/* Sections */}
        <section className="space-y-6">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div key={idx} className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-container/10 border border-primary-container/20 rounded-lg flex items-center justify-center text-primary-container flex-shrink-0">
                    <Icon size={16} />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-on-surface">{sec.title}</h2>
                </div>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed pl-11">
                  {sec.content}
                </p>
              </div>
            );
          })}
        </section>

        {/* Footer legal note */}
        <div className="text-center text-xs text-secondary pt-4">
          If you have any questions about these Terms of Service, please contact us at <span className="text-primary-container font-semibold">support@mentoros.com</span>.
        </div>
      </div>
    </div>
  );
}

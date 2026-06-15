import { Shield, Eye, Lock, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us when creating an account, booking a session, or communicating with mentors. This includes your name, email address, password, profile details (like current role, LinkedIn URL, skills), and payment transaction details. We do not store full credit card information directly, relying instead on secure payment processors.',
    },
    {
      icon: Shield,
      title: '2. How We Use Your Information',
      content: 'We use the collected information to operate, maintain, and improve our services, including matching learners with mentors, managing bookings, sending email notifications, processing payments, and verifying identity details. We may also use data to prevent fraudulent activities and ensure platform security.',
    },
    {
      icon: Lock,
      title: '3. Data Security & Storage',
      content: 'We employ industry-standard administrative, physical, and electronic security measures to protect your information from unauthorized access, loss, or alteration. Access tokens and session details are secured using encryption protocols. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.',
    },
    {
      icon: FileText,
      title: '4. Your Choices & Rights',
      content: 'You can update your profile details and change your account preferences at any time by logging into the platform and navigating to your profile dashboard. You also have the right to request deletion of your account and personal data, subject to legal and transactional record-keeping requirements.',
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
            Legal Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-secondary">
            Last Updated: June 15, 2026
          </p>
        </div>

        {/* Intro */}
        <div className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 text-xs sm:text-sm text-secondary leading-relaxed space-y-4">
          <p>
            At MentorOS, we value your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, and share your personal information when you use our platform, services, and website.
          </p>
          <p>
            By accessing or using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with any terms in this policy, please do not use our platform.
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
          If you have any questions about this Privacy Policy, please contact us at <span className="text-primary-container font-semibold">privacy@mentoros.com</span>.
        </div>
      </div>
    </div>
  );
}

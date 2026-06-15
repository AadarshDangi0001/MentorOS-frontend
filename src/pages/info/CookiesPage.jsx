import { HelpCircle, ShieldAlert, Settings, PieChart } from 'lucide-react';

export default function CookiesPage() {
  const cookieTypes = [
    {
      icon: Settings,
      name: 'Essential Cookies',
      purpose: 'Necessary for the platform to function. They handle user authentication, token sessions, and security verification.',
      expiry: 'Session / 7 days',
    },
    {
      icon: PieChart,
      name: 'Analytics & Performance',
      purpose: 'Allow us to recognize and count visitors, analyze traffic sources, and optimize page load speeds.',
      expiry: '30 days to 2 years',
    },
    {
      icon: ShieldAlert,
      name: 'Functional & Preferences',
      purpose: 'Used to remember settings, dashboard configurations, and other preferences you customize.',
      expiry: 'Up to 1 year',
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
            Data Privacy
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs text-secondary">
            Last Updated: June 15, 2026
          </p>
        </div>

        {/* Intro */}
        <div className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 text-xs sm:text-sm text-secondary leading-relaxed space-y-4">
          <p>
            This Cookie Policy explains how MentorOS uses cookies and similar tracking technologies when you visit our website or use our platform services. 
          </p>
          <p>
            Cookies are small text files placed on your device to collect standard internet log and visitor behavior information. We use them to enhance your login session security and deliver a personalized dashboard experience.
          </p>
        </div>

        {/* Cookie Categories */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-on-surface flex items-center gap-2">
            <HelpCircle size={18} className="text-primary-container" />
            How We Use Cookies
          </h2>
          <div className="space-y-4">
            {cookieTypes.map((cookie, idx) => {
              const Icon = cookie.icon;
              return (
                <div key={idx} className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 flex flex-col sm:flex-row gap-4 justify-between items-start hover:border-primary-container/30 transition-all duration-300">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 bg-primary-container/10 border border-primary-container/20 rounded-lg flex items-center justify-center text-primary-container flex-shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-on-surface">{cookie.name}</h3>
                      <p className="text-xs text-secondary leading-relaxed max-w-lg">{cookie.purpose}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-surface-container border border-border-strong text-secondary text-[10px] font-bold rounded-lg self-end sm:self-center">
                    {cookie.expiry}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing Note */}
        <div className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 text-xs text-secondary leading-relaxed">
          You can choose to disable cookies through your browser settings. However, doing so may prevent certain parts of the MentorOS platform (including login sessions and dashboards) from working correctly.
        </div>
      </div>
    </div>
  );
}

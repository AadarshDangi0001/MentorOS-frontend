import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Search, Calendar, Video, Award, ChevronDown, CheckCircle2, ShieldCheck, HelpCircle
} from 'lucide-react';

const faqs = [
  {
    question: "How do the video calls work?",
    answer: "Once a booking is confirmed by the mentor, a secure meeting link is generated. You can access this link directly from your Student Dashboard under 'Booked Sessions' and join the call at the scheduled time."
  },
  {
    question: "What if I need to cancel or reschedule a session?",
    answer: "Mentors can request a reschedule or cancel a session directly from their Dashboard. If a mentor proposes a new time, the student is notified and can choose to either Accept or Reject the new slot. Rejecting a reschedule request reverts the booking back to its original confirmed status."
  },
  {
    question: "How are payments handled?",
    answer: "We use secure payment gateways to collect booking amounts. Once a student books a session package and pays, the amount is held securely. It is credited to the mentor's lifetime earnings once the session is marked completed."
  },
  {
    question: "Can I book multiple sessions with the same mentor?",
    answer: "Absolutely! Mentors create 'Mentorship Packages' with specific durations (e.g., 30-minute quick chat, 60-minute system design mock interview) and prices. You can book individual packages or schedule recurring availability slots as offered by the mentor."
  },
  {
    question: "How can I apply to become a mentor?",
    answer: "Click the 'Become a Mentor' button, register your account as a Mentor, and complete your profile. Once our team reviews and approves your credentials (experience, company, expertise), you'll be able to set your availability slots, list mentorship packages, and start receiving bookings!"
  }
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Find Your Mentor',
      description: 'Filter mentors by skills, current company, role, or experience. View their comprehensive public profiles, package offerings, and student reviews to choose the perfect match.',
    },
    {
      number: '02',
      icon: Calendar,
      title: 'Book a Slot',
      description: 'Choose a mentorship package and select a convenient 60-minute availability slot. All availability slots are restricted to a 1-month window to ensure active scheduling.',
    },
    {
      number: '03',
      icon: Video,
      title: 'Learn & Grow',
      description: 'Join the video call directly from your dashboard. Discuss career roadmaps, conduct mock interviews, get code reviews, and receive personalized expert feedback.',
    },
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen pb-16">
      {/* Decorative Background Orbs */}
      <div className="orb-glow w-[500px] h-[500px] bg-orange-500 top-[-250px] left-1/2 -translate-x-1/2 opacity-20" />
      <div className="orb-glow w-[300px] h-[300px] bg-orange-600 bottom-[20%] right-[-100px] opacity-10" />

      <div className="max-w-[1100px] mx-auto px-5 md:px-8 pt-24 space-y-20 relative z-10">
        
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container text-[11px] font-bold uppercase tracking-wider rounded-full">
            <Award size={12} className="text-primary-container" />
            Simple. Transparent. 1:1 Guidance.
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-on-surface tracking-tight leading-none">
            How <span className="gradient-text">MentorOS</span> Works
          </h1>
          <p className="text-secondary text-base sm:text-lg leading-relaxed">
            Connecting ambitious learners with industry leaders for live 1-on-1 mentorship. 
            Accelerate your career learning, mock interviews, and system design skills.
          </p>
        </div>

        {/* Steps Grid */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-2xl font-black text-on-surface">The 3-Step Journey</h2>
            <p className="text-secondary text-xs mt-1">From discovery to growth in just a few clicks</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line for desktops */}
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-border-strong to-transparent z-[-1]" />
            
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="group bg-surface-container-lowest border border-border-strong rounded-2xl p-6 hover:border-primary-container/30 transition-all duration-300 shadow-md">
                  <div className="relative w-14 h-14 bg-surface-container-high border border-border-strong rounded-xl flex items-center justify-center mb-6 group-hover:border-primary-container/50 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] transition-all duration-300">
                    <Icon className="text-primary-container" size={24} />
                    <span className="absolute -top-2 -right-2 bg-primary-container text-on-primary-container text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2">{step.title}</h3>
                  <p className="text-xs text-secondary leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Roles Comparison: Student vs Mentor */}
        <section className="grid md:grid-cols-2 gap-8 pt-8">
          {/* Student details */}
          <div className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary-container">For Ambitious Learners</span>
              <h3 className="text-xl font-bold text-on-surface">Mentorship for Students</h3>
            </div>
            <ul className="space-y-3.5">
              {[
                "Search and filter by company (Google, Meta, Netflix, etc.) and specific tech stack expertise.",
                "Browse public mentor pages featuring full bios, reviews, and customized learning packages.",
                "Instantly book 1-on-1 virtual sessions in 1-hour slots matching your schedule.",
                "Secure payments via integrated gateways.",
                "Accept or Reject new timing suggestions if a mentor requests to reschedule.",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-secondary leading-relaxed">
                  <CheckCircle2 size={16} className="text-primary-container flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <button
                onClick={() => navigate('/explore')}
                className="btn-primary text-xs font-bold py-3 px-5 rounded-xl flex items-center gap-1.5"
              >
                Explore All Mentors <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Mentor details */}
          <div className="bg-surface-container-lowest border border-border-strong rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">For Industry Experts</span>
              <h3 className="text-xl font-bold text-on-surface">Mentoring on MentorOS</h3>
            </div>
            <ul className="space-y-3.5">
              {[
                "Create a profile with your background, title, hourly rate, and social handles.",
                "Define custom packages (e.g., career pivots, resume reviews, mock interviews).",
                "Define availability slots up to 1 month in advance, ensuring no overlapping bookings.",
                "Reschedule or Cancel bookings directly if personal commitments arise.",
                "Track your Lifetime Earnings, total sessions, average rate, and detailed payment history.",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-secondary leading-relaxed">
                  <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <button
                onClick={() => navigate('/auth/register?role=mentor')}
                className="w-full sm:w-auto border border-border-strong hover:border-primary-container/40 text-on-surface px-5 py-3 rounded-xl text-xs font-semibold hover:bg-white/3 transition-all duration-200"
              >
                Apply to Mentor
              </button>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-8 max-w-4xl mx-auto pt-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <HelpCircle className="text-primary-container" size={24} />
            </div>
            <h2 className="text-2xl font-black text-on-surface">Frequently Asked Questions</h2>
            <p className="text-secondary text-xs">Got questions? We've got answers.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-border-strong rounded-xl overflow-hidden bg-surface-container-lowest">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-on-surface hover:bg-white/3 transition-all cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={16} className={`text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-container' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 border-t border-border-strong' : 'max-h-0'}`}>
                    <p className="p-4 text-xs text-secondary leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* final CTA */}
        <section className="relative overflow-hidden p-8 md:p-12 border border-border-strong rounded-2xl bg-gradient-to-r from-surface-container-lowest to-surface-container text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-black text-on-surface">Ready to accelerate your growth?</h2>
          <p className="text-secondary text-xs sm:text-sm max-w-md mx-auto">
            Book a 1:1 session with leading engineers today or sign up to share your knowledge as a mentor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/explore')}
              className="btn-primary text-xs font-bold py-3 px-6 rounded-xl flex items-center gap-1.5"
            >
              Get Started Now <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/auth/register?role=mentor')}
              className="px-6 py-3 border border-border-strong hover:border-primary-container/40 text-on-surface text-xs font-semibold rounded-xl hover:bg-white/3 transition-all"
            >
              Become a Mentor
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

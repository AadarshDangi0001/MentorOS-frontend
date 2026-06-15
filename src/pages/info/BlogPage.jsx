import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

const posts = [
  {
    title: 'Cracking the System Design Interview: A Step-by-Step Guide',
    excerpt: 'System design interviews can feel like a black box. Learn the structured framework used by senior engineers to explain architectures clearly and scale services confidently.',
    category: 'Interview Prep',
    date: 'Jun 12, 2026',
    readTime: '6 min read',
    author: 'Sarah Chen (Meta Staff Engineer)',
  },
  {
    title: 'Transitioning from Junior to Senior Developer: What Actually Matters',
    excerpt: 'Moving up the ranks isn\'t just about writing more code. Discover the shift in mindset, communication, and technical ownership required to land a senior title.',
    category: 'Career Growth',
    date: 'Jun 05, 2026',
    readTime: '5 min read',
    author: 'Alex Rivera (Google Tech Lead)',
  },
  {
    title: 'How to Build an Effective Developer Portfolio in 2026',
    excerpt: 'Forget generic counter apps. We analyze the specific projects, structure, and writing style that make engineering recruiters pause and reach out for interviews.',
    category: 'Resume & Portfolio',
    date: 'May 28, 2026',
    readTime: '4 min read',
    author: 'Emma Watson (Tech Recruiter)',
  },
  {
    title: 'The Art of Mentorship: How to Get the Most Out of Your Sessions',
    excerpt: 'Mentorship is a two-way street. Learn how to define goals, prepare questions, and follow up effectively to turn brief calls into lifelong professional alliances.',
    category: 'Mentorship',
    date: 'May 15, 2026',
    readTime: '7 min read',
    author: 'David Kim (Netflix Engineering Manager)',
  },
];

export default function BlogPage() {
  return (
    <div className="w-full relative overflow-x-hidden min-h-screen pb-16">
      {/* Decorative Background Orbs */}
      <div className="orb-glow w-[500px] h-[500px] bg-orange-500 top-[-250px] left-1/2 -translate-x-1/2 opacity-20" />
      <div className="orb-glow w-[300px] h-[300px] bg-amber-600 bottom-[20%] right-[-100px] opacity-10" />

      <div className="max-w-[900px] mx-auto px-5 md:px-8 pt-24 space-y-16 relative z-10">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-container">
            Insights & Guides
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight leading-none">
            The <span className="gradient-text">MentorOS</span> Blog
          </h1>
          <p className="text-secondary text-sm sm:text-base leading-relaxed">
            Expert advice, industry insights, and practical guides to help you build your software engineering career.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <section className="space-y-6">
          {posts.map((post, idx) => (
            <article key={idx} className="group bg-surface-container-lowest border border-border-strong rounded-2xl p-6 sm:p-8 space-y-4 hover:border-primary-container/30 hover:shadow-md transition-all duration-300">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                <span className="px-2.5 py-0.5 bg-primary-container/10 border border-primary-container/20 text-primary-container rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="text-secondary flex items-center gap-1">
                  <Calendar size={12} />
                  {post.date}
                </span>
                <span className="text-secondary flex items-center gap-1">
                  <Clock size={12} />
                  {post.readTime}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-on-surface group-hover:text-primary-container transition-colors duration-200">
                {post.title}
              </h2>
              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                {post.excerpt}
              </p>
              <div className="border-t border-border-subtle pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xs text-secondary flex items-center gap-1.5">
                  <User size={13} className="text-primary-container" />
                  By {post.author}
                </span>
                <span className="text-xs font-bold text-primary-container flex items-center gap-1 group-hover:gap-1.5 transition-all duration-200 cursor-pointer">
                  Read Article <ArrowRight size={13} />
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

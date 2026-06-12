import React, { useState, useEffect, useCallback } from 'react';
import MentorCard from '../../components/mentor/MentorCard';
import BookingModal from '../../components/mentor/BookingModal';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-surface border border-border-strong rounded-2xl p-5 space-y-4">
    <div className="flex items-start gap-4">
      <div className="skeleton w-14 h-14 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="skeleton h-3 w-1/4 rounded-lg" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="skeleton h-6 w-20 rounded-lg" />
      <div className="skeleton h-6 w-16 rounded-lg" />
      <div className="skeleton h-6 w-24 rounded-lg" />
    </div>
    <div className="border-t border-border-strong pt-4 flex justify-between items-center">
      <div className="skeleton h-6 w-20 rounded-lg" />
      <div className="skeleton h-8 w-28 rounded-xl" />
    </div>
  </div>
);

export default function ExplorePage() {
  const [mentors, setMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingMentor, setBookingMentor] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { showError } = useToast();

  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.explore.list();
      if (response.success) {
        setMentors(response.data || []);
      }
    } catch (err) {
      showError('Failed to fetch mentors. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // Bug fix: empty deps, showError is stable from context

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const filteredMentors = mentors.filter((mentor) => {
    const name = mentor.user?.name || mentor.name || '';
    const company = mentor.company || '';
    const role = mentor.currentRole || mentor.role || '';
    const matchesSearch =
      !searchTerm ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase());

    const skills = mentor.expertise || mentor.skills || [];
    const matchesSkill = !selectedSkill ||
      skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase());

    return matchesSearch && matchesSkill;
  });

  const skillsList = Array.from(
    new Set(mentors.flatMap((m) => m.expertise || m.skills || []))
  ).sort();

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
  };

  const hasFilters = searchTerm || selectedSkill;

  const FilterSidebar = () => (
    <div className="bg-surface border border-border-strong rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary-container hover:underline cursor-pointer font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">
          Search
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Name, role, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-input border border-border-strong rounded-xl pl-9 pr-9 py-2.5 text-sm text-on-surface transition-all placeholder:text-secondary/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Skill Filter */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">
          Expertise
        </label>
        <div className="relative">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full appearance-none bg-surface-input border border-border-strong rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none pr-8 cursor-pointer transition-all"
          >
            <option value="">All Skills</option>
            {skillsList.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Active</p>
          <div className="flex flex-wrap gap-1.5">
            {searchTerm && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container text-[11px] font-semibold rounded-full">
                "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="cursor-pointer hover:opacity-70"><X size={10} /></button>
              </span>
            )}
            {selectedSkill && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container text-[11px] font-semibold rounded-full">
                {selectedSkill}
                <button onClick={() => setSelectedSkill('')} className="cursor-pointer hover:opacity-70"><X size={10} /></button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-24 pb-16 min-h-screen">
      {/* Page Header */}
      <div className="mb-10">
        <p className="text-xs text-primary-container font-bold uppercase tracking-widest mb-2">Discover</p>
        <h1 className="text-4xl font-black text-on-surface">
          Explore Mentors
        </h1>
        <p className="text-secondary mt-2">
          {loading ? 'Loading mentors...' : `${filteredMentors.length} mentor${filteredMentors.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Mobile Filters Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="flex items-center gap-2 px-4 py-2.5 border border-border-strong rounded-xl text-sm font-medium text-secondary hover:text-on-surface transition-all cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 bg-primary-container rounded-full text-[9px] font-bold text-on-primary-container flex items-center justify-center">
              {(searchTerm ? 1 : 0) + (selectedSkill ? 1 : 0)}
            </span>
          )}
        </button>
        {mobileFiltersOpen && (
          <div className="mt-3 animate-fade-in">
            <FilterSidebar />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-7">
        {/* Sidebar — Desktop only */}
        <aside className="hidden md:block md:col-span-1 space-y-5">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredMentors.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredMentors.map((mentor, index) => (
                <MentorCard
                  key={mentor._id || index}
                  mentorId={mentor.user?._id || mentor.user}
                  name={mentor.user?.name || mentor.name}
                  role={mentor.currentRole || mentor.role}
                  company={mentor.company}
                  avatarUrl={mentor.user?.avatar || mentor.avatarUrl}
                  rating={mentor.rating}
                  reviewsCount={mentor.totalReviews ?? mentor.reviewsCount}
                  skills={mentor.expertise || mentor.skills || []}
                  startingPrice={mentor.hourlyRate ?? mentor.startingPrice}
                  onBookSession={() => setBookingMentor(mentor)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-surface border border-border-strong rounded-2xl text-center">
              <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-5">
                <Search size={24} className="text-secondary" />
              </div>
              <p className="text-on-surface font-bold text-lg mb-2">No mentors found</p>
              <p className="text-secondary text-sm max-w-xs">
                Try adjusting your filters or clearing your search term.
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-5 btn-primary text-sm px-5 py-2.5 rounded-xl"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {bookingMentor && (
        <BookingModal mentor={bookingMentor} onClose={() => setBookingMentor(null)} />
      )}
    </div>
  );
}

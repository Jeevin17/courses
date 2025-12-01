import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { checkPrerequisites } from '../utils/prerequisites';
import { Search, Clock, BookOpen, ArrowUpRight, Book, Activity, CheckCircle, Lock } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Memoized Header Component
const CourseListHeader = memo(({ context }: { context: any }) => {
    const { domain, track, navigate, searchTerm, setSearchTerm, activeFilter, setActiveFilter, flatCoursesCount } = context;

    return (
        <div className="flex flex-col gap-6 mb-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight text-text-primary mb-2">
                        {domain === 'physics' ? 'Physics Curriculum' : 'Computer Science'}
                    </h1>
                    <p className="text-text-secondary max-w-xl">
                        {domain === 'physics'
                            ? "A comprehensive path from basics to advanced physics."
                            : "Master computer science through structured open-source curriculums."}
                    </p>
                </div>

                {/* Domain Switcher */}
                <div className="flex bg-glass-surface p-1 rounded-xl border border-glass-border">
                    <button
                        onClick={() => navigate('/courses/ossu')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${domain === 'cs'
                            ? 'bg-text-primary text-bg-void shadow-lg'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <Book size={16} /> Computer Science
                    </button>
                    <button
                        onClick={() => navigate('/courses/physics')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${domain === 'physics'
                            ? 'bg-text-primary text-bg-void shadow-lg'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <Activity size={16} /> Physics
                    </button>
                </div>
            </div>

            {/* Sub-Navigation (CS Only) */}
            {domain === 'cs' && (
                <div className="flex items-center gap-4 border-b border-text-primary/10 pb-1">
                    <button
                        onClick={() => navigate('/courses/ossu')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${track === 'ossu'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        OSSU Curriculum
                    </button>
                    <button
                        onClick={() => navigate('/courses/roadmap-sh')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${track === 'roadmap'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Roadmap.sh
                    </button>
                </div>
            )}

            {/* Large Search & Filters */}
            <div className="flex flex-col sm:flex-row justify-between w-full gap-4 items-center bg-glass-surface p-4 rounded-2xl border border-glass-border">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-bg-void border border-glass-border text-sm text-text-primary focus:outline-none focus:border-blue-500/50 transition-all placeholder-text-secondary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary font-mono">
                        {flatCoursesCount} items
                    </div>
                </div>
                <div className="flex gap-2">
                    {['all', 'todo', 'in-progress', 'completed'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${activeFilter === filter
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'text-text-secondary hover:text-text-primary hover:bg-text-primary/5'
                                }`}
                        >
                            {filter.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});

// Circular Progress Component
const CircularProgress = memo(({ percentage, size = 24, strokeWidth = 3, status }: { percentage: number, size?: number, strokeWidth?: number, status: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    // Force 100% visual if completed
    const visualOffset = status === 'completed' ? 0 : offset;
    const colorClass = status === 'completed' ? 'text-green-500' : 'text-blue-500';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-text-primary/10"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={visualOffset}
                    strokeLinecap="round"
                    className={`${colorClass} transition-all duration-500 ease-out`}
                />
            </svg>
            {status === 'completed' && (
                <CheckCircle size={size * 0.5} className={`absolute ${colorClass}`} />
            )}
        </div>
    );
});

// Memoized Course Card Component
const CourseCard = memo(({ course, isUnlocked, status, progressPercent }: { course: any, isUnlocked: boolean, status: string, progressPercent: number }) => {
    return (
        <div className="pb-6"> {/* Spacing wrapper */}
            <Link
                to={`/course/${course.id}`}
                className={`group relative p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[220px] h-full hover:-translate-y-1 hover:shadow-xl ${!isUnlocked
                    ? 'bg-glass-surface/30 border-red-500/10 hover:border-red-500/30'
                    : 'bg-glass-surface border-glass-border hover:border-blue-500/30'
                    }`}
            >
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-text-primary/5 px-2 py-1 rounded-md">
                            {course.provider || 'External'}
                        </span>

                        {/* Circular Progress Indicator */}
                        {!isUnlocked ? (
                            <Lock className="h-5 w-5 text-red-400" />
                        ) : (
                            <CircularProgress percentage={progressPercent} status={status} size={28} />
                        )}
                    </div>

                    <div className="mb-2 text-xs text-text-secondary opacity-50 uppercase tracking-widest font-bold">
                        {course.sectionTitle}
                    </div>

                    <h3 className={`font-bold text-lg leading-tight mb-3 ${!isUnlocked ? 'text-text-secondary' : 'text-text-primary group-hover:text-blue-400 transition-colors'}`}>
                        {course.title}
                    </h3>

                    <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                        {course.duration && (
                            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</div>
                        )}
                        {course.effort && (
                            <div className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.effort}</div>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-text-primary/5 flex items-center justify-between text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    <span>View Details</span>
                    <ArrowUpRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
            </Link>
        </div>
    );
});

export default function CourseList() {
    const navigate = useNavigate();
    const { curriculumId } = useParams();
    const { progress, getCourseProgress } = useOSSUStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isScrolled, setIsScrolled] = useState(false);
    const [visibleCount, setVisibleCount] = useState(20);

    // Navigation State
    const domain = curriculumId === 'physics' ? 'physics' : 'cs';
    const track = (curriculumId === 'roadmap-sh' || curriculumId === 'roadmap') ? 'roadmap' : 'ossu';

    useEffect(() => {
        if (!curriculumId) {
            navigate('/courses/ossu', { replace: true });
        }
    }, [curriculumId, navigate]);

    // Handle scroll for compact search overlay - Optimized with requestAnimationFrame
    useEffect(() => {
        let rafId: number | null = null;
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            if (rafId !== null) return;

            rafId = requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                if (Math.abs(currentScrollY - lastScrollY) > 10) {
                    setIsScrolled(currentScrollY > 150);
                    lastScrollY = currentScrollY;
                }
                rafId = null;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    // Reset visible count when filters/search change
    useEffect(() => {
        setVisibleCount(20);
    }, [searchTerm, activeFilter, domain, track]);

    const currentData = useMemo(() =>
        domain === 'physics' ? physicsData : (track === 'roadmap' ? roadmapShData : ossuData),
        [domain, track]);

    // Flatten and filter data
    const flatCourses = useMemo(() => {
        const items: any[] = [];
        currentData.forEach((section: any) => {
            const sectionItems = [...(section.courses || []), ...(section.topics || [])];
            sectionItems.forEach((item: any) => {
                const status = progress[item.id]?.status || 'todo';
                const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    section.title.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesFilter = activeFilter === 'all' || status === activeFilter;

                if (matchesSearch && matchesFilter) {
                    items.push({ ...item, sectionTitle: section.title });
                }
            });
        });
        return items;
    }, [currentData, searchTerm, activeFilter, progress]);

    const visibleCourses = useMemo(() => flatCourses.slice(0, visibleCount), [flatCourses, visibleCount]);
    const hasMore = visibleCount < flatCourses.length;

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => prev + 20);
    }, []);

    // Prepare context for header to avoid passing new object every render if not needed
    // However, since we pass primitives and simple functions, we can just pass them as props or memoize the object
    const headerContext = useMemo(() => ({
        domain, track, navigate, searchTerm, setSearchTerm, activeFilter, setActiveFilter, flatCoursesCount: flatCourses.length
    }), [domain, track, navigate, searchTerm, activeFilter, flatCourses.length]);

    return (
        <div className="w-full max-w-6xl mx-auto relative">
            {/* Compact Search Overlay */}
            <AnimatePresence>
                {isScrolled && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-4 right-4 md:top-6 md:left-auto md:right-6 md:w-auto z-50 flex items-center bg-glass-surface p-2 rounded-full border border-glass-border shadow-2xl backdrop-blur-xl border-blue-500/20"
                    >
                        <div className="relative w-full md:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full h-8 pl-9 pr-4 rounded-xl bg-bg-void border border-glass-border text-xs text-text-primary focus:outline-none focus:border-blue-500/50 transition-all placeholder-text-secondary/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Course Grid */}
            <div className="pb-20">
                <CourseListHeader context={headerContext} />

                {visibleCourses.length > 0 ? (
                    <>
                        <div
                            className="flex flex-wrap gap-6 mb-12"
                            style={{ contain: 'layout style paint' }}
                        >
                            {visibleCourses.map((course) => {
                                // We need to calculate these here to pass as props, or inside the component.
                                // Calculating here allows us to memoize the component based on props.
                                // checkPrerequisites depends on progress, which changes.
                                const isUnlocked = checkPrerequisites(course.id, progress);
                                const { status, progressPercent } = getCourseProgress(course.id);

                                return (
                                    <div key={course.id} className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                                        <CourseCard
                                            course={course}
                                            isUnlocked={isUnlocked}
                                            status={status}
                                            progressPercent={progressPercent}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-8 py-3 rounded-full bg-glass-surface border border-glass-border text-text-primary font-bold hover:bg-text-primary hover:text-bg-void transition-all shadow-lg hover:scale-105 active:scale-95"
                                >
                                    Load More ({flatCourses.length - visibleCount} remaining)
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center opacity-50 py-20">
                        <div className="w-16 h-16 rounded-full bg-text-primary/5 flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-text-secondary" />
                        </div>
                        <h3 className="text-lg font-medium text-text-primary">No courses found</h3>
                        <p className="text-text-secondary">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

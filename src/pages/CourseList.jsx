import { useState, useEffect, useMemo, forwardRef } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { checkPrerequisites } from '../utils/prerequisites';
import { Search, Clock, BookOpen, ArrowUpRight, Book, Activity, CheckCircle, Lock } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Grid Components for Virtuoso
const GridContainer = forwardRef(({ style, className, children, ...props }, ref) => (
    <div
        ref={ref}
        {...props}
        style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}
        className="w-full"
    >
        {children}
    </div>
));

const GridItem = forwardRef(({ children, ...props }, ref) => (
    <div
        ref={ref}
        {...props}
        className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
    >
        {children}
    </div>
));

export default function CourseList() {
    const navigate = useNavigate();
    const { curriculumId } = useParams();
    const { progress } = useOSSUStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isScrolled, setIsScrolled] = useState(false);

    // Navigation State
    const domain = curriculumId === 'physics' ? 'physics' : 'cs';
    const track = (curriculumId === 'roadmap-sh' || curriculumId === 'roadmap') ? 'roadmap' : 'ossu';

    useEffect(() => {
        if (!curriculumId) {
            navigate('/courses/ossu', { replace: true });
        }
    }, [curriculumId, navigate]);

    const currentData = useMemo(() =>
        domain === 'physics' ? physicsData : (track === 'roadmap' ? roadmapShData : ossuData),
        [domain, track]);

    // Flatten and filter data for virtualization
    const flatCourses = useMemo(() => {
        const items = [];
        currentData.forEach(section => {
            const sectionItems = [...(section.courses || []), ...(section.topics || [])];
            sectionItems.forEach(item => {
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

    // Render Item Function
    const renderCourseCard = (index) => {
        const course = flatCourses[index];
        const isUnlocked = checkPrerequisites(course.id, progress);
        const status = progress[course.id]?.status;

        return (
            <div className="pb-6"> {/* Spacing wrapper */}
                <Link
                    to={`/course/${course.id}`}
                    className={`group relative p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[220px] h-full hover:-translate-y-1 hover:shadow-xl ${!isUnlocked
                            ? 'bg-[var(--glass-surface)]/30 border-red-500/10 hover:border-red-500/30'
                            : 'bg-[var(--glass-surface)] border-[var(--glass-border)] hover:border-blue-500/30'
                        }`}
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--text-primary)]/5 px-2 py-1 rounded-md">
                                {course.provider || 'External'}
                            </span>
                            {status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : !isUnlocked ? (
                                <Lock className="h-4 w-4 text-red-400" />
                            ) : (
                                <div className="h-2 w-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>

                        <div className="mb-2 text-xs text-[var(--text-secondary)] opacity-50 uppercase tracking-widest font-bold">
                            {course.sectionTitle}
                        </div>

                        <h3 className={`font-bold text-lg leading-tight mb-3 ${!isUnlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] group-hover:text-blue-400 transition-colors'}`}>
                            {course.title}
                        </h3>

                        <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                            {course.duration && (
                                <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</div>
                            )}
                            {course.effort && (
                                <div className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.effort}</div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--text-primary)]/5 flex items-center justify-between text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                        <span>View Details</span>
                        <ArrowUpRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                </Link>
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 h-[calc(100vh-100px)] flex flex-col">

            {/* Header & Navigation (Fixed Height) */}
            <div className="flex-none flex flex-col gap-6 relative z-10">
                <AnimatePresence>
                    {!isScrolled && (
                        <motion.div
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                                <div>
                                    <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-2">
                                        {domain === 'physics' ? 'Physics Curriculum' : 'Computer Science'}
                                    </h1>
                                    <p className="text-[var(--text-secondary)] max-w-xl">
                                        {domain === 'physics'
                                            ? "A comprehensive path from basics to advanced physics."
                                            : "Master computer science through structured open-source curriculums."}
                                    </p>
                                </div>

                                {/* Domain Switcher */}
                                <div className="flex bg-[var(--glass-surface)] p-1 rounded-xl border border-[var(--glass-border)]">
                                    <button
                                        onClick={() => navigate('/courses/ossu')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${domain === 'cs'
                                                ? 'bg-[var(--text-primary)] text-[var(--bg-void)] shadow-lg'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <Book size={16} /> Computer Science
                                    </button>
                                    <button
                                        onClick={() => navigate('/courses/physics')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${domain === 'physics'
                                                ? 'bg-[var(--text-primary)] text-[var(--bg-void)] shadow-lg'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <Activity size={16} /> Physics
                                    </button>
                                </div>
                            </div>

                            {/* Sub-Navigation (CS Only) */}
                            {domain === 'cs' && (
                                <div className="flex items-center gap-4 border-b border-[var(--text-primary)]/10 pb-1 mb-6">
                                    <button
                                        onClick={() => navigate('/courses/ossu')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${track === 'ossu'
                                                ? 'border-blue-500 text-blue-400'
                                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        OSSU Curriculum
                                    </button>
                                    <button
                                        onClick={() => navigate('/courses/roadmap-sh')}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${track === 'roadmap'
                                                ? 'border-blue-500 text-blue-400'
                                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        Roadmap.sh
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search & Filters */}
                <motion.div
                    layout
                    className={`flex gap-4 items-center bg-[var(--glass-surface)] p-4 rounded-2xl border border-[var(--glass-border)] transition-all ${isScrolled ? 'flex-row justify-end shadow-lg' : 'flex-col sm:flex-row justify-between'
                        }`}
                >
                    <motion.div layout className={`relative ${isScrolled ? 'w-64' : 'w-full sm:w-96'}`}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-void)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-all placeholder-[var(--text-secondary)]/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </motion.div>
                    <motion.div layout className="flex gap-2">
                        {['all', 'todo', 'in-progress', 'completed'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${activeFilter === filter
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5'
                                    }`}
                            >
                                {filter.replace('-', ' ')}
                            </button>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Virtualized Course Grid (Flexible Height) */}
            <div className="flex-1 min-h-0">
                {flatCourses.length > 0 ? (
                    <VirtuosoGrid
                        style={{ height: '100%' }}
                        totalCount={flatCourses.length}
                        onScroll={(e) => {
                            const scrollTop = e.target.scrollTop;
                            setIsScrolled(scrollTop > 50);
                        }}
                        components={{
                            Item: GridItem,
                            List: GridContainer,
                        }}
                        itemContent={renderCourseCard}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <div className="w-16 h-16 rounded-full bg-[var(--text-primary)]/5 flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-[var(--text-secondary)]" />
                        </div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)]">No courses found</h3>
                        <p className="text-[var(--text-secondary)]">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

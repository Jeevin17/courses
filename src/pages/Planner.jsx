import { useState, useMemo } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, GripVertical, X, BookOpen, Clock, Plus, Search } from 'lucide-react';

export default function Planner() {
    const { progress, schedule, addToSchedule, removeFromSchedule, moveCourse, weeklyHours } = useOSSUStore();
    const [draggedCourse, setDraggedCourse] = useState(null);
    const [draggedFromDay, setDraggedFromDay] = useState(null);
    const [draggedFromIndex, setDraggedFromIndex] = useState(null);

    // Combine all courses for lookup
    const allCourses = useMemo(() => {
        const flatten = (items) => {
            let flat = [];
            items.forEach(item => {
                if (item.courses) flat.push(...item.courses);
                if (item.topics) {
                    flat.push(...item.topics);
                    flat.push(...flatten(item.topics));
                }
                if (item.id && item.title && !item.courses && !item.topics) flat.push(item);
            });
            return flat;
        };

        return [
            ...ossuData.flatMap(s => s.courses || []),
            ...flatten(roadmapShData),
            ...physicsData.flatMap(s => [...(s.courses || []), ...(s.topics || [])])
        ];
    }, []);

    const getCourseDetails = (courseId) => allCourses.find(c => c.id === courseId);

    // Filter available courses (In Progress or Todo)
    const availableCourses = useMemo(() => {
        return allCourses.filter(course => {
            const status = progress[course.id]?.status;
            return status === 'in-progress' || status === 'todo';
        });
    }, [allCourses, progress]);

    const handleDragStart = (e, courseId, fromDay = null, index = null) => {
        setDraggedCourse(courseId);
        setDraggedFromDay(fromDay);
        setDraggedFromIndex(index);
        e.dataTransfer.setData('courseId', courseId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetDay) => {
        e.preventDefault();
        const courseId = e.dataTransfer.getData('courseId');

        if (draggedFromDay) {
            // Moving within schedule
            if (draggedFromDay !== targetDay) {
                const success = moveCourse(draggedFromDay, targetDay, courseId, draggedFromIndex);
                if (!success) alert("Daily limit of 5 courses reached!");
            }
        } else {
            // Adding from sidebar
            if (!schedule[targetDay].includes(courseId)) {
                const success = addToSchedule(targetDay, courseId);
                if (!success) alert("Daily limit of 5 courses reached!");
            }
        }

        setDraggedCourse(null);
        setDraggedFromDay(null);
        setDraggedFromIndex(null);
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Mobile "Click to Move" State
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);

    const handleCourseClick = (courseId, fromDay = null, index = null) => {
        if (window.innerWidth < 1024) {
            setSelectedCourse({ courseId, fromDay, index });
            setShowMoveModal(true);
        }
    };

    const handleMoveSubmit = (targetDay) => {
        if (!selectedCourse) return;
        const { courseId, fromDay, index } = selectedCourse;

        if (fromDay) {
            if (fromDay !== targetDay) {
                const success = moveCourse(fromDay, targetDay, courseId, index);
                if (!success) alert("Daily limit of 5 courses reached!");
            }
        } else {
            if (!schedule[targetDay].includes(courseId)) {
                const success = addToSchedule(targetDay, courseId);
                if (!success) alert("Daily limit of 5 courses reached!");
            }
        }
        setShowMoveModal(false);
        setSelectedCourse(null);
    };

    // Add Course Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [addDay, setAddDay] = useState('Monday');

    const filteredAllCourses = useMemo(() => {
        if (!searchQuery) return [];
        return allCourses.filter(c =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 20);
    }, [allCourses, searchQuery]);

    const handleAddCourse = (courseId) => {
        const success = addToSchedule(addDay, courseId);
        if (!success) {
            alert("Daily limit of 5 courses reached!");
        } else {
            setShowAddModal(false);
            setSearchQuery('');
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                        <Calendar className="text-blue-500" /> Study Planner
                    </h1>
                    <p className="text-[var(--text-secondary)]">Drag and drop courses to organize your weekly schedule.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[var(--glass-surface)] px-4 py-2 rounded-xl border border-[var(--glass-border)]">
                        <Clock size={18} className="text-blue-400" />
                        <span className="font-bold text-[var(--text-primary)]">{weeklyHours}h Goal</span>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={20} /> <span className="hidden md:inline">Add Course</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)]">
                {/* Sidebar: Available Courses */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-4 flex flex-col overflow-hidden">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <BookOpen size={18} /> Active Courses
                    </h2>
                    <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                        {availableCourses.length > 0 ? availableCourses.map(course => (
                            <div
                                key={course.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, course.id)}
                                onClick={() => handleCourseClick(course.id)}
                                className="p-3 rounded-xl bg-[var(--bg-void)] border border-[var(--glass-border)] cursor-move hover:border-blue-500/50 transition-all group active:scale-95"
                            >
                                <div className="flex items-start gap-3">
                                    <GripVertical className="text-[var(--text-secondary)] mt-1 opacity-50 group-hover:opacity-100" size={16} />
                                    <div>
                                        <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">{course.title}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                                            {course.duration && <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-[var(--text-secondary)] text-sm py-8">
                                No active courses. Start a course or use "Add Course" to find one.
                            </div>
                        )}
                    </div>
                </div>

                {/* Main: Weekly Schedule */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-20">
                    {days.map(day => (
                        <div
                            key={day}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day)}
                            className={`min-h-[200px] rounded-2xl border border-[var(--glass-border)] p-4 transition-colors ${draggedCourse ? 'bg-[var(--glass-surface)]/50 border-dashed border-blue-500/30' : 'bg-[var(--glass-surface)]'
                                }`}
                        >
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">{day}</h3>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {schedule[day]?.map((courseId, index) => {
                                        const course = getCourseDetails(courseId);
                                        if (!course) return null;
                                        return (
                                            <motion.div
                                                key={`${day}-${courseId}-${index}`}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, courseId, day, index)}
                                                onClick={() => handleCourseClick(courseId, day, index)}
                                                className="relative p-3 rounded-xl bg-[var(--bg-void)] border border-[var(--glass-border)] group active:scale-95 cursor-pointer hover:border-blue-500/30 transition-colors"
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFromSchedule(day, index); }}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-full text-red-400 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <h4 className="text-sm font-medium text-[var(--text-primary)] pr-6 line-clamp-2">{course.title}</h4>
                                                <div className="mt-2 text-xs text-[var(--text-secondary)] flex items-center gap-2">
                                                    <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">{course.provider || 'OSSU'}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                {schedule[day]?.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-[var(--text-secondary)]/30 text-sm italic py-8 border-2 border-dashed border-[var(--text-secondary)]/10 rounded-xl">
                                        Drop courses here
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Move Modal (Mobile) */}
            {showMoveModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[var(--text-primary)]">Move to...</h3>
                            <button onClick={() => setShowMoveModal(false)}><X className="text-[var(--text-secondary)]" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => handleMoveSubmit(day)}
                                    className="p-3 rounded-xl bg-[var(--bg-void)] border border-[var(--glass-border)] hover:border-blue-500/50 text-left text-sm font-medium text-[var(--text-primary)] transition-colors"
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Course Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl text-[var(--text-primary)]">Add Course</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                            <div>
                                <label className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-1 block">Select Day</label>
                                <select
                                    value={addDay}
                                    onChange={(e) => setAddDay(e.target.value)}
                                    className="w-full bg-[var(--bg-void)] border border-[var(--glass-border)] rounded-xl p-3 text-[var(--text-primary)] focus:border-blue-500 outline-none"
                                >
                                    {days.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-1 block">Search Course</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Type to search..."
                                        className="w-full bg-[var(--bg-void)] border border-[var(--glass-border)] rounded-xl pl-10 p-3 text-[var(--text-primary)] focus:border-blue-500 outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] border border-[var(--glass-border)] rounded-xl p-2 bg-[var(--bg-void)]/30">
                                {filteredAllCourses.length > 0 ? (
                                    filteredAllCourses.map(course => (
                                        <button
                                            key={course.id}
                                            onClick={() => handleAddCourse(course.id)}
                                            className="w-full text-left p-3 rounded-lg hover:bg-[var(--glass-surface)] border border-transparent hover:border-[var(--glass-border)] transition-all group"
                                        >
                                            <div className="font-medium text-sm text-[var(--text-primary)] group-hover:text-blue-400">{course.title}</div>
                                            <div className="text-xs text-[var(--text-secondary)] mt-1">{course.provider} • {course.duration}</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center text-[var(--text-secondary)] py-8 flex flex-col items-center gap-2">
                                        <BookOpen size={24} className="opacity-20" />
                                        <span>{searchQuery ? 'No courses found' : 'Start typing to search...'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useMemo } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, GripVertical, X, BookOpen, Clock } from 'lucide-react';

export default function Planner() {
    const { progress, schedule, addToSchedule, removeFromSchedule, moveCourse } = useOSSUStore();
    const [draggedCourse, setDraggedCourse] = useState(null);
    const [draggedFromDay, setDraggedFromDay] = useState(null);
    const [draggedFromIndex, setDraggedFromIndex] = useState(null);

    // Combine all courses for lookup
    const allCourses = useMemo(() => {
        const all = [...ossuData, ...roadmapShData, ...physicsData];
        const courses = [];
        all.forEach(section => {
            const items = [...(section.courses || []), ...(section.topics || [])];
            items.forEach(item => courses.push(item));
        });
        return courses;
    }, []);

    const getCourseDetails = (courseId) => allCourses.find(c => c.id === courseId);

    // Filter available courses (In Progress or Todo)
    const availableCourses = useMemo(() => {
        return allCourses.filter(course => {
            const status = progress[course.id]?.status;
            // Filter out completed courses or courses already in schedule (optional)
            // For now, let's just show active courses
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
                moveCourse(draggedFromDay, targetDay, courseId, draggedFromIndex);
            }
        } else {
            // Adding from sidebar
            // Check if already in this day to prevent duplicates
            if (!schedule[targetDay].includes(courseId)) {
                addToSchedule(targetDay, courseId);
            }
        }

        setDraggedCourse(null);
        setDraggedFromDay(null);
        setDraggedFromIndex(null);
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="w-full max-w-7xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                    <Calendar className="text-blue-500" /> Study Planner
                </h1>
                <p className="text-[var(--text-secondary)]">Drag and drop courses to organize your weekly schedule.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)]">
                {/* Sidebar: Available Courses */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-4 flex flex-col overflow-hidden">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <BookOpen size={18} /> Available Courses
                    </h2>
                    <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                        {availableCourses.map(course => (
                            <div
                                key={course.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, course.id)}
                                className="p-3 rounded-xl bg-[var(--bg-void)] border border-[var(--glass-border)] cursor-move hover:border-blue-500/50 transition-all group"
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
                        ))}
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
                                                className="relative p-3 rounded-xl bg-[var(--bg-void)] border border-[var(--glass-border)] group"
                                            >
                                                <button
                                                    onClick={() => removeFromSchedule(day, index)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-full text-red-400 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <h4 className="text-sm font-medium text-[var(--text-primary)] pr-6">{course.title}</h4>
                                                <div className="mt-2 text-xs text-[var(--text-secondary)] flex items-center gap-2">
                                                    <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">{course.provider}</span>
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
        </div>
    );
}

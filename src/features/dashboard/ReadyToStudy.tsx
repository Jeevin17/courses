import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOSSUStore } from '../../hooks/useOSSUStore';
import { checkPrerequisites } from '../../utils/prerequisites';
import { ossuData } from '../../data/ossu-data';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

export const ReadyToStudy = () => {
    const { progress } = useOSSUStore();

    const readyCourses = useMemo(() => {
        const allCourses = ossuData.flatMap(section => section.courses);
        return allCourses.filter(course => {
            const status = progress[course.id]?.status;
            // Filter for courses that are NOT completed but ARE unlocked (prereqs met)
            return status !== 'completed' && checkPrerequisites(course.id, progress);
        }).slice(0, 5); // Limit to top 5
    }, [progress]);

    if (readyCourses.length === 0) {
        return (
            <div className="p-6 rounded-3xl glass-portal text-center">
                <h3 className="text-lg font-bold text-text-primary mb-2">All Caught Up!</h3>
                <p className="text-text-secondary text-sm">You've completed all available courses. Great job!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <BookOpen className="text-accent-glow" size={24} />
                    Ready to Study
                </h2>
                <span className="text-xs font-medium text-text-secondary bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    {readyCourses.length} Available
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyCourses.map((course, index) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            to={`/course/${course.id}`}
                            className="block group relative p-5 rounded-3xl glass-portal hover:border-accent-glow/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-glow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold text-accent-glow uppercase tracking-wider bg-accent-glow/10 px-2 py-1 rounded-lg">
                                        Next Up
                                    </span>
                                    <ArrowRight size={16} className="text-text-secondary group-hover:text-accent-glow transition-colors transform group-hover:translate-x-1" />
                                </div>

                                <h3 className="font-bold text-text-primary text-lg leading-tight mb-2 line-clamp-2">
                                    {course.title}
                                </h3>

                                <div className="flex items-center gap-3 text-xs text-text-secondary">
                                    <span className="flex items-center gap-1">
                                        <BookOpen size={12} /> {course.provider}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-text-secondary/30" />
                                    <span>{course.duration}</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

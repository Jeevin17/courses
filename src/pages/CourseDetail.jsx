import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import aiDetails from '../data/ai-course-details.json';
import { ArrowLeft, Clock, BookOpen, ExternalLink, CheckCircle, Play, Book } from 'lucide-react';
import { checkPrerequisites, getPrerequisite } from '../utils/prerequisites';
import { useMemo } from 'react';

export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { progress, updateStatus } = useOSSUStore();

    // Find course in all data sources
    // Helper to flatten data
    const flatten = (data) => {
        const items = [];
        data.forEach(section => {
            if (section.courses) items.push(...section.courses);
            if (section.topics) items.push(...section.topics);
        });
        return items;
    };

    const allCourses = useMemo(() => [
        ...flatten(ossuData),
        ...flatten(roadmapShData),
        ...flatten(physicsData)
    ], []);

    const course = allCourses.find(c => c.id === courseId);
    const aiInfo = aiDetails[courseId] || {};

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-[var(--text-primary)]">
                <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
                <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">Go Back</button>
            </div>
        );
    }

    const isUnlocked = checkPrerequisites(courseId, progress);
    const prereq = getPrerequisite(courseId);
    const status = progress[courseId]?.status || 'todo';

    return (
        <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pb-20">
            {/* Hero Section */}
            <div className="relative bg-[var(--glass-surface)] border-b border-[var(--glass-border)]">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 py-12 relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} /> Back to Curriculum
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                                    {course.provider || 'Self-Paced'}
                                </span>
                                {status === 'completed' && (
                                    <span className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase tracking-wider">
                                        <CheckCircle size={14} /> Completed
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                                {course.title}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-[var(--text-secondary)] text-sm">
                                {course.duration && (
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>{course.duration}</span>
                                    </div>
                                )}
                                {course.effort && (
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} />
                                        <span>{course.effort}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Card */}
                        <div className="w-full md:w-80 bg-[var(--bg-void)]/50 backdrop-blur-xl border border-[var(--glass-border)] p-6 rounded-2xl shadow-xl">
                            <div className="space-y-4">
                                <Link
                                    to={`/study?id=${courseId}`}
                                    onClick={(e) => { if (!isUnlocked && !confirm(`Prerequisites not met (${prereq?.title}). Start anyway?`)) e.preventDefault(); }}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isUnlocked
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                        : 'bg-[var(--glass-surface)] text-[var(--text-secondary)] border border-[var(--glass-border)]'
                                        }`}
                                >
                                    <Play size={18} fill="currentColor" />
                                    {status === 'completed' ? 'Review Course' : 'Start Learning'}
                                </Link>

                                {course.url && (
                                    <a
                                        href={course.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] transition-all border border-[var(--text-primary)]/10"
                                    >
                                        <ExternalLink size={18} />
                                        Visit Resource
                                    </a>
                                )}

                                <button
                                    onClick={() => updateStatus(courseId, status === 'completed' ? 'todo' : 'completed')}
                                    className={`w-full py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${status === 'completed' ? 'text-green-500' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {status === 'completed' ? 'Mark as Incomplete' : 'Mark as Completed'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-[1fr_300px] gap-12">
                <div className="space-y-12">
                    {/* Overview */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Book size={24} className="text-blue-400" />
                            Overview
                        </h2>
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                            {aiInfo.overview || course.description || "No description available."}
                        </p>
                    </section>

                    {/* Significance */}
                    {aiInfo.significance && (
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Why this matters</h2>
                            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl">
                                <p className="text-[var(--text-secondary)] italic">
                                    "{aiInfo.significance}"
                                </p>
                            </div>
                        </section>
                    )}

                    {/* What you will learn */}
                    {aiInfo.whatYouWillLearn && (
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">What you will learn</h2>
                            <ul className="grid gap-3">
                                {aiInfo.whatYouWillLearn.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)]">
                                        <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* AI Generated Sub-topics */}
                    {(course.subtopics || aiInfo.subtopics) && (
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                AI Generated Sub-topics
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {(course.subtopics || aiInfo.subtopics).map((topic, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:border-purple-500/30 transition-colors group">
                                        <h3 className="font-medium text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">
                                            {typeof topic === 'string' ? topic : topic.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar / Metadata */}
                <div className="space-y-8">
                    {!isUnlocked && prereq && (
                        <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
                            <h3 className="font-bold text-red-400 mb-2">Prerequisites Missing</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-4">
                                You should complete the following before starting this course:
                            </p>
                            <Link to={`/course/${prereq.id}`} className="block p-3 bg-[var(--bg-void)] rounded-xl border border-[var(--glass-border)] hover:border-red-500/30 transition-colors">
                                <div className="font-bold text-sm">{prereq.title}</div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ArrowLeft, LayoutDashboard, List, CheckCircle, Edit2, Plus, X } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';
import { Timer } from '../features/focus-mode/Timer';
import { AudioController } from '../features/focus-mode/AudioController';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyMode() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('id');
    const {
        updateStatus, addStudyTime, setStudyTime, getCourseProgress,
        activeSessions, findCourse
    } = useOSSUStore();

    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualMinutes, setManualMinutes] = useState(60);
    const [showSessionList, setShowSessionList] = useState(false);

    const activeSessionKeys = Object.keys(activeSessions || {});
    const hasActiveSessions = activeSessionKeys.length > 0;

    const course = courseId ? findCourse(courseId) : null;
    const courseProgress = courseId ? getCourseProgress(courseId) : null;

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleManualSubmit = () => {
        if (courseId) {
            addStudyTime(courseId, parseInt(manualMinutes.toString()) || 0);
            setShowManualEntry(false);
            setManualMinutes(60);
        }
    };

    // --- Render: Empty State / Session List ---
    if (!courseId) {
        return (
            <div className="min-h-screen bg-bg-void text-text-primary p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="void-bg"><div className="void-mesh"></div></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md space-y-6 w-full z-10"
                >
                    <div className="w-20 h-20 bg-glass-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-glass-border shadow-lg">
                        <LayoutDashboard size={40} className="text-text-secondary" />
                    </div>
                    <h1 className="text-3xl font-bold font-display text-glow">Ready to Focus?</h1>

                    {hasActiveSessions ? (
                        <div className="bg-glass-surface rounded-xl border border-glass-border p-4 text-left backdrop-blur-md">
                            <h3 className="text-xs font-bold text-text-secondary uppercase mb-3 tracking-wider">Active Sessions</h3>
                            <div className="space-y-2">
                                {activeSessionKeys.map(id => {
                                    const s = activeSessions[id];
                                    const c = findCourse(id);
                                    return (
                                        <Link
                                            key={id}
                                            to={`/study?id=${id}`}
                                            className="flex items-center justify-between p-3 bg-bg-void/50 rounded-lg hover:bg-glass-border transition-colors border border-transparent hover:border-glass-border"
                                        >
                                            <div className="flex items-center gap-3">
                                                {s.isActive ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> : <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
                                                <span className="font-medium truncate max-w-[200px]">{c?.title || 'Unknown Course'}</span>
                                            </div>
                                            <span className="font-mono text-sm">{formatTimer(s.timeLeft)}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-text-secondary">Select a course from your planner or curriculum to start a focus session.</p>
                    )}

                    <div className="flex gap-4 justify-center mt-8">
                        <Link to="/planner" className="btn-mirror">
                            Go to Planner
                        </Link>
                        <Link to="/courses/ossu" className="px-6 py-3 bg-glass-surface hover:bg-glass-border border border-glass-border rounded-xl transition-colors font-medium">
                            Browse Courses
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!course) return <div className="text-text-primary p-8 text-center">Course not found. <Link to="/courses/ossu" className="underline">Go back</Link></div>;

    return (
        <div className="min-h-screen bg-bg-void text-text-primary p-8 flex flex-col items-center relative overflow-hidden">
            <div className="void-bg"><div className="void-mesh"></div></div>

            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-12 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="flex items-center gap-4">
                    {/* Active Sessions Dropdown Trigger */}
                    {hasActiveSessions && (
                        <div className="relative">
                            <button
                                onClick={() => setShowSessionList(!showSessionList)}
                                className="flex items-center gap-2 px-3 py-2 bg-glass-surface rounded-lg border border-glass-border text-sm hover:bg-glass-border transition-colors backdrop-blur-md"
                            >
                                <List size={16} />
                                <span>{activeSessionKeys.length} Active</span>
                            </button>

                            <AnimatePresence>
                                {showSessionList && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full right-0 mt-2 w-64 bg-glass-surface backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl p-2 z-50"
                                    >
                                        {activeSessionKeys.map(id => {
                                            const s = activeSessions[id];
                                            const c = findCourse(id);
                                            return (
                                                <Link
                                                    key={id}
                                                    to={`/study?id=${id}`}
                                                    onClick={() => setShowSessionList(false)}
                                                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${id === courseId ? 'bg-accent-glow/20 text-accent-glow' : 'hover:bg-bg-void/50'}`}
                                                >
                                                    <span className="truncate text-sm max-w-[140px]">{c?.title}</span>
                                                    <span className="font-mono text-xs">{formatTimer(s.timeLeft)}</span>
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                    <AudioController />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl z-10">

                {/* Course Info */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold font-display text-glow">
                        {course.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
                        <span>{course.provider}</span>
                        <span>•</span>
                        <span>{course.duration}</span>
                    </div>
                </div>

                {/* Timer Component */}
                <Timer courseId={courseId} courseTitle={course.title} />

                {/* Progress Bar */}
                <div className="w-full bg-glass-surface p-6 rounded-2xl border border-glass-border relative group/progress backdrop-blur-md shadow-lg">
                    <div className="flex justify-between text-xs uppercase font-bold tracking-wider mb-2 text-text-secondary">
                        <span>Progress</span>
                        <span>{courseProgress ? Math.round(courseProgress.progressPercent) : 0}%</span>
                    </div>
                    <div className="h-2 bg-bg-void/50 rounded-full overflow-hidden mb-2">
                        <motion.div
                            className="h-full bg-accent-glow"
                            initial={{ width: 0 }}
                            animate={{ width: `${courseProgress ? courseProgress.progressPercent : 0}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-text-secondary">
                        <div className="flex items-center gap-2">
                            <span>{formatTime(courseProgress ? courseProgress.timeSpent : 0)} studied</span>
                            {/* Edit Button */}
                            <button
                                onClick={() => setShowManualEntry(true)}
                                className="opacity-0 group-hover/progress:opacity-100 transition-opacity text-accent-glow hover:text-white"
                                title="Edit / Add Time"
                            >
                                <Edit2 size={12} />
                            </button>
                        </div>
                        <span>Est. {formatTime(courseProgress ? courseProgress.totalMinutes : 0)} total</span>
                    </div>

                    {/* Completion Prompt */}
                    {courseProgress && courseProgress.progressPercent >= 90 && courseProgress.status !== 'completed' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between"
                        >
                            <span className="text-sm text-green-400">You're close to the estimated time! Finished?</span>
                            <button
                                onClick={() => updateStatus(courseId, 'completed')}
                                className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                                <CheckCircle size={12} /> Mark Complete
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Manual Entry Modal */}
                <AnimatePresence>
                    {showManualEntry && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-glass-surface border border-glass-border p-6 rounded-2xl w-80 shadow-2xl backdrop-blur-xl"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-text-primary">Log Offline Time</h3>
                                    <button onClick={() => setShowManualEntry(false)} className="text-text-secondary hover:text-text-primary">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-text-secondary uppercase font-bold">Add Minutes</label>
                                        <input
                                            type="number"
                                            value={manualMinutes}
                                            onChange={(e) => setManualMinutes(parseInt(e.target.value) || 0)}
                                            className="w-full bg-bg-void border border-glass-border rounded-lg p-2 mt-1 text-text-primary focus:border-accent-glow outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleManualSubmit}
                                        className="w-full py-2 bg-accent-glow text-black font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} /> Add Time
                                    </button>
                                    <div className="text-center">
                                        <button
                                            onClick={() => {
                                                if (confirm("Reset progress for this course to 0?")) {
                                                    setStudyTime(courseId, 0);
                                                    setShowManualEntry(false);
                                                }
                                            }}
                                            className="text-xs text-red-400 hover:text-red-300 underline"
                                        >
                                            Reset Progress (Undo All)
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* External Link */}
                <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-glow hover:underline text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                    Open Course Page ↗
                </a>

            </div>
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { Play, Pause, RotateCcw, ArrowLeft, Volume2, VolumeX, Settings, CheckCircle, Edit2, Plus, X, LayoutDashboard, List } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

// Audio Context for Brown Noise (Unchanged)
const AudioController = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioContextRef = useRef(null);
    const gainNodeRef = useRef(null);

    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const toggleAudio = () => {
        if (!isPlaying) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = ctx;
            const bufferSize = 4096;
            const whiteNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
            whiteNoise.onaudioprocess = (e) => {
                const output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5;
                }
            };
            let lastOut = 0;

            const gainNode = ctx.createGain();
            gainNode.gain.value = volume;
            gainNodeRef.current = gainNode;

            whiteNoise.connect(gainNode);
            gainNode.connect(ctx.destination);
            setIsPlaying(true);
        } else {
            audioContextRef.current.close();
            setIsPlaying(false);
        }
    };

    const handleVolumeChange = (e) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVol;
        }
    };

    return (
        <div className="flex items-center gap-4 bg-[var(--glass-surface)] p-3 rounded-xl border border-[var(--glass-border)]">
            <button onClick={toggleAudio} className="text-[var(--text-primary)] hover:text-[var(--accent-glow)] transition-colors">
                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            {isPlaying && (
                <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 accent-[var(--accent-glow)]"
                />
            )}
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">NOISE</span>
        </div>
    );
};

export default function StudyMode() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('id');
    const {
        progress, updateStatus, addStudyTime, setStudyTime, getCourseProgress,
        activeSessions, startSession, pauseSession, resumeSession, stopSession, findCourse
    } = useOSSUStore();

    const [customTime, setCustomTime] = useState(25);
    const [showSettings, setShowSettings] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualMinutes, setManualMinutes] = useState(60);
    const [showSessionList, setShowSessionList] = useState(false);

    // Combine all courses and topics from all data sources (using store helper if possible, but store helper is 'findCourse')
    // We need 'findCourse' to get title for the list.

    // Handle Navigation / Empty State
    // If no courseId, we stay on the "Ready to Focus" screen, but now we list active sessions there too.

    const activeSessionKeys = Object.keys(activeSessions || {});
    const hasActiveSessions = activeSessionKeys.length > 0;

    // Current Session Data
    const currentSession = activeSessions?.[courseId];
    const isSessionActive = !!currentSession;
    const timeLeft = isSessionActive ? currentSession.timeLeft : (customTime * 60);
    const isActive = isSessionActive ? currentSession.isActive : false;
    const isBreak = isSessionActive ? currentSession.isBreak : false;

    const course = courseId ? findCourse(courseId) : null;
    const courseProgress = courseId ? getCourseProgress(courseId) : null;

    // Handle Timer Finish (Client-side check for notification/sound)
    useEffect(() => {
        if (isSessionActive && timeLeft === 0 && !isBreak) {
            new Notification(`Focus time over for ${course?.title}! Take a break.`);
            stopSession(courseId);
            addStudyTime(courseId, currentSession.totalDuration);
        }
    }, [timeLeft, isSessionActive, isBreak, stopSession, addStudyTime, courseId, currentSession, course]);

    const handleToggleTimer = () => {
        if (isActive) {
            pauseSession(courseId);
        } else {
            if (isSessionActive) {
                resumeSession(courseId);
            } else {
                startSession(courseId, customTime);
            }
        }
    };

    const handleResetTimer = () => {
        stopSession(courseId);
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleManualSubmit = () => {
        addStudyTime(courseId, parseInt(manualMinutes) || 0);
        setShowManualEntry(false);
        setManualMinutes(60);
    };

    // --- Render: Empty State / Session List ---
    if (!courseId) {
        return (
            <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] p-8 flex flex-col items-center justify-center text-center">
                <div className="max-w-md space-y-6 w-full">
                    <div className="w-20 h-20 bg-[var(--glass-surface)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--glass-border)]">
                        <LayoutDashboard size={40} className="text-[var(--text-secondary)]" />
                    </div>
                    <h1 className="text-3xl font-bold">Ready to Focus?</h1>

                    {hasActiveSessions ? (
                        <div className="bg-[var(--glass-surface)] rounded-xl border border-[var(--glass-border)] p-4 text-left">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase mb-3">Active Sessions</h3>
                            <div className="space-y-2">
                                {activeSessionKeys.map(id => {
                                    const s = activeSessions[id];
                                    const c = findCourse(id);
                                    return (
                                        <Link
                                            key={id}
                                            to={`/study?id=${id}`}
                                            className="flex items-center justify-between p-3 bg-[var(--bg-void)] rounded-lg hover:bg-[var(--glass-border)] transition-colors"
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
                        <p className="text-[var(--text-secondary)]">Select a course from your planner or curriculum to start a focus session.</p>
                    )}

                    <div className="flex gap-4 justify-center mt-8">
                        <Link to="/planner" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                            Go to Planner
                        </Link>
                        <Link to="/courses/ossu" className="px-6 py-3 bg-[var(--glass-surface)] hover:bg-[var(--glass-border)] border border-[var(--glass-border)] rounded-xl transition-colors">
                            Browse Courses
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) return <div className="text-[var(--text-primary)] p-8 text-center">Course not found. <Link to="/courses/ossu" className="underline">Go back</Link></div>;

    return (
        <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] p-8 flex flex-col items-center relative">

            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-12 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="flex items-center gap-4">
                    {/* Active Sessions Dropdown Trigger */}
                    {hasActiveSessions && (
                        <div className="relative">
                            <button
                                onClick={() => setShowSessionList(!showSessionList)}
                                className="flex items-center gap-2 px-3 py-2 bg-[var(--glass-surface)] rounded-lg border border-[var(--glass-border)] text-sm hover:bg-[var(--glass-border)] transition-colors"
                            >
                                <List size={16} />
                                <span>{activeSessionKeys.length} Active</span>
                            </button>

                            {showSessionList && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--glass-surface)] backdrop-blur-xl border border-[var(--glass-border)] rounded-xl shadow-2xl p-2 z-50">
                                    {activeSessionKeys.map(id => {
                                        const s = activeSessions[id];
                                        const c = findCourse(id);
                                        return (
                                            <Link
                                                key={id}
                                                to={`/study?id=${id}`}
                                                onClick={() => setShowSessionList(false)}
                                                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${id === courseId ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-[var(--bg-void)]'}`}
                                            >
                                                <span className="truncate text-sm max-w-[140px]">{c?.title}</span>
                                                <span className="font-mono text-xs">{formatTimer(s.timeLeft)}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                    <AudioController />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl">

                {/* Course Info */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
                        {course.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-sm text-[var(--text-secondary)]">
                        <span>{course.provider}</span>
                        <span>•</span>
                        <span>{course.duration}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[var(--glass-surface)] p-6 rounded-2xl border border-[var(--glass-border)] relative group/progress">
                    <div className="flex justify-between text-xs uppercase font-bold tracking-wider mb-2 text-[var(--text-secondary)]">
                        <span>Progress</span>
                        <span>{Math.round(courseProgress.progressPercent)}%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-void)] rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-[var(--accent-glow)] transition-all duration-1000"
                            style={{ width: `${courseProgress.progressPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                            <span>{formatTime(courseProgress.timeSpent)} studied</span>
                            {/* Edit Button */}
                            <button
                                onClick={() => setShowManualEntry(true)}
                                className="opacity-0 group-hover/progress:opacity-100 transition-opacity text-[var(--accent-glow)] hover:text-white"
                                title="Edit / Add Time"
                            >
                                <Edit2 size={12} />
                            </button>
                        </div>
                        <span>Est. {formatTime(courseProgress.totalMinutes)} total</span>
                    </div>

                    {/* Completion Prompt */}
                    {courseProgress.progressPercent >= 90 && courseProgress.status !== 'completed' && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-green-400">You're close to the estimated time! Finished?</span>
                            <button
                                onClick={() => updateStatus(courseId, 'completed')}
                                className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                                <CheckCircle size={12} /> Mark Complete
                            </button>
                        </div>
                    )}
                </div>

                {/* Manual Entry Modal */}
                {showManualEntry && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] p-6 rounded-2xl w-80 shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-[var(--text-primary)]">Log Offline Time</h3>
                                <button onClick={() => setShowManualEntry(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-[var(--text-secondary)] uppercase font-bold">Add Minutes</label>
                                    <input
                                        type="number"
                                        value={manualMinutes}
                                        onChange={(e) => setManualMinutes(e.target.value)}
                                        className="w-full bg-[var(--bg-void)] border border-[var(--glass-border)] rounded-lg p-2 mt-1 text-[var(--text-primary)] focus:border-[var(--accent-glow)] outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleManualSubmit}
                                    className="w-full py-2 bg-[var(--accent-glow)] text-black font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
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
                        </div>
                    </div>
                )}

                {/* Timer Circle */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-[var(--accent-glow)] blur-[100px] opacity-20 rounded-full"></div>
                    <div className="relative w-80 h-80 rounded-full bg-[var(--glass-surface)] border border-[var(--glass-border)] flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl">

                        <div className="text-7xl font-mono font-bold tracking-tighter tabular-nums mb-4 text-[var(--text-primary)]" style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                            {formatTimer(timeLeft)}
                        </div>

                        <div className="text-[var(--accent-glow)] font-medium tracking-widest uppercase text-sm mb-8">
                            {isBreak ? 'Break Time' : (isActive ? 'Focus Session' : 'Ready')}
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={handleToggleTimer}
                                className="w-16 h-16 rounded-full bg-[var(--text-primary)] text-[var(--bg-void)] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[var(--text-primary)]/20"
                            >
                                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                            </button>
                            <button
                                onClick={handleResetTimer}
                                className="w-12 h-12 rounded-full bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--text-primary)]/10 hover:text-[var(--text-primary)] transition-all"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>

                        {/* Settings Toggle */}
                        <div className="absolute bottom-8 flex gap-4">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                title="Timer Settings"
                            >
                                <Settings size={16} />
                            </button>
                            <button
                                onClick={() => setShowManualEntry(true)}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                title="Log Offline Time"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="flex items-center gap-4 bg-[var(--glass-surface)] p-4 rounded-xl border border-[var(--glass-border)] animate-in fade-in slide-in-from-top-4">
                        <span className="text-sm font-medium">Focus Duration (min):</span>
                        <input
                            type="number"
                            value={customTime}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 25;
                                setCustomTime(val);
                            }}
                            className="w-16 bg-[var(--bg-void)] border border-[var(--glass-border)] rounded px-2 py-1 text-center focus:outline-none focus:border-[var(--accent-glow)]"
                        />
                    </div>
                )}

                {/* External Link */}
                <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-glow)] hover:underline text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                    Open Course Page ↗
                </a>

            </div>
        </div>
    );
}

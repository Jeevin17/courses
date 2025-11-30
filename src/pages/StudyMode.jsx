import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ossuData } from '../data/ossu-data';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { Play, Pause, RotateCcw, ArrowLeft, Volume2, VolumeX, Settings, CheckCircle, Edit2, Plus, X } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

// Audio Context for Brown Noise
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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('id');
    const { progress, updateStatus, addStudyTime, setStudyTime, getCourseProgress } = useOSSUStore();

    const [timer, setTimer] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [customTime, setCustomTime] = useState(25);
    const [showSettings, setShowSettings] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualMinutes, setManualMinutes] = useState(60);

    // Track session time to commit on pause/stop
    const sessionTimeRef = useRef(0);

    // Combine all courses and topics from all data sources
    const allItems = [
        ...ossuData.flatMap(s => s.courses || []),
        ...roadmapShData.flatMap(s => [...(s.courses || []), ...(s.topics || [])]),
        ...physicsData.flatMap(s => [...(s.courses || []), ...(s.topics || [])])
    ];

    const course = allItems.find(c => c.id === courseId);
    const courseProgress = getCourseProgress(courseId);

    useEffect(() => {
        let interval = null;
        if (isActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((timer) => timer - 1);
                // Accumulate session time (in minutes)
                if (!isBreak) {
                    sessionTimeRef.current += 1 / 60;
                }
            }, 1000);
        } else if (timer === 0) {
            setIsActive(false);
            if (!isBreak) {
                // Commit time when timer finishes
                addStudyTime(courseId, Math.round(sessionTimeRef.current));
                sessionTimeRef.current = 0;
                setIsBreak(true);
                setTimer(5 * 60);
                new Notification("Focus time over! Take a break.");
            } else {
                setIsBreak(false);
                setTimer(customTime * 60);
                new Notification("Break over! Back to work.");
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timer, isBreak, customTime, courseId, addStudyTime]);

    // Commit time when pausing or leaving
    const handlePause = () => {
        setIsActive(false);
        if (sessionTimeRef.current > 0.5) { // Only save if > 30 seconds
            addStudyTime(courseId, Math.round(sessionTimeRef.current));
            sessionTimeRef.current = 0;
        }
    };

    const toggleTimer = () => {
        if (isActive) {
            handlePause();
        } else {
            setIsActive(true);
        }
    };

    const resetTimer = () => {
        handlePause(); // Save any pending time
        setIsActive(false);
        setIsBreak(false);
        setTimer(customTime * 60);
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

    if (!course) return <div className="text-[var(--text-primary)]">Course not found</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] p-8 flex flex-col items-center">

            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-12">
                <button
                    onClick={() => { handlePause(); navigate(-1); }}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>
                <div className="flex items-center gap-4">
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
                                            // Simple "Undo" / Reset logic for now - could be more complex later
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
                            {formatTimer(timer)}
                        </div>

                        <div className="text-[var(--accent-glow)] font-medium tracking-widest uppercase text-sm mb-8">
                            {isBreak ? 'Break Time' : 'Focus Session'}
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={toggleTimer}
                                className="w-16 h-16 rounded-full bg-[var(--text-primary)] text-[var(--bg-void)] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[var(--text-primary)]/20"
                            >
                                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                            </button>
                            <button
                                onClick={resetTimer}
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
                                if (!isActive && !isBreak) setTimer(val * 60);
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

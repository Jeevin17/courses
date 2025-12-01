import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { useOSSUStore } from '../../hooks/useOSSUStore';

interface TimerProps {
    courseId: string;
    courseTitle: string;
}

export const Timer = ({ courseId, courseTitle }: TimerProps) => {
    const { activeSessions, startSession, pauseSession, resumeSession, stopSession, addStudyTime } = useOSSUStore();

    const [customTime, setCustomTime] = useState(25);
    const [showSettings, setShowSettings] = useState(false);

    const currentSession = activeSessions?.[courseId];
    const isSessionActive = !!currentSession;
    const timeLeft = isSessionActive ? currentSession.timeLeft : (customTime * 60);
    const isActive = isSessionActive ? currentSession.isActive : false;
    const isBreak = isSessionActive ? currentSession.isBreak : false;

    // Handle Timer Finish
    useEffect(() => {
        if (isSessionActive && timeLeft === 0 && !isBreak) {
            new Notification(`Focus time over for ${courseTitle}! Take a break.`);
            stopSession(courseId);
            addStudyTime(courseId, currentSession.totalDuration);
        }
    }, [timeLeft, isSessionActive, isBreak, stopSession, addStudyTime, courseId, currentSession, courseTitle]);

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

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative group flex flex-col items-center justify-center">
            {/* Liquid Glow Background */}
            <motion.div
                className="absolute inset-0 bg-accent-glow blur-[100px] rounded-full -z-10"
                animate={{
                    opacity: isActive ? [0.2, 0.4, 0.2] : 0.1,
                    scale: isActive ? [1, 1.1, 1] : 1
                }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Glass Container */}
            <div className="relative w-80 h-80 rounded-full bg-glass-surface border border-glass-border flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl overflow-hidden">

                {/* Liquid Wave Animation inside */}
                {isActive && (
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-accent-glow/10"
                        initial={{ height: "0%" }}
                        animate={{ height: `${(timeLeft / (currentSession?.totalDuration * 60)) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                    />
                )}

                <motion.div
                    key={timeLeft}
                    initial={{ opacity: 0.5, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-7xl font-mono font-bold tracking-tighter tabular-nums mb-4 text-text-primary z-10"
                    style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}
                >
                    {formatTimer(timeLeft)}
                </motion.div>

                <div className="text-accent-glow font-medium tracking-widest uppercase text-sm mb-8 z-10">
                    {isBreak ? 'Break Time' : (isActive ? 'Focus Session' : 'Ready')}
                </div>

                <div className="flex items-center gap-6 z-10">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggleTimer}
                        className="w-16 h-16 rounded-full bg-text-primary text-bg-void flex items-center justify-center shadow-lg shadow-text-primary/20"
                    >
                        {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1, rotate: -90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => stopSession(courseId)}
                        className="w-12 h-12 rounded-full bg-glass-surface border border-glass-border text-text-secondary flex items-center justify-center hover:bg-text-primary/10 hover:text-text-primary transition-all"
                    >
                        <RotateCcw size={20} />
                    </motion.button>
                </div>

                {/* Settings Toggle */}
                <div className="absolute bottom-8 flex gap-4 z-10">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                        title="Timer Settings"
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute -bottom-20 flex items-center gap-4 bg-glass-surface p-4 rounded-xl border border-glass-border backdrop-blur-md z-20"
                    >
                        <span className="text-sm font-medium text-text-primary">Duration (min):</span>
                        <input
                            type="number"
                            value={customTime}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 25;
                                setCustomTime(val);
                            }}
                            className="w-16 bg-bg-void border border-glass-border rounded px-2 py-1 text-center focus:outline-none focus:border-accent-glow text-text-primary"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { ossuData } from '../data/ossu-data';
import { exportData, importData } from '../utils/dataPersistence';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Activity, ArrowRight, Sparkles, Play, Settings, Clock, Calendar, Atom, Book, Download, Upload, FileJson, Flame, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { roadmapShData } from '../data/roadmap-sh-data';
import { physicsData } from '../data/physics-data';

export default function Dashboard() {
    const { progress, theme, toggleTheme, importState, streak, badges, weeklyHours } = useOSSUStore();
    const [activeCurriculum, setActiveCurriculum] = useState('ossu'); // 'ossu', 'roadmap-sh', 'physics'

    // --- Data Calculation ---
    const currentData = activeCurriculum === 'ossu' ? ossuData :
        activeCurriculum === 'physics' ? physicsData : roadmapShData;

    const allCourses = currentData.flatMap(section => section.courses || section.topics || []);
    const totalCourses = allCourses.length;
    const completedCourses = allCourses.filter(c => progress[c.id]?.status === 'completed').length;
    const inProgressCourses = allCourses.filter(c => progress[c.id]?.status === 'in-progress').length;
    const completionRate = Math.round((completedCourses / totalCourses) * 100) || 0;

    const AVG_COURSE_HOURS = 60;
    const totalEstimatedHours = totalCourses * AVG_COURSE_HOURS;
    const completedHours = completedCourses * AVG_COURSE_HOURS;
    const remainingHours = totalEstimatedHours - completedHours;
    const weeksToCompletion = Math.ceil(remainingHours / weeklyHours);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (weeksToCompletion * 7));

    // Generate Graph Data
    const graphData = [];
    const today = new Date();
    for (let i = 0; i <= 6; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() + i);
        const projectedProgress = Math.min(100, completionRate + ((weeklyHours * 4 * i) / totalEstimatedHours * 100));
        graphData.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            actual: i === 0 ? completionRate : null,
            projected: Math.round(projectedProgress)
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full max-w-4xl relative group space-y-8"
        >
            {/* Central Portal */}
            <div className="glass-portal rounded-[40px] overflow-hidden flex flex-col items-center text-center p-8 md:p-12 transition-all duration-700 group-hover:border-[var(--text-primary)]/20 group-hover:shadow-[0_0_100px_-20px_var(--accent-glow)] relative">



                {/* Hero Section */}
                <div className="relative z-20 space-y-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 text-xs font-medium text-blue-400 tracking-wider uppercase"
                    >
                        <Sparkles size={12} /> {activeCurriculum === 'physics' ? 'Physics Tracker' : 'Computer Science Tracker'}
                    </motion.div>
                    {/* Curriculum Selector */}
                    <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-md">
                        {/* Computer Science Subtree */}
                        <div className="w-full bg-[var(--text-primary)]/5 rounded-2xl p-4 border border-[var(--text-primary)]/10">
                            <div className="flex items-center gap-2 mb-3 px-2">
                                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Book size={16} />
                                </div>
                                <span className="text-sm font-bold text-[var(--text-primary)] tracking-wide">Computer Science</span>
                            </div>
                            <div className="flex gap-2 pl-2">
                                <div className="w-0.5 bg-[var(--text-primary)]/10 rounded-full my-1 ml-3 mr-3"></div>
                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => setActiveCurriculum('ossu')}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${activeCurriculum === 'ossu'
                                            ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)] shadow-sm border border-[var(--text-primary)]/10'
                                            : 'hover:bg-[var(--text-primary)]/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${activeCurriculum === 'ossu' ? 'bg-blue-400' : 'bg-[var(--text-secondary)]/30'}`}></span>
                                            OSSU Curriculum
                                        </span>
                                        {activeCurriculum === 'ossu' && <CheckCircle size={14} className="text-blue-400" />}
                                    </button>
                                    <button
                                        onClick={() => setActiveCurriculum('roadmap-sh')}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${activeCurriculum === 'roadmap-sh'
                                            ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)] shadow-sm border border-[var(--text-primary)]/10'
                                            : 'hover:bg-[var(--text-primary)]/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${activeCurriculum === 'roadmap-sh' ? 'bg-blue-400' : 'bg-[var(--text-secondary)]/30'}`}></span>
                                            Roadmap.sh
                                        </span>
                                        {activeCurriculum === 'roadmap-sh' && <CheckCircle size={14} className="text-blue-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Physics Subtree */}
                        <div className="w-full bg-[var(--text-primary)]/5 rounded-2xl p-4 border border-[var(--text-primary)]/10">
                            <div className="flex items-center gap-2 mb-3 px-2">
                                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                                    <Atom size={16} />
                                </div>
                                <span className="text-sm font-bold text-[var(--text-primary)] tracking-wide">Physics</span>
                            </div>
                            <div className="flex gap-2 pl-2">
                                <div className="w-0.5 bg-[var(--text-primary)]/10 rounded-full my-1 ml-3 mr-3"></div>
                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => setActiveCurriculum('physics')}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${activeCurriculum === 'physics'
                                            ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)] shadow-sm border border-[var(--text-primary)]/10'
                                            : 'hover:bg-[var(--text-primary)]/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${activeCurriculum === 'physics' ? 'bg-purple-400' : 'bg-[var(--text-secondary)]/30'}`}></span>
                                            Standard Curriculum
                                        </span>
                                        {activeCurriculum === 'physics' && <CheckCircle size={14} className="text-purple-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-[var(--text-primary)] text-glow">
                        Your Path<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-primary)]/40">To Mastery</span>
                    </h1>

                    <div className="flex items-center justify-center gap-12 pt-4">
                        <div className="text-center">
                            <div className="text-6xl font-bold tracking-tighter text-[var(--text-primary)]/90">{completionRate}%</div>
                            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-1">Completed</div>
                        </div>
                        <div className="w-px h-16 bg-[var(--text-primary)]/10"></div>
                        <div className="text-center">
                            <div className="text-6xl font-bold tracking-tighter text-[var(--text-primary)]/90">{weeksToCompletion}</div>
                            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mt-1">Weeks Left</div>
                        </div>
                    </div>
                </div>

                {/* Gamification Stats */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 font-bold">
                        <Flame size={18} fill="currentColor" />
                        <span>{streak} Day Streak</span>
                    </div>
                </div>

                {/* Badges Section */}
                {badges.length > 0 && (
                    <div className="mb-8 p-4 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl inline-block">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                            <Award size={14} /> Achievements
                        </h3>
                        <div className="flex justify-center gap-3">
                            {badges.includes('first-step') && (
                                <div className="group relative p-2 bg-blue-500/10 rounded-xl border border-blue-500/20" title="First Step: Complete 1 Course">
                                    <BookOpen size={20} className="text-blue-400" />
                                </div>
                            )}
                            {badges.includes('on-fire') && (
                                <div className="group relative p-2 bg-orange-500/10 rounded-xl border border-orange-500/20" title="On Fire: 3 Day Streak">
                                    <Flame size={20} className="text-orange-400" />
                                </div>
                            )}
                            {badges.includes('unstoppable') && (
                                <div className="group relative p-2 bg-purple-500/10 rounded-xl border border-purple-500/20" title="Unstoppable: 7 Day Streak">
                                    <Sparkles size={20} className="text-purple-400" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projection Graph */}
                <div className="w-full h-64 relative z-20 mb-8">
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4 flex items-center justify-center gap-2">
                        <Activity size={16} className="text-blue-400" /> Projected Completion
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={graphData}>
                            <defs>
                                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-void)',
                                    borderColor: 'var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)'
                                }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Area type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProjected)" />
                            <Line type="monotone" dataKey="actual" stroke="var(--text-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--text-primary)' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Ghost Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md z-20">
                    <Link to={`/courses/${activeCurriculum}`} className="w-full btn h-12 rounded-full bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/10 text-[var(--text-primary)] font-medium flex items-center justify-center gap-2 transition-all">
                        <BookOpen size={18} /> Browse Curriculum
                    </Link>
                    {inProgressCourses > 0 && (
                        <Link to="/study" className="w-full btn h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                            <Play size={18} fill="currentColor" /> Resume Focus
                        </Link>
                    )}
                </div>

                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
            </div>


        </motion.div >
    );
}

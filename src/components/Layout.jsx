import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, LibraryBig, Sun, Moon, Network, Calendar, Settings as SettingsIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOSSUStore } from '../hooks/useOSSUStore';

export default function Layout({ children }) {
    const location = useLocation();
    const { theme, toggleTheme, activeSessions, announcement, dismissAnnouncement } = useOSSUStore();

    const activeSessionKeys = Object.keys(activeSessions || {});
    const hasActiveSession = activeSessionKeys.length > 0;
    const singleSessionId = activeSessionKeys.length === 1 ? activeSessionKeys[0] : null;

    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/courses/ossu', label: 'Curriculum', icon: BookOpen },
        { path: '/planner', label: 'Planner', icon: Calendar },
        { path: '/graph', label: 'Network', icon: Network },
        // Smart Link: If single session, go to it. If multiple or none, go to /study
        { path: singleSessionId ? `/study?id=${singleSessionId}` : '/study', label: 'Focus', icon: GraduationCap },
        { path: '/settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen font-sans text-[var(--text-primary)] relative flex flex-col items-center overflow-x-hidden transition-colors duration-500">

            {/* Cinematic Container / Void Background */}
            <div className="void-bg">
                <div className="void-mesh"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* --- Desktop/Tablet Floating Dock (Hidden on Mobile) --- */}
            <header className="hidden md:flex fixed top-6 z-50">
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex items-center gap-1 p-1.5 rounded-full bg-[var(--glass-surface)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-2xl transition-all duration-500"
                >
                    {/* Logo Icon */}
                    <Link to="/" className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mr-2 hover:scale-105 transition-transform">
                        <LibraryBig size={20} className="text-white" />
                    </Link>

                    {/* Nav Items */}
                    {navItems.map((item) => {
                        const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="dock-pill-desktop"
                                        className="absolute inset-0 bg-[var(--text-primary)]/5 rounded-full border border-[var(--text-primary)]/5"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                                    <item.icon size={16} />
                                    <span>{item.label}</span>
                                </span>
                            </Link>
                        );
                    })}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all ml-2"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </motion.nav>
            </header>

            {/* --- Mobile Top Header --- */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-[var(--bg-void)] via-[var(--bg-void)]/80 to-transparent backdrop-blur-sm">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <LibraryBig size={16} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight">Course Tracker</span>
                </Link>
                <button
                    onClick={toggleTheme}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--text-primary)]/5"
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </header>

            {/* --- Mobile Bottom Navigation --- */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--glass-surface)] backdrop-blur-2xl border-t border-[var(--glass-border)] pb-safe">
                <div className="flex justify-around items-center p-2">
                    {navItems.map((item) => {
                        const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center w-full py-2 group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="dock-pill-mobile"
                                        className="absolute top-0 w-8 h-1 bg-blue-500 rounded-b-full shadow-[0_0_10px_var(--accent-glow)]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={`p-2 rounded-xl transition-all ${isActive ? 'text-blue-400 bg-blue-500/10' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                                    <item.icon size={20} />
                                </div>
                                <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-blue-400' : 'text-[var(--text-secondary)]'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Announcement Banner */}
            {announcement && (announcement.message || typeof announcement === 'string') && (
                <div className={`fixed top-0 left-0 right-0 z-[60] text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-4 shadow-lg ${(announcement.type === 'error' && 'bg-red-600') ||
                    (announcement.type === 'warning' && 'bg-yellow-600') ||
                    (announcement.type === 'success' && 'bg-green-600') ||
                    'bg-blue-600'
                    }`}>
                    <span>{typeof announcement === 'string' ? announcement : announcement.message}</span>
                    <button
                        onClick={dismissAnnouncement}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        title="Dismiss"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className={`w-full min-h-screen flex flex-col items-center justify-center relative z-10 p-6 pt-24 pb-24 md:pt-32 md:pb-12 ${announcement ? 'mt-8' : ''}`}>
                {children}
            </main>

        </div>
    );
}

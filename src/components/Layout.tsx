import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, Sun, Moon, Network, Calendar, Settings as SettingsIcon, X, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOSSUStore } from '../hooks/useOSSUStore';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    // @ts-ignore
    const { theme, toggleTheme, activeSessions, announcement, dismissAnnouncement } = useOSSUStore();

    const activeSessionKeys = Object.keys(activeSessions || {});
    const singleSessionId = activeSessionKeys.length === 1 ? activeSessionKeys[0] : null;

    const navItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/courses/ossu', label: 'Curriculum', icon: BookOpen },
        { path: '/planner', label: 'Planner', icon: Calendar },
        { path: '/graph', label: 'Network', icon: Network },
        { path: '/analytics', label: 'Analytics', icon: BarChart2 },
        // Smart Link: If single session, go to it. If multiple or none, go to /study
        { path: singleSessionId ? `/study?id=${singleSessionId}` : '/study', label: 'Focus', icon: GraduationCap },
        { path: '/settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div
            className="min-h-screen font-sans text-text-primary relative flex flex-col items-center overflow-x-hidden transition-colors duration-500"
            style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
        >

            {/* Cinematic Container / Void Background */}
            <div className="void-bg">
                <div className="void-mesh"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* --- Mobile Top Bar (Theme Toggle) --- */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full bg-glass-surface/80 backdrop-blur-xl border border-glass-border flex items-center justify-center text-text-secondary hover:text-text-primary shadow-lg transition-all active:scale-95"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* --- Desktop/Tablet Floating Dock (Hidden on Mobile) --- */}
            <header className="hidden md:flex fixed top-6 left-0 right-0 z-50 justify-center pointer-events-none">
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex items-center gap-2 p-2 rounded-2xl bg-glass-surface/80 backdrop-blur-2xl border border-glass-border shadow-2xl transition-all duration-500 pointer-events-auto"
                >
                    {/* Nav Items - Reordered for Desktop: 3 Left, Home Center, 3 Right */}
                    {[
                        navItems.find(i => i.label === 'Curriculum'),
                        navItems.find(i => i.label === 'Planner'),
                        navItems.find(i => i.label === 'Network'),
                        navItems.find(i => i.label === 'Home'), // Center
                        navItems.find(i => i.label === 'Analytics'),
                        navItems.find(i => i.label === 'Focus'),
                        navItems.find(i => i.label === 'Settings'),
                    ].filter(Boolean).map((item) => {
                        if (!item) return null;
                        const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                        const isHome = item.label === 'Home';

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative rounded-xl text-sm font-medium transition-all duration-300 group flex items-center gap-2
                                    ${isHome
                                        ? isActive
                                            ? 'px-5 py-3 bg-accent-glow text-white shadow-lg shadow-accent-glow/30 hover:scale-105 hover:shadow-accent-glow/50 z-10 mx-2 -my-2 h-12'
                                            : 'px-5 py-3 bg-glass-surface border border-glass-border text-text-secondary hover:text-text-primary shadow-lg hover:scale-105 z-10 mx-2 -my-2 h-12'
                                        : 'px-4 py-2.5 hover:bg-white/10 text-text-secondary hover:text-text-primary'
                                    }
                                    ${isActive && !isHome ? 'bg-white/5 text-text-primary' : ''}
                                `}
                            >
                                <item.icon size={isHome ? 20 : 18} />
                                {isHome ? <span className="font-bold tracking-wide">Home</span> : <span>{item.label}</span>}
                                {isActive && !isHome && (
                                    <motion.div
                                        layoutId="dock-pill-desktop"
                                        className="absolute inset-0 rounded-xl border border-white/10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </motion.nav>
            </header>
            {announcement && (announcement.message || typeof announcement === 'string') && (
                <div className={`fixed top-0 left-0 right-0 z-[60] text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-4 shadow-lg pt-safe mt-12 md:mt-0 ${(announcement.type === 'error' && 'bg-red-600') ||
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

            {/* --- Mobile Bottom Navigation (Hidden on Desktop) --- */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-glass-surface/90 backdrop-blur-xl border-t border-glass-border pb-safe">
                <div className="flex items-center justify-around p-2">
                    {[
                        navItems.find(i => i.label === 'Curriculum'),
                        navItems.find(i => i.label === 'Planner'),
                        navItems.find(i => i.label === 'Network'),
                        navItems.find(i => i.label === 'Home'),
                        navItems.find(i => i.label === 'Analytics'),
                        navItems.find(i => i.label === 'Focus'),
                        navItems.find(i => i.label === 'Settings'),
                    ].filter(Boolean).map((item) => {
                        if (!item) return null;
                        const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                        const isHome = item.label === 'Home';

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300
                                    ${isHome
                                        ? isActive
                                            ? 'bg-[var(--accent-glow)] text-white shadow-lg shadow-[var(--accent-glow)]/30 -mt-8 mb-2 w-14 h-14 rounded-full border-4 border-[var(--bg-void)]'
                                            : 'bg-glass-surface border border-glass-border text-text-secondary -mt-8 mb-2 w-14 h-14 rounded-full border-4 border-[var(--bg-void)]'
                                        : isActive
                                            ? 'text-text-primary'
                                            : 'text-text-secondary hover:text-text-primary'
                                    }
                                `}
                            >
                                <item.icon size={isHome ? 24 : 20} />
                                {!isHome && <span className="text-[10px] font-medium mt-1">{item.label}</span>}
                                {isActive && !isHome && (
                                    <motion.div
                                        layoutId="mobile-nav-indicator"
                                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent-glow)]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

        </div>
    );
}

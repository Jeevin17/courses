import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, LibraryBig, Sun, Moon, Network, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOSSUStore } from '../hooks/useOSSUStore';

export default function Layout({ children }) {
    const location = useLocation();
    const { theme, toggleTheme } = useOSSUStore();

    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/courses/ossu', label: 'Curriculum', icon: BookOpen },
        { path: '/planner', label: 'Planner', icon: Calendar },
        { path: '/graph', label: 'Network', icon: Network },
        { path: '/study', label: 'Focus', icon: GraduationCap },
        { path: '/settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen font-sans text-[var(--text-primary)] relative flex flex-col items-center overflow-x-hidden transition-colors duration-500">

            {/* Cinematic Container / Void Background */}
            <div className="void-bg">
                <div className="void-mesh"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* Floating Dock */}
            <header className="fixed top-6 z-50">
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
                                        layoutId="dock-pill"
                                        className="absolute inset-0 bg-[var(--text-primary)]/5 rounded-full border border-[var(--text-primary)]/5"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                                    <item.icon size={16} />
                                    <span className="hidden sm:inline">{item.label}</span>
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

            {/* Main Content */}
            <main className="w-full min-h-screen flex flex-col items-center justify-center relative z-10 p-6 pt-32 pb-12">
                {children}
            </main>

        </div>
    );
}

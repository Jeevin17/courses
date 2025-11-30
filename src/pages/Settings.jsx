import { useState } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { exportData, importData } from '../utils/dataPersistence';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Upload, FileJson, Moon, Sun, Target, Trash2, AlertTriangle, Cloud, LogOut, User, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
    const { progress, theme, toggleTheme, importState, weeklyHours, setWeeklyHours, user, login, register, logout, deleteAccount, isSyncing, isAdmin } = useOSSUStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await importData(file);
            importState(data);
            alert('Data imported successfully!');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);
        try {
            if (isLoginMode) {
                await login(email, password);
            } else {
                await register(email, password);
                alert('Registration successful! Please check your email to confirm.');
            }
            setEmail('');
            setPassword('');
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('⚠️ WARNING: This will permanently delete your account and ALL data. This action CANNOT be undone. Are you absolutely sure?')) {
            return;
        }

        if (!confirm('Final confirmation: Delete your account forever?')) {
            return;
        }

        try {
            await deleteAccount();
        } catch (error) {
            alert('Failed to delete account: ' + error.message);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <header className="mb-12">
                <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                    <SettingsIcon className="text-blue-500" /> Settings
                </h1>
                <p className="text-[var(--text-secondary)]">Manage your preferences and data.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Account Settings (Cloud Sync) */}
                <section className="space-y-6 md:col-span-2">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Cloud size={20} className="text-blue-400" /> Cloud Sync
                    </h2>

                    <div className="p-6 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)]">
                        {user ? (
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--text-primary)]">Logged in as</h3>
                                            <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                                            {isSyncing && <span className="text-xs text-blue-400 animate-pulse">Syncing...</span>}
                                            <p className="text-xs text-green-400 mt-1">🔒 Data encrypted end-to-end</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {isAdmin && (
                                            <Link to="/admin" className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors font-bold flex items-center gap-2">
                                                <ShieldCheck size={18} /> Admin
                                            </Link>
                                        )}
                                        <button
                                            onClick={logout}
                                            className="px-4 py-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors font-bold flex items-center gap-2"
                                        >
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </div>
                                </div>

                                {/* Delete Account Section */}
                                <div className="pt-4 border-t border-[var(--glass-border)]">
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="w-full py-2 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete Account & All Data
                                    </button>
                                    <p className="text-xs text-[var(--text-secondary)] text-center mt-2">This action is permanent and cannot be undone</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Sync your progress</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                                        Create an account to sync your progress across devices and never lose your data.
                                    </p>
                                    <div className="flex gap-4 text-xs text-[var(--text-secondary)]">
                                        <span className="flex items-center gap-1"><Cloud size={12} /> Auto-Sync</span>
                                        <span className="flex items-center gap-1"><ShieldCheck size={12} /> End-to-End Encrypted</span>
                                    </div>
                                </div>
                                <form onSubmit={handleAuth} className="flex-1 space-y-3">
                                    {authError && <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded-lg">{authError}</div>}
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-[var(--bg-void)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-[var(--bg-void)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={authLoading}
                                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                                        >
                                            {authLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsLoginMode(!isLoginMode)}
                                            className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium"
                                        >
                                            {isLoginMode ? 'Need account?' : 'Have account?'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </section>

                {/* General Settings */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Target size={20} className="text-purple-400" /> General
                    </h2>

                    <div className="p-6 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)] space-y-6">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-[var(--text-primary)]">Appearance</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Switch between light and dark mode</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] transition-colors"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>

                        <div className="h-px bg-[var(--text-primary)]/5" />

                        {/* Weekly Goal */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-medium text-[var(--text-primary)]">Weekly Study Goal</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">Target hours per week</p>
                                </div>
                                <span className="font-mono font-bold text-blue-400 text-lg">{weeklyHours}h</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={weeklyHours}
                                onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                                className="w-full h-2 bg-[var(--text-primary)]/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-2 font-mono">
                                <span>1h</span>
                                <span>100h</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <FileJson size={20} className="text-green-400" /> Data
                    </h2>

                    <div className="p-6 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)] space-y-6">
                        {/* Export/Import */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => exportData({ progress, theme, weeklyHours })}
                                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/5 transition-all group"
                            >
                                <Download size={24} className="text-[var(--text-secondary)] group-hover:text-blue-400 transition-colors" />
                                <span className="text-sm font-bold text-[var(--text-primary)]">Export Data</span>
                            </button>

                            <label className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/5 transition-all cursor-pointer group">
                                <Upload size={24} className="text-[var(--text-secondary)] group-hover:text-green-400 transition-colors" />
                                <span className="text-sm font-bold text-[var(--text-primary)]">Import Data</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="h-px bg-[var(--text-primary)]/5" />

                        {/* Danger Zone */}
                        <div>
                            <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} /> Danger Zone
                            </h3>
                            <button
                                onClick={handleReset}
                                className="w-full py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Reset All Progress
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

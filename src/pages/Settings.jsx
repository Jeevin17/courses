import { useState } from 'react';
import { useOSSUStore } from '../hooks/useOSSUStore';
import { exportData, importData } from '../utils/dataPersistence';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Upload, FileJson, Moon, Sun, Target, Trash2, AlertTriangle } from 'lucide-react';

export default function Settings() {
    const { progress, theme, toggleTheme, importState, weeklyHours, setWeeklyHours } = useOSSUStore();

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

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <header className="mb-12">
                <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                    <SettingsIcon className="text-blue-500" /> Settings
                </h1>
                <p className="text-[var(--text-secondary)]">Manage your preferences and data.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

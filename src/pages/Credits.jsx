import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Code, Database, Globe } from 'lucide-react';

export default function Credits() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-display font-bold text-[var(--text-primary)]">Credits</h1>
                    <p className="text-xl text-[var(--text-secondary)]">Acknowledging the amazing resources and tools that made this possible.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Developer */}
                    <div className="p-8 bg-[var(--glass-surface)] rounded-3xl border border-[var(--glass-border)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Code className="text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Developed By</h2>
                            <p className="text-lg text-[var(--text-primary)] font-medium">Jeevin17</p>
                            <p className="text-[var(--text-secondary)] mt-2">
                                Built with passion for open source education.
                            </p>
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="p-8 bg-[var(--glass-surface)] rounded-3xl border border-[var(--glass-border)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Database className="text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Curriculum Data</h2>
                            <ul className="space-y-3 text-[var(--text-secondary)]">
                                <li className="flex items-center gap-2">
                                    <Globe size={16} />
                                    <a href="https://github.com/ossu/computer-science" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                                        OSSU Computer Science
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Globe size={16} />
                                    <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                                        roadmap.sh
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="p-8 bg-[var(--glass-surface)]/50 rounded-3xl border border-[var(--glass-border)] text-center">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Powered By</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['React', 'Vite', 'TailwindCSS', 'Framer Motion', 'Lucide React', 'React Virtuoso'].map(tech => (
                            <span key={tech} className="px-4 py-2 bg-[var(--bg-void)] rounded-full border border-[var(--glass-border)] text-sm text-[var(--text-secondary)]">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

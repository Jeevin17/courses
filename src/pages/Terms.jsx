import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';

export default function Terms() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <ScrollText className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-[var(--text-primary)]">
                        Terms & Conditions
                    </h1>
                </div>

                <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)]">
                    <section className="p-6 bg-[var(--glass-surface)] rounded-2xl border border-[var(--glass-border)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">1. Introduction</h2>
                        <p>
                            Welcome to Course Tracker. By using this website, you agree to comply with and be bound by the following terms and conditions of use.
                        </p>
                    </section>

                    <section className="p-6 bg-[var(--glass-surface)] rounded-2xl border border-[var(--glass-border)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">2. Educational Purpose</h2>
                        <p>
                            This application is a personal project designed for educational tracking purposes. It is not officially affiliated with the Open Source Society University (OSSU) or any university.
                        </p>
                    </section>

                    <section className="p-6 bg-[var(--glass-surface)] rounded-2xl border border-[var(--glass-border)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">3. Data Privacy & Cloud Sync</h2>
                        <p className="mb-4">
                            We respect your privacy. By default, your progress data is stored locally on your device using LocalStorage.
                        </p>
                        <p>
                            If you choose to create an account, your data (progress, notes, settings) will be synced to a secure cloud database (Supabase) to enable cross-device synchronization. We do not sell your data or share it with third parties. You can delete your account and data at any time.
                        </p>
                    </section>

                    <section className="p-6 bg-[var(--glass-surface)] rounded-2xl border border-[var(--glass-border)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">4. License</h2>
                        <p>
                            This project is open source. You are free to fork, modify, and use the code in accordance with the MIT License provided in the repository.
                        </p>
                    </section>

                    <section className="p-6 bg-[var(--glass-surface)] rounded-2xl border border-[var(--glass-border)]">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">5. Contact</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:jeevinraj17082005@gmail.com" className="text-blue-400 hover:underline">jeevinraj17082005@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}

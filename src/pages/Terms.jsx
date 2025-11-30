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
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">3. Data Privacy</h2>
                        <p>
                            We respect your privacy. All progress data is stored locally on your device using LocalStorage. We do not collect, store, or transmit your personal data to any external servers.
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

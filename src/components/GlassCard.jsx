import { motion } from 'framer-motion';

export default function GlassCard({ children, className = "", hoverEffect = true, ...props }) {
    return (
        <motion.div
            className={`glass-panel rounded-3xl p-6 relative overflow-hidden group ${className}`}
            initial={hoverEffect ? { y: 0, scale: 1 } : {}}
            whileHover={hoverEffect ? {
                y: -5,
                scale: 1.01,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            } : {}}
            {...props}
        >
            {/* Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

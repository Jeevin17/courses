import { Link } from 'react-router-dom';
import { Mail, Heart, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full py-8 mt-auto border-t border-glass-border bg-glass-surface/30 backdrop-blur-sm pb-safe">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">

                <div className="flex items-center gap-2">
                    <span>© 2025 Jeevin17. All rights reserved.</span>
                </div>

                <div className="flex items-center gap-6">
                    <Link to="/terms" className="hover:text-text-primary transition-colors">
                        Terms & Conditions
                    </Link>
                    <Link to="/credits" className="hover:text-text-primary transition-colors">
                        Credits
                    </Link>
                    <a
                        href="https://github.com/Jeevin17/courses"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-text-primary transition-colors"
                    >
                        <Github size={14} />
                        <span>Repository</span>
                    </a>
                    <a
                        href="mailto:jeevinraj17082005@gmail.com"
                        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                    >
                        <Mail size={14} />
                        <span>Contact</span>
                    </a>
                </div>

                <div className="flex items-center gap-1 opacity-50">
                    <span>Made with</span>
                    <Heart size={12} className="text-red-500 fill-red-500" />
                    <span>for learning</span>
                </div>
            </div>
        </footer>
    );
}

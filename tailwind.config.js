/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            colors: {
                glass: {
                    surface: 'var(--glass-surface)',
                    border: 'var(--glass-border)',
                    shadow: 'var(--glass-shadow)',
                },
                'bg-void': 'var(--bg-void)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'accent-glow': 'var(--accent-glow)',
                onyx: {
                    DEFAULT: '#030308',
                    glass: 'rgba(3, 3, 8, 0.8)',
                }
            },
            animation: {
                'breathe': 'breathe 15s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                breathe: {
                    '0%': { transform: 'scale(1)', opacity: '0.5' },
                    '100%': { transform: 'scale(1.1)', opacity: '0.7' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}

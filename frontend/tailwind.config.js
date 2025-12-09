/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a", // Deep black/charcoal
                foreground: "#ededed", // Soft white

                card: {
                    DEFAULT: "rgba(255, 255, 255, 0.03)",
                    hover: "rgba(255, 255, 255, 0.06)",
                    border: "rgba(255, 255, 255, 0.08)",
                },

                primary: {
                    DEFAULT: "#6366f1", // Indigo-500
                    hover: "#4f46e5",   // Indigo-600
                    glow: "rgba(99, 102, 241, 0.4)",
                },

                secondary: {
                    DEFAULT: "#a855f7", // Purple-500
                    glow: "rgba(168, 85, 247, 0.4)",
                },

                accent: {
                    DEFAULT: "#ec4899", // Pink-500
                    glow: "rgba(236, 72, 153, 0.4)",
                },

                success: "#10b981",
                error: "#ef4444",
                muted: "#737373", // Neutral-500
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'], // For headers
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
                'text-shimmer': 'text-shimmer 2.5s ease-out infinite alternate',
                'background-shine': 'background-shine 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    from: { backgroundPosition: '0 0' },
                    to: { backgroundPosition: '-200% 0' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px -10px rgba(99, 102, 241, 0)' },
                    '100%': { boxShadow: '0 0 20px -5px rgba(99, 102, 241, 0.5)' },
                },
                'border-beam': {
                    '100%': {
                        'offset-distance': '100%',
                    },
                },
                'text-shimmer': {
                    '0%': {
                        'background-position': '0% 50%',
                    },
                    '100%': {
                        'background-position': '100% 50%',
                    },
                },
                'background-shine': {
                    'from': {
                        'backgroundPosition': '0 0',
                    },
                    'to': {
                        'backgroundPosition': '-200% 0',
                    },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}

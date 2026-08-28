import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        secondary: '#8B5CF6',
        accent: '#10B981',
        'accent-light': 'var(--color-accent-light)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        'card-foreground': 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        border: 'var(--color-border)',
        ring: '#6366F1',
        destructive: '#EF4444',
        warning: '#F59E0B',
        'warning-light': 'var(--color-warning-light)',
        info: '#3B82F6',
        'info-light': 'var(--color-info-light)',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        clay: '12px',
        'clay-sm': '8px',
        'clay-md': '12px',
        'clay-lg': '16px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
        elevated: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        clay: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'clay-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'clay-card': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'clay-inset': 'none',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config


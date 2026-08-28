import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          50: '#F5F0FF',
          100: '#EDE5FF',
          200: '#D4C0FF',
          300: '#B898FF',
          400: '#9D6FFF',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3B0764',
        },
        secondary: '#8B5CF6',
        accent: '#059669',
        'accent-light': '#D1FAE5',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        'card-foreground': 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        border: 'var(--color-border)',
        ring: '#7C3AED',
        destructive: '#DC2626',
        warning: '#F59E0B',
        'warning-light': '#FEF3C7',
        info: '#3B82F6',
        'info-light': '#DBEAFE',
      },
      fontFamily: {
        heading: ['"Varela Round"', 'sans-serif'],
        body: ['"Nunito Sans"', 'sans-serif'],
      },
      borderRadius: {
        clay: '20px',
        'clay-sm': '12px',
        'clay-lg': '28px',
      },
      boxShadow: {
        clay: 'var(--shadow-clay)',
        'clay-sm': 'var(--shadow-clay-sm)',
        'clay-hover': '0 6px 0 0 rgba(124,58,237,0.18), 0 12px 32px rgba(124,58,237,0.12)',
        'clay-card': 'var(--shadow-clay-card)',
        'clay-inset': 'inset 0 2px 4px rgba(124,58,237,0.08)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSoft: {
          '0%': { transform: 'scale(0.95)' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}

export default config

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: 'var(--primary-dark)',
          purple: 'var(--primary-purple)',
          light: 'var(--primary-light)',
        },
        accent: {
          pink: 'var(--accent-pink)',
          purple: 'var(--accent-purple)',
          orange: 'var(--accent-orange)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(to bottom right, var(--gradient-purple-start), var(--gradient-purple-end))',
      },
      fontFamily: {
        trend: ['trend', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'text-shimmer': 'text-shimmer 2s ease-in-out infinite',
        'text-slide': 'text-slide 8s cubic-bezier(0.83, 0, 0.17, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
      },
      keyframes: {
        'text-shimmer': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'text-slide': {
          '0%, 20%': {
            transform: 'translateY(0%)',
          },
          '25%, 45%': {
            transform: 'translateY(-25%)',
          },
          '50%, 70%': {
            transform: 'translateY(-50%)',
          },
          '75%, 95%': {
            transform: 'translateY(-75%)',
          },
          '100%': {
            transform: 'translateY(-100%)',
          },
        },
      },
    },
  },
  plugins: [],
}
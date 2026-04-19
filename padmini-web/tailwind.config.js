/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
        brand: {
          green: "#2ECC71",
          "green-dark": "#27AE60",
          sky: "#3498DB",
          sun: "#F39C12",
          rose: "#E91E8C",
          purple: "#9B59B6",
          cream: "#FFFEF7",
        },
        "brand-cream": "#FFFEF7",
=======
        // නෙළුම් පොකුර Design System - Sri Lankan Heritage Palette
        lotus: {
          50:  '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7C3AED',
          800: '#6D28D9',
          900: '#5B21B6',
          950: '#1E1B4B',
        },
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        ocean: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        sunset: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        // Semantic Colors
        surface: '#FAFAFE',
        'surface-warm': '#FAF8F5',
>>>>>>> padmini-v5-complete
      },
      fontFamily: {
        sinhala: ['Noto Sans Sinhala', 'Inter', 'sans-serif'],
        display: ['Inter', 'Noto Sans Sinhala', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-purple': '0 0 40px -8px rgba(124, 58, 237, 0.3)',
        'glow-gold': '0 0 40px -8px rgba(245, 158, 11, 0.3)',
        'glow-teal': '0 0 40px -8px rgba(20, 184, 166, 0.3)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 6px 24px -4px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 12px 40px -8px rgb(0 0 0 / 0.1)',
        'float': '0 20px 60px -16px rgba(124, 58, 237, 0.25)',
      },
      animation: {
        'float-slow': 'gentleFloat 6s ease-in-out infinite',
        'float-medium': 'gentleFloat 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px -8px rgba(124, 58, 237, 0.2)' },
          '100%': { boxShadow: '0 0 40px -4px rgba(124, 58, 237, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#2ECC71",
          "green-dark": "#27AE60",
          sky: "#3498DB",
          sun: "#F39C12",
          rose: "#E91E8C",
          purple: "#9B59B6",
          cream: "#FFFEF7",
        }
      },
      fontFamily: {
        sinhala: ['Noto Sans Sinhala', 'sans-serif'],
        baloo: ['Baloo 2', 'cursive'],
      },
      animation: {
        'float-slow': 'float 20s linear infinite',
        'float-medium': 'float 15s linear infinite',
        'float-fast': 'float 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateX(-100px)' },
          '100%': { transform: 'translateX(100vw)' },
        }
      }
    },
  },
  plugins: [],
}

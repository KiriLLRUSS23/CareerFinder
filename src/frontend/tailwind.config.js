/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        success: '#2e7d32',
        warning: '#f57c00',
        error: '#d32f2f',
        info: '#0288d1',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'base': '0.5rem',
        'md': '0.5rem',
        'lg': '0.8rem',
        'xl': '1rem',
      },
    },
  },
  plugins: [],
}
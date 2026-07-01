/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{js,jsx,ts,tsx}',
    './index.js',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          hover: '#0EA371',
        },
        accent: '#10B981',
        muted: '#6B7280',
        error: '#EF4444',
        surface: '#FFFFFF',
        background: '#F3F4F6',
      },
      fontFamily: {
        default: ['System'],
      },
    },
  },
  plugins: [],
}

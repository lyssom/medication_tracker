/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{js,jsx,ts,tsx}',
    './index.js',
  ],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 07-ui-ux-overhaul · 温暖医疗风 token
        primary: {
          DEFAULT: '#10B981',
          hover: '#0EA371',
          soft: '#D1FAE5',
          ink: '#065F46',
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          soft: '#FEF3C7',
          ink: '#92400E',
        },
        danger: {
          DEFAULT: '#F43F5E',
          hover: '#E11D48',
          soft: '#FFE4E6',
          ink: '#9F1239',
        },
        ink: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
        surface: '#FFFBF5',
        background: '#FAF6F1',
        border: '#F3E9DA',
        divider: '#F5EFE3',
        // 兼容旧 raw 引用, 留 1 个版本
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
      },
      borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
      },
      boxShadow: {
        'warm-xs': '0 1px 2px rgba(180,140,80,0.06)',
        'warm-sm': '0 2px 4px rgba(180,140,80,0.08)',
        warm: '0 4px 12px rgba(180,140,80,0.10)',
        'warm-lg': '0 8px 24px rgba(180,140,80,0.12)',
      },
      fontFamily: {
        default: ['System'],
        sans: ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold', 'System'],
        display: ['PlusJakartaSans_400Regular', 'PlusJakartaSans_600SemiBold', 'PlusJakartaSans_700Bold', 'PlusJakartaSans_800ExtraBold', 'System'],
        serif: ['NotoSerifSC_400Regular', 'NotoSerifSC_700Bold', 'System'],
      },
    },
  },
  plugins: [],
}

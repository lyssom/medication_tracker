import { createTamagui } from 'tamagui'
import { config } from '@tamagui/config'

export const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light: {
      ...config.themes?.light,
      background: '#F3F4F6',
      color: '#1F2937',
      primary: '#10B981',
      primaryHover: '#0EA371',
      cardBackground: '#FFFFFF',
      border: '#E5E7EB',
      muted: '#6B7280',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
    },
    dark: {
      ...config.themes?.dark,
      background: '#0F172A',
      color: '#F1F5F9',
      primary: '#10B981',
      primaryHover: '#34D399',
      cardBackground: '#1E293B',
      border: '#334155',
      muted: '#94A3B8',
      error: '#F87171',
      warning: '#FBBF24',
      success: '#34D399',
    },
  },
  tokens: {
    ...config.tokens,
    color: {
      ...(config.tokens?.color ?? {}),
      primary: '#10B981',
      primaryHover: '#0EA371',
    },
  },
})

export default tamaguiConfig

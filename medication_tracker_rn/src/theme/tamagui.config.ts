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
      cardBackground: '#FFFFFF',
      border: '#E5E7EB',
      muted: '#6B7280',
      error: '#EF4444',
    },
  },
  tokens: {
    ...config.tokens,
    color: {
      ...(config.tokens?.color ?? {}),
      primary: '#10B981',
    },
  },
})

export default tamaguiConfig

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Appearance } from 'react-native'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Effective = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  effective: Effective
  setMode: (m: ThemeMode) => void
  hydrateFromSystem: () => void
}

function resolveEffective(mode: ThemeMode): Effective {
  if (mode === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  }
  return mode
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      effective: 'light',
      setMode: (m) => set({ mode: m, effective: resolveEffective(m) }),
      hydrateFromSystem: () => {
        // re-resolve when system preference changes (when mode is 'system')
        if (get().mode === 'system') {
          set({ effective: resolveEffective('system') })
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ mode: s.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.effective = resolveEffective(state.mode)
        }
      },
    }
  )
)
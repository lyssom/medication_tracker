import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans'
import {
  NotoSerifSC_400Regular,
  NotoSerifSC_700Bold,
} from '@expo-google-fonts/noto-serif-sc'
import { useAuthStore } from '../src/store/useAuthStore'
import { useVersionStore } from '../src/store/useVersionStore'
import { useThemeStore } from '../src/store/useThemeStore'
import UpdateModal from '../src/components/UpdateModal'
import { authAPI } from '../src/services/api'

export default function RootLayout() {
  const { accessToken, hasHydrated, logout } = useAuthStore()
  const router = useRouter()
  const segments = useSegments()
  const latest = useVersionStore((s) => s.latest)
  const updateAvailable = useVersionStore((s) => s.isUpdateAvailable)
  const mandatory = useVersionStore((s) => s.mandatory)
  const dismissed = useVersionStore((s) => s.dismissed)
  const fetchLatest = useVersionStore((s) => s.fetchLatest)
  const dismissOnce = useVersionStore((s) => s.dismissOnce)
  const effective = useThemeStore((s) => s.effective)
  const mode = useThemeStore((s) => s.mode)
  const hydrateFromSystem = useThemeStore((s) => s.hydrateFromSystem)

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    NotoSerifSC_400Regular,
    NotoSerifSC_700Bold,
  })

  useEffect(() => {
    if (!hasHydrated) return
    if (accessToken) {
      authAPI.getProfile().catch((e) => {
        if (e?.response?.status === 401) logout()
      })
    }
    fetchLatest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated])

  useEffect(() => {
    hydrateFromSystem()
  }, [mode, hydrateFromSystem])

  // Auth redirect: 未登录 → /auth/login, 已登录 → /(tabs)
  useEffect(() => {
    if (!hasHydrated) return
    const inAuthGroup = segments[0] === 'auth'
    if (!accessToken && !inAuthGroup) {
      router.replace('/auth/login')
    } else if (accessToken && inAuthGroup) {
      router.replace('/(tabs)')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, accessToken, segments])

  if (!hasHydrated || !fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <View
        className={`flex-1 bg-background dark:bg-slate-900 ${effective === 'dark' ? 'dark' : ''}`}
      >
        <StatusBar style={effective === 'dark' ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="meds/add"
            options={{ headerShown: true, title: '添加药物', presentation: 'modal' }}
          />
          <Stack.Screen name="care/[userId]" options={{ headerShown: false }} />
        </Stack>
        <UpdateModal
          visible={!!(updateAvailable && latest && !dismissed)}
          version={latest}
          mandatory={mandatory}
          onDismiss={dismissOnce}
        />
      </View>
    </SafeAreaProvider>
  )
}
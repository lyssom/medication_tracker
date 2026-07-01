import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../src/store/useAuthStore'
import { useVersionStore } from '../src/store/useVersionStore'
import UpdateModal from '../src/components/UpdateModal'
import { authAPI } from '../src/services/api'

export default function RootLayout() {
  const { user, accessToken, hasHydrated, logout } = useAuthStore()
  const latest = useVersionStore((s) => s.latest)
  const updateAvailable = useVersionStore((s) => s.isUpdateAvailable)
  const mandatory = useVersionStore((s) => s.mandatory)
  const dismissed = useVersionStore((s) => s.dismissed)
  const fetchLatest = useVersionStore((s) => s.fetchLatest)
  const dismissOnce = useVersionStore((s) => s.dismissOnce)

  useEffect(() => {
    if (!hasHydrated) return
    if (accessToken) {
      authAPI.getProfile().catch((e) => { if (e?.response?.status === 401) logout() })
    }
    fetchLatest()
  }, [hasHydrated])

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    )
  }

  // 注意：expo-router 56 内部对 children 做 `${child}` stringify，会撞 React 19 Fragment Symbol。
  // 不要用 Fragment / <> 包裹多个 Stack.Screen，必须 flat。
  return (
    <SafeAreaProvider>
      <StatusBar />
      <Stack>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meds/add" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="care/[userId]" options={{ headerShown: false }} />
      </Stack>
      <UpdateModal visible={!!(updateAvailable && latest && !dismissed)} version={latest} mandatory={mandatory} onDismiss={dismissOnce} />
    </SafeAreaProvider>
  )
}

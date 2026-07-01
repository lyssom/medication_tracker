import { TamaguiProvider } from 'tamagui'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import tamaguiConfig from '../src/theme/tamagui.config'
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

  // 启动序列（C2）
  useEffect(() => {
    if (!hasHydrated) return
    if (accessToken) {
      authAPI
        .getProfile()
        .then(() => {})
        .catch((e) => {
          if (e?.response?.status === 401) logout()
        })
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

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F3F4F6' },
        }}
      >
        {!user ? (
          <Stack.Screen name="auth/login" />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="meds/add"
              options={{ presentation: 'modal', title: '添加药物' }}
            />
            <Stack.Screen
              name="care/[userId]"
              options={{ title: '关心详情' }}
            />
          </>
        )}
      </Stack>

      <UpdateModal
        visible={!!(updateAvailable && latest && !dismissed)}
        version={latest}
        mandatory={mandatory}
        onDismiss={dismissOnce}
      />
    </TamaguiProvider>
  )
}

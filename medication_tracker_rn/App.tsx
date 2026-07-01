import * as React from 'react'
import { useState, useEffect } from 'react'
import { View, SafeAreaView, ActivityIndicator } from 'react-native'
import { Appbar, Button, IconButton } from 'react-native-paper'

import LoginScreen from './src/screens/auth/LoginScreen'
import HomeScreen from './src/screens/home/HomeScreen'
import MedicineListScreen from './src/screens/medicine/MedicineListScreen'
import AddMedScreen from './src/screens/medicine/AddMedScreen'
import { useAuthStore } from './src/store/useAuthStore'
import { Medication } from './src/store/useMedStore'
import SetScreen from './src/screens/home/SetScreen'
import CareScreen from './src/screens/care/careScreen'
import CareHomeScreen from './src/screens/care/careHomeScreen'
import CareMeScreen from './src/screens/care/careMeScreen'
import CareDetailScreen from './src/screens/care/careDetailScreen'
import { useVersionStore } from './src/store/useVersionStore'
import UpdateModal from './src/components/UpdateModal'
import { authAPI } from './src/services/api'

type Page =
  | { name: 'home' }
  | { name: 'medicine' }
  | { name: 'addMed' }
  | { name: 'history' }
  | { name: 'settings' }
  | { name: 'care' }
  | { name: 'careHome' }
  | { name: 'careMe' }
  | { name: 'careDetail'; userId: number; username: string }
  | { name: 'editMed'; medication: Medication }

export default function App() {
  const { user, accessToken, hasHydrated, logout } = useAuthStore()
  const [page, setPage] = useState<Page>({ name: 'home' })

  const updateAvailable = useVersionStore((s) => s.isUpdateAvailable)
  const mandatory = useVersionStore((s) => s.mandatory)
  const dismissed = useVersionStore((s) => s.dismissed)
  const latest = useVersionStore((s) => s.latest)
  const fetchLatest = useVersionStore((s) => s.fetchLatest)
  const dismissOnce = useVersionStore((s) => s.dismissOnce)

  // C2: 启动序列
  useEffect(() => {
    if (!hasHydrated) return
    // 1) 探测 token 有效性（仅在有 token 时）
    if (accessToken) {
      authAPI
        .getProfile()
        .then(() => {
          // 200: token 仍然有效
        })
        .catch((e) => {
          if (e?.response?.status === 401) {
            logout()
          }
        })
    }
    // 2) 检测新版本（401/404/500 都不影响）
    fetchLatest()
  }, [hasHydrated])

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!user) return <LoginScreen />

  const renderPage = () => {
    switch (page.name) {
      case 'home':
        return <HomeScreen />
      case 'medicine':
        return (
          <MedicineListScreen
            onAddMed={() => setPage({ name: 'addMed' })}
            onEditMed={(med) => setPage({ name: 'editMed', medication: med })}
          />
        )
      case 'addMed':
        return <AddMedScreen onDone={() => setPage({ name: 'medicine' })} />
      case 'editMed':
        return (
          <AddMedScreen
            medication={page.medication}
            onDone={() => setPage({ name: 'medicine' })}
          />
        )

      case 'care':
        return <CareScreen />
      case 'careMe':
        return <CareMeScreen />
      case 'careDetail':
        return (
          <CareDetailScreen userId={page.userId} username={page.username} />
        )
      case 'careHome':
        return <CareHomeScreen setPage={setPage} />
      case 'settings':
        return <SetScreen setPage={setPage} />
    }
  }

  const showUpdate = updateAvailable && latest && !dismissed

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="药伴" />
        <IconButton
          icon="cog"
          mode={page.name === 'settings' ? 'contained' : 'outlined'}
          onPress={() => setPage({ name: 'settings' })}
        />
      </Appbar.Header>

      <View
        style={{
          flexDirection: 'row',
          padding: 12,
          justifyContent: 'space-around',
        }}
      >
        <Button
          mode={page.name === 'home' ? 'contained' : 'outlined'}
          onPress={() => setPage({ name: 'home' })}
        >
          今日
        </Button>

        <Button
          mode={page.name === 'history' ? 'contained' : 'outlined'}
          onPress={() => setPage({ name: 'careHome' })}
        >
          关心
        </Button>
      </View>

      <View style={{ flex: 1, padding: 12 }}>{renderPage()}</View>

      <UpdateModal
        visible={!!showUpdate}
        version={latest}
        mandatory={mandatory}
        onDismiss={dismissOnce}
      />
    </SafeAreaView>
  )
}

import * as React from 'react'
import { useState } from 'react'
import { View, SafeAreaView } from 'react-native'
import { Appbar, Button, IconButton } from 'react-native-paper'

import LoginScreen from './screens/auth/LoginScreen'
import HomeScreen from './screens/home/HomeScreen'
import MedicineListScreen from './screens/medicine/MedicineListScreen'
import AddMedScreen from './screens/medicine/AddMedScreen'
import { useAuthStore } from './store/useAuthStore'
import { Medication } from './store/useMedStore'
import SetScreen from './screens/home/SetScreen'
import CareScreen from './screens/care/careScreen'
import CareHomeScreen from './screens/care/careHomeScreen'
import CareMeScreen from './screens/care/careMeScreen'
import CareDetailScreen from './screens/care/careDetailScreen'

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
  const { user } = useAuthStore()
  const [page, setPage] = useState<Page>({ name: 'home' })

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
        return (<CareScreen />)
      case 'careMe':
        return (<CareMeScreen />)
      case 'careDetail':
        return (
          <CareDetailScreen userId={page.userId} username={page.username} />
        )
      case 'careHome':
        return (<CareHomeScreen setPage={setPage} />)
      case 'settings':
        return (
          <SetScreen setPage={setPage}/>
        )
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* 顶部栏 */}
      <Appbar.Header>
        <Appbar.Content title="药伴" />
        <IconButton
          icon="cog"
          mode={page.name === 'settings' ? 'contained' : 'outlined'}
          onPress={() => setPage({ name: 'settings' })}
        />

      </Appbar.Header>

      {/* 简易页面切换 */}
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

      {/* 页面内容 */}
      <View style={{ flex: 1, padding: 12 }}>{renderPage()}</View>
    </SafeAreaView>
  )
}

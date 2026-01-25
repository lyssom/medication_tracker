import React, { useState } from 'react'
import { View, Text, Button, SafeAreaView } from 'react-native'

import LoginScreen from './screens/auth/LoginScreen'
import HomeScreen from './screens/home/HomeScreen'
import MedicineListScreen from './screens/medicine/MedicineListScreen'
import { useUserStore } from './store/userStore'

export default function App() {
  const { userId } = useUserStore()
  const [page, setPage] = useState<'home' | 'medicine'>('home')

  if (!userId) {
    return <LoginScreen />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          吃药打卡 MVP
        </Text>

        <View style={{ flexDirection: 'row', marginVertical: 12 }}>
          <Button title="今日" onPress={() => setPage('home')} />
          <View style={{ width: 12 }} />
          <Button title="药物管理" onPress={() => setPage('medicine')} />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {page === 'home' && <HomeScreen />}
        {page === 'medicine' && <MedicineListScreen />}
      </View>
    </SafeAreaView>
  )
}

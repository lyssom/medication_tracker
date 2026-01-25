import React from 'react'
import { View, Button, Text } from 'react-native'
import { useUserStore } from '../../store/userStore'

export default function LoginScreen() {
  const login = useUserStore((s) => s.login)

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ marginBottom: 20 }}>假登录</Text>
      <Button title="登录" onPress={() => login('test-user')} />
    </View>
  )
}

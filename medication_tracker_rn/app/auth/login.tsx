import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/store/useAuthStore'

export default function LoginScreen() {
  const router = useRouter()
  const { login, register, isLoading } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [invitation, setInvitation] = useState('')
  const [err, setErr] = useState('')
  const [showPw, setShowPw] = useState(false)

  const submit = async () => {
    setErr('')
    if (!username.trim()) {
      setErr('请输入用户名')
      return
    }
    try {
      if (mode === 'register') {
        await register({
          username: username.trim(),
          password: password.trim(),
          invitation: invitation.trim(),
        })
      } else {
        await login({ username: username.trim(), password: password.trim() })
      }
      router.replace('/(tabs)')
    } catch (e: any) {
      setErr(e?.message ?? '操作失败')
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo + title */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-emerald-50 items-center justify-center mb-4 shadow-sm">
            <Text className="text-5xl">💊</Text>
          </View>
          <Text className="text-3xl font-bold text-emerald-500">药伴</Text>
          <Text className="text-base text-gray-500 mt-1">吃药不再是一个人的事</Text>
        </View>

        {/* Form card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-semibold text-center mb-6">
            {mode === 'register' ? '创建账户' : '欢迎回来'}
          </Text>

          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
            placeholder="用户名"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9CA3AF"
          />

          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
            placeholder="密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9CA3AF"
          />

          {mode === 'register' && (
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
              placeholder="邀请码"
              value={invitation}
              onChangeText={setInvitation}
              autoCapitalize="characters"
              placeholderTextColor="#9CA3AF"
            />
          )}

          {err ? (
            <Text className="text-red-500 text-sm text-center mb-3">{err}</Text>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={isLoading}
            className={`bg-emerald-500 rounded-xl py-3.5 items-center mt-2 active:bg-emerald-600 ${
              isLoading ? 'opacity-60' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                {mode === 'register' ? '注册并登录' : '登录'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(mode === 'register' ? 'login' : 'register')
              setErr('')
              setInvitation('')
            }}
            className="items-center mt-4"
          >
            <Text className="text-emerald-500 text-sm">
              {mode === 'register' ? '已有账户？点击登录' : '没有账户？点击注册'}
            </Text>
          </Pressable>
        </View>

        <Text className="text-center text-xs text-gray-400 mt-6">
          {mode === 'register' ? '注册即表示您同意我们的服务条款' : '登录后可以管理药物并开启打卡'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}
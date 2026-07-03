import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../src/store/useAuthStore'
import { haptics } from '../../src/utils/haptics'
import appLogo from '../../assets/images/icon.png'

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
    haptics.medium()
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
      haptics.success()
      router.replace('/(tabs)')
    } catch (e: any) {
      haptics.warn()
      setErr(e?.message ?? '操作失败')
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-slate-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo + title */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-warm-sm border-2 border-primary-soft dark:border-emerald-900/40">
            <Image
              source={appLogo}
              style={{ width: 96, height: 96 }}
              resizeMode="cover"
            />
          </View>
          <Text className="text-3xl font-display font-extrabold text-primary dark:text-emerald-400">药伴</Text>
          <Text className="text-base text-ink-muted dark:text-slate-400 mt-1">
            吃药不再是一个人的事
          </Text>
        </View>

        {/* Form card */}
        <View className="bg-surface dark:bg-slate-800 rounded-2xl p-6 shadow-warm-sm border border-border dark:border-slate-700">
          <Text className="text-xl font-semibold text-center mb-6 text-ink dark:text-slate-100">
            {mode === 'register' ? '创建账户' : '欢迎回来'}
          </Text>

          <Text className="text-sm font-medium text-ink dark:text-slate-200 mb-1.5">用户名</Text>
          <TextInput
            className="border border-border dark:border-slate-600 rounded-xl px-4 py-3 mb-4 text-base bg-background dark:bg-slate-900 text-ink dark:text-slate-100"
            placeholder="请输入用户名"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9CA3AF"
          />

          <Text className="text-sm font-medium text-ink dark:text-slate-200 mb-1.5">密码</Text>
          <View className="relative">
            <TextInput
              className="border border-border dark:border-slate-600 rounded-xl px-4 py-3 pr-12 mb-4 text-base bg-background dark:bg-slate-900 text-ink dark:text-slate-100"
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              onPress={() => {
                haptics.light()
                setShowPw(!showPw)
              }}
              hitSlop={10}
              className="absolute right-3 top-3 w-8 h-8 items-center justify-center"
            >
              <Ionicons
                name={showPw ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6B7280"
              />
            </Pressable>
          </View>

          {mode === 'register' && (
            <>
              <Text className="text-sm font-medium text-ink dark:text-slate-200 mb-1.5">
                邀请码 <Text className="text-ink-faint font-normal">(选填)</Text>
              </Text>
              <TextInput
                className="border border-border dark:border-slate-600 rounded-xl px-4 py-3 mb-4 text-base bg-background dark:bg-slate-900 text-ink dark:text-slate-100"
                placeholder="如：ABC123"
                value={invitation}
                onChangeText={setInvitation}
                autoCapitalize="characters"
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          {err ? (
            <Text className="text-danger text-sm text-center mb-3">{err}</Text>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={isLoading}
            className={`bg-primary rounded-xl py-3.5 items-center mt-2 active:bg-primary-hover active:scale-95 shadow-warm-sm ${
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
              haptics.light()
              setMode(mode === 'register' ? 'login' : 'register')
              setErr('')
              setInvitation('')
            }}
            className="items-center mt-4 active:opacity-70"
          >
            <Text className="text-primary text-sm">
              {mode === 'register' ? '已有账户？点击登录' : '没有账户？点击注册'}
            </Text>
          </Pressable>
        </View>

        <Text className="text-center text-xs text-ink-faint dark:text-slate-500 mt-6">
          {mode === 'register' ? '注册即表示您同意我们的服务条款' : '登录后可以管理药物并开启打卡'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
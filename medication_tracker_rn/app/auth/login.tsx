import { useState } from 'react'
import {
  YStack,
  XStack,
  Text,
  Input,
  Button,
  Card,
  Theme,
} from 'tamagui'
import { useAuthStore } from '../../src/store/useAuthStore'

export default function LoginScreen() {
  const { login, register, isLoading } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [invitation, setInvitation] = useState('')
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    if (!username.trim()) {
      setErr('用户名不能为空')
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
        await login({
          username: username.trim(),
          password: password.trim(),
        })
      }
    } catch (e: any) {
      setErr(e?.message ?? '操作失败')
    }
  }

  return (
    <Theme name="light">
      <YStack
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        padding={24}
        gap="$4"
      >
        <YStack alignItems="center" marginBottom="$6" gap="$2">
          <Text fontSize={56} color="$primary">
            💊
          </Text>
          <Text fontSize="$9" fontWeight="700" color="$primary">
            药伴
          </Text>
          <Text color="$muted">吃药不再是一个人的事</Text>
        </YStack>

        <Card size="$4" backgroundColor="$cardBackground">
          <YStack padding="$4" gap="$3">
            <Text fontSize="$7" fontWeight="600" textAlign="center" marginBottom="$2">
              {mode === 'register' ? '创建账户' : '欢迎回来'}
            </Text>

            <Input
              placeholder="用户名"
              value={username}
              onChangeText={(v) => {
                setUsername(v)
                setErr('')
              }}
              autoCapitalize="none"
              autoCorrect={false}
              size="$4"
            />

            <Input
              placeholder="密码"
              value={password}
              onChangeText={(v) => {
                setPassword(v)
                setErr('')
              }}
              secureTextEntry
              autoCapitalize="none"
              size="$4"
            />

            {mode === 'register' && (
              <Input
                placeholder="邀请码"
                value={invitation}
                onChangeText={setInvitation}
                autoCapitalize="none"
                size="$4"
              />
            )}

            {err ? (
              <Text color="$error" textAlign="center">
                {err}
              </Text>
            ) : null}

            <Button
              theme="active"
              backgroundColor="$primary"
              color="#fff"
              onPress={submit}
              disabled={isLoading}
              size="$4"
              marginTop="$3"
            >
              {isLoading
                ? '请稍候…'
                : mode === 'register'
                ? '注册并登录'
                : '登录'}
            </Button>

            <XStack justifyContent="center" marginTop="$3">
              <Button
                unstyled
                color="$primary"
                onPress={() => {
                  setMode(mode === 'register' ? 'login' : 'register')
                  setErr('')
                  setInvitation('')
                }}
              >
                {mode === 'register' ? '已有账户？点击登录' : '没有账户？点击注册'}
              </Button>
            </XStack>
          </YStack>
        </Card>

        <Text textAlign="center" color="$muted" fontSize="$3" marginTop="$4">
          {mode === 'register'
            ? '注册即表示您同意我们的服务条款'
            : '登录后可以管理药物并开启打卡'}
        </Text>
      </YStack>
    </Theme>
  )
}

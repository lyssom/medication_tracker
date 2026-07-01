import { YStack, Text, Card, Button, H3, Separator } from 'tamagui'
import { useAuthStore } from '../../src/store/useAuthStore'

export default function SettingsScreen() {
  const { user, logout } = useAuthStore()
  return (
    <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
      <H3 color="$primary">设置</H3>

      <Card backgroundColor="$cardBackground" size="$4">
        <YStack gap="$2">
          <Text fontSize="$3" color="$muted">
            当前账户
          </Text>
          <Text fontSize="$5" fontWeight="600">
            {user?.username ?? '未登录'}
          </Text>
        </YStack>
      </Card>

      <Card backgroundColor="$cardBackground" size="$4">
        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="600">
            数据
          </Text>
          <Separator />
          <Text color="$muted">从 SecureStore 清除登录态</Text>
          <Button
            backgroundColor="$error"
            color="#fff"
            size="$3"
            onPress={() => logout()}
          >
            退出登录
          </Button>
        </YStack>
      </Card>
    </YStack>
  )
}

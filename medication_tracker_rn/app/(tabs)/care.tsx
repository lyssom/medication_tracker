import { YStack, Text, Card, Button, H3 } from 'tamagui'
import { useRouter } from 'expo-router'

export default function CareTab() {
  const router = useRouter()
  return (
    <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
      <H3 color="$primary">关心</H3>

      <Card backgroundColor="$cardBackground" size="$4">
        <YStack gap="$2">
          <Text fontSize="$5" fontWeight="600">
            我关心的人
          </Text>
          <Text color="$muted">
            通过邀请码添加关心对象；可查看对方今日服药情况。
          </Text>
          <Button
            backgroundColor="$primary"
            color="#fff"
            size="$3"
            onPress={() => router.push('/care')}
          >
            管理
          </Button>
        </YStack>
      </Card>

      <Card backgroundColor="$cardBackground" size="$4">
        <YStack gap="$2">
          <Text fontSize="$5" fontWeight="600">
            关心我的人
          </Text>
          <Text color="$muted">
            谁在关心你？一览中显示。
          </Text>
          <Button
            variant="outlined"
            size="$3"
            onPress={() => router.push('/care/me')}
          >
            查看
          </Button>
        </YStack>
      </Card>
    </YStack>
  )
}

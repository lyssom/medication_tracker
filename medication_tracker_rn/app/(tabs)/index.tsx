import { YStack, Text, Card, H3 } from 'tamagui'

export default function HomeScreen() {
  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <Card backgroundColor="$cardBackground" size="$4">
        <H3 color="$primary">今日服药</H3>
        <Text color="$muted" marginTop="$2">
          打开应用即可看到今日的服药计划。
        </Text>
      </Card>
      <Card backgroundColor="$cardBackground" size="$4">
        <Text fontWeight="600" marginBottom="$2">
          倒计时
        </Text>
        <Text color="$muted">
          距离下一服药还有 02:00:00
        </Text>
      </Card>
    </YStack>
  )
}

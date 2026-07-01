import { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { YStack, Text, Card, H3, Spinner, Separator } from 'tamagui'
import { planAPI } from '../../src/services/api'

interface PlanRow {
  id: number
  medication_id: number
  medication_name?: string
  scheduled_time: string
  dose: number
  dose_unit: string
  is_taken: boolean
}

export default function CareDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    planAPI
      .getCareTodayPlan(Number(userId))
      .then((r) => setPlans((r.data as any).data ?? []))
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
      <H3 color="$primary">今日服药</H3>
      {loading ? (
        <Spinner color="$primary" />
      ) : plans.length === 0 ? (
        <Card backgroundColor="$cardBackground" size="$4">
          <Text color="$muted" textAlign="center">
            今日还没有服药计划
          </Text>
        </Card>
      ) : (
        plans.map((p) => (
          <Card
            key={p.id}
            backgroundColor="$cardBackground"
           
            size="$4"
          >
            <YStack>
              <Text fontSize="$5" fontWeight="600">
                {p.medication_name ?? `药物 #${p.medication_id}`}
              </Text>
              <Text color="$muted" fontSize="$3">
                {p.scheduled_time} · {p.dose}
                {p.dose_unit}
              </Text>
              <Separator marginVertical="$2" />
              <Text color={p.is_taken ? '$success' : '$muted'}>
                {p.is_taken ? '已服药' : '未服药'}
              </Text>
            </YStack>
          </Card>
        ))
      )}
    </YStack>
  )
}

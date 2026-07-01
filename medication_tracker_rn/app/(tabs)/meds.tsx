import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Card, Button, H3, Spinner } from 'tamagui'
import { useMedStore } from '../../src/store/useMedStore'

export default function MedsTab() {
  const meds = useMedStore((s) => s.medications)
  const isLoading = useMedStore((s) => s.isLoading)
  const fetchMedications = useMedStore((s) => s.fetchMedications)
  const router = useRouter()

  useEffect(() => {
    fetchMedications().catch(() => {})
  }, [])

  return (
    <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
      <XStack justifyContent="space-between" alignItems="center">
        <H3 color="$primary">我的药物</H3>
        <Button
          theme="active"
          backgroundColor="$primary"
          color="#fff"
          size="$3"
          onPress={() => router.push('/meds/add')}
        >
          + 添加
        </Button>
      </XStack>

      {isLoading ? (
        <Spinner color="$primary" />
      ) : meds.length === 0 ? (
        <Card backgroundColor="$cardBackground" size="$4">
          <Text color="$muted" textAlign="center">
            还没有药物。点击右上角"添加"开始管理。
          </Text>
        </Card>
      ) : (
        meds.map((m) => (
          <Card
            key={m.id}
            backgroundColor="$cardBackground"
           
            size="$4"
           
            pressStyle={{ scale: 0.98 }}
            onPress={() => router.push({ pathname: '/meds/add', params: { id: String(m.id) } })}
          >
            <YStack gap="$1">
              <Text fontSize="$5" fontWeight="600">
                {m.name}
              </Text>
              <Text color="$muted" fontSize="$3">
                {m.alias ?? '无别名'} · 库存 {m.stock}
                {m.unit}
              </Text>
              <Text color="$muted" fontSize="$2">
                {m.times?.length ?? 0} 次/天
              </Text>
            </YStack>
          </Card>
        ))
      )}
    </YStack>
  )
}

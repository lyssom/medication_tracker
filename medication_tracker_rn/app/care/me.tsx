import { useEffect, useState } from 'react'
import { YStack, Text, Card, H3, Spinner } from 'tamagui'
import { caresAPI } from '../../src/services/api'

interface CaresMeRow {
  id: number
  supervisor_id: number
  relation_type: string
  status: string
  supervisor_name?: string
}

export default function CareMeScreen() {
  const [rows, setRows] = useState<CaresMeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    caresAPI
      .getCaresme()
      .then((r) => setRows((r.data as any).cares_me ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
      <H3 color="$primary">关心我的人</H3>
      {loading ? (
        <Spinner color="$primary" />
      ) : rows.length === 0 ? (
        <Card backgroundColor="$cardBackground" size="$4">
          <Text color="$muted" textAlign="center">
            还没有人关心你
          </Text>
        </Card>
      ) : (
        rows.map((r) => (
          <Card
            key={r.id}
            backgroundColor="$cardBackground"
           
            size="$4"
          >
            <YStack>
              <Text fontSize="$5" fontWeight="600">
                {r.supervisor_name ?? `用户 #${r.supervisor_id}`}
              </Text>
              <Text color="$muted" fontSize="$3">
                关系：{r.relation_type} · 状态：{r.status}
              </Text>
            </YStack>
          </Card>
        ))
      )}
    </YStack>
  )
}

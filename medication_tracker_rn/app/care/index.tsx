import { useEffect, useState } from 'react'
import {
  YStack,
  XStack,
  Text,
  Card,
  Input,
  Button,
  H3,
  Spinner,
} from 'tamagui'
import { caresAPI } from '../../src/services/api'

interface CareRow {
  id: number
  supervised_id: number
  relation_type: string
  status: string
  supervised_name?: string
}

export default function CareScreen() {
  const [rows, setRows] = useState<CareRow[]>([])
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState('')
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await caresAPI.getmyCares()
      setRows((r.data as any).my_cares ?? [])
    } catch {
      setErr('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const add = async () => {
    if (!invite.trim()) return
    setAdding(true)
    try {
      await caresAPI.addCare({ invite_code: invite.trim() })
      setInvite('')
      await load()
    } catch (e: any) {
      setErr(e?.response?.data?.msg ?? '添加失败')
    } finally {
      setAdding(false)
    }
  }

  return (
    <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
      <H3 color="$primary">我关心的人</H3>

      <Card backgroundColor="$cardBackground" size="$4" gap="$2">
        <Text fontSize="$5" fontWeight="600">
          添加关心
        </Text>
        <XStack gap="$2">
          <Input
            flex={1}
            placeholder="对方邀请码"
            value={invite}
            onChangeText={setInvite}
            autoCapitalize="characters"
            size="$3"
          />
          <Button
            backgroundColor="$primary"
            color="#fff"
            onPress={add}
            disabled={adding}
            size="$3"
          >
            添加
          </Button>
        </XStack>
      </Card>

      {err ? <Text color="$error">{err}</Text> : null}

      {loading ? (
        <Spinner color="$primary" />
      ) : rows.length === 0 ? (
        <Card backgroundColor="$cardBackground" size="$4">
          <Text color="$muted" textAlign="center">
            还没有关心任何人
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
                {r.supervised_name ?? `用户 #${r.supervised_id}`}
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

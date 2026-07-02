import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { caresAPI } from '../../src/services/api'

interface CareRow {
  id: number
  supervised_id: number
  relation_type: string
  status: string
  supervised_name?: string
}

export default function CareScreen() {
  const router = useRouter()
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
      Alert.alert('添加失败', e?.response?.data?.msg ?? '未知错误')
    } finally {
      setAdding(false)
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Add section */}
      <View className="bg-surface p-5 border-b border-divider">
        <Text className="text-lg font-semibold text-ink mb-1">添加关心</Text>
        <Text className="text-xs text-ink-muted mb-3">输入对方邀请码</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 border border-border rounded-xl px-4 py-3 text-base bg-background mr-2 text-ink"
            placeholder="如：ABC123"
            value={invite}
            onChangeText={setInvite}
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
          <Pressable
            onPress={add}
            disabled={adding}
            className={`bg-primary rounded-xl px-6 py-3 active:bg-primary-hover shadow-warm-sm ${adding ? 'opacity-60' : ''}`}
          >
            {adding ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">添加</Text>}
          </Pressable>
        </View>
      </View>

      {/* List */}
      {err ? <Text className="text-danger text-center py-3">{err}</Text> : null}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="heart-outline" size={80} color="#F3E9DA" />
          <Text className="text-lg font-semibold text-ink mt-4 mb-2">还没有关心任何人</Text>
          <Text className="text-sm text-ink-muted text-center">输入邀请码开始关心你爱的人</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ padding: 20, paddingBottom: 96, gap: 12 }}
          renderItem={({ item: r }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/care/[userId]', params: { userId: String(r.supervised_id) } })
              }
              className="bg-surface rounded-2xl p-4 border border-border flex-row items-center active:bg-background"
            >
              <View className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#F43F5E" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink">
                  {r.supervised_name ?? `用户 #${r.supervised_id}`}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-rose-50 rounded-full px-2 py-0.5 mr-2">
                    <Text className="text-xs text-rose-600">{r.relation_type}</Text>
                  </View>
                  <Text className="text-xs text-ink-faint">{r.status}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        />
      )}
    </View>
  )
}

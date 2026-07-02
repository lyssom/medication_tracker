import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { caresAPI } from '../../src/services/api'
import { haptics } from '../../src/utils/haptics'
import { SkeletonRow } from '../../src/components/Skeleton'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const add = async () => {
    if (!invite.trim()) return
    haptics.medium()
    setAdding(true)
    try {
      await caresAPI.addCare({ invite_code: invite.trim() })
      setInvite('')
      haptics.success()
      await load()
    } catch (e: any) {
      haptics.warn()
      Alert.alert('添加失败', e?.response?.data?.msg ?? '未知错误')
    } finally {
      setAdding(false)
    }
  }

  return (
    <View className="flex-1 bg-background dark:bg-slate-900">
      {/* Add section */}
      <View className="bg-surface dark:bg-slate-800 p-5 border-b border-divider dark:border-slate-700">
        <Text className="text-lg font-semibold text-ink dark:text-slate-100 mb-1">添加关心</Text>
        <Text className="text-xs text-ink-muted dark:text-slate-400 mb-3">输入对方邀请码</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 border border-border dark:border-slate-600 rounded-xl px-4 py-3 text-base bg-background dark:bg-slate-900 mr-2 text-ink dark:text-slate-100"
            placeholder="如：ABC123"
            value={invite}
            onChangeText={setInvite}
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
          <Pressable
            onPress={add}
            disabled={adding}
            className={`bg-primary rounded-xl px-6 py-3 active:bg-primary-hover active:scale-95 shadow-warm-sm ${
              adding ? 'opacity-60' : ''
            }`}
          >
            {adding ? (
              <Ionicons name="hourglass-outline" size={18} color="#fff" />
            ) : (
              <Text className="text-white font-semibold">添加</Text>
            )}
          </Pressable>
        </View>
      </View>

      {err ? (
        <Text className="text-danger text-center py-3">{err}</Text>
      ) : loading ? (
        <View className="px-5 pt-3 gap-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-900/30 items-center justify-center mb-5">
            <Ionicons name="heart-outline" size={56} color="#F43F5E" />
          </View>
          <Text className="text-xl font-semibold text-ink dark:text-slate-100 mb-2">
            还没有关心任何人
          </Text>
          <Text className="text-sm text-ink-muted dark:text-slate-400 text-center">
            输入邀请码开始关心你爱的人
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ padding: 20, paddingBottom: 96, gap: 12 }}
          renderItem={({ item: r }) => (
            <Pressable
              onPress={() => {
                haptics.light()
                router.push({
                  pathname: '/care/[userId]',
                  params: { userId: String(r.supervised_id) },
                })
              }}
              className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700 flex-row items-center active:bg-background dark:active:bg-slate-900 active:scale-[0.98]"
            >
              <View className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#F43F5E" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink dark:text-slate-100">
                  {r.supervised_name ?? `用户 #${r.supervised_id}`}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-rose-50 dark:bg-rose-900/30 rounded-full px-2 py-0.5 mr-2">
                    <Text className="text-xs text-rose-600">{r.relation_type}</Text>
                  </View>
                  <Text className="text-xs text-ink-faint dark:text-slate-500">{r.status}</Text>
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
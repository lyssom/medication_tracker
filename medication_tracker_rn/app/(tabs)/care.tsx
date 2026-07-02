import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { caresAPI } from '../../src/services/api'
import { haptics } from '../../src/utils/haptics'
import { SkeletonRow } from '../../src/components/Skeleton'
import { useAuthStore } from '../../src/store/useAuthStore'

interface CareRow {
  id: number
  supervised_id: number
  supervisor_id: number
  relation_type: string
  status: string
  supervised_name?: string
  supervisor_name?: string
}

type Segment = 'my' | 'me'

export default function CareHub() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [rows, setRows] = useState<CareRow[]>([])
  const [loading, setLoading] = useState(true)
  const [seg, setSeg] = useState<Segment>('my')
  const [invite, setInvite] = useState('')
  const [adding, setAdding] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      if (seg === 'my') {
        const r = await caresAPI.getmyCares()
        setRows((r.data as any).my_cares ?? [])
      } else {
        const r = await caresAPI.getCaresme()
        setRows((r.data as any).cares_me ?? [])
      }
    } catch {
      Alert.alert('加载失败', '请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seg])

  const add = async () => {
    if (!invite.trim()) return
    haptics.medium()
    setAdding(true)
    try {
      await caresAPI.addCare({ invite_code: invite.trim() })
      setInvite('')
      haptics.success()
      if (seg === 'my') await load()
      else setSeg('my')
    } catch (e: any) {
      haptics.warn()
      Alert.alert('添加失败', e?.response?.data?.msg ?? '未知错误')
    } finally {
      setAdding(false)
    }
  }

  const shareInvite = () => {
    const code = user?.invite_code ?? user?.invitation
    if (!code) {
      Alert.alert('提示', '暂未生成邀请码')
      return
    }
    Alert.alert('我的邀请码', code, [{ text: '好' }])
  }

  const onRowPress = (r: CareRow) => {
    const targetId = seg === 'my' ? r.supervised_id : r.supervisor_id
    router.push({ pathname: '/care/[userId]', params: { userId: String(targetId) } })
  }

  return (
    <View className="flex-1 bg-background dark:bg-slate-900">
      {/* Add section */}
      <View className="bg-surface dark:bg-slate-800 p-5 border-b border-divider dark:border-slate-700">
        <Text className="text-lg font-semibold text-ink dark:text-slate-100 mb-1">添加关心</Text>
        <Text className="text-xs text-ink-muted dark:text-slate-400 mb-3">
          输入对方邀请码
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 border border-border dark:border-slate-600 rounded-xl px-4 py-3 text-base bg-background dark:bg-slate-900 mr-2 text-ink dark:text-slate-100"
            placeholder="如：ABC123"
            placeholderTextColor="#9CA3AF"
            value={invite}
            onChangeText={setInvite}
            autoCapitalize="characters"
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

      {/* Segmented control */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row bg-background dark:bg-slate-900 p-1 rounded-full">
          <Pressable
            onPress={() => {
              haptics.light()
              setSeg('my')
            }}
            className={`flex-1 rounded-full py-2 items-center active:scale-95 ${
              seg === 'my' ? 'bg-surface dark:bg-slate-800 shadow-warm-sm' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                seg === 'my' ? 'text-primary' : 'text-ink-muted dark:text-slate-400'
              }`}
            >
              我关心的
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              haptics.light()
              setSeg('me')
            }}
            className={`flex-1 rounded-full py-2 items-center active:scale-95 ${
              seg === 'me' ? 'bg-surface dark:bg-slate-800 shadow-warm-sm' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                seg === 'me' ? 'text-primary' : 'text-ink-muted dark:text-slate-400'
              }`}
            >
              关心我的
            </Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View className="px-5 gap-3 pt-2">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View
            className={`w-24 h-24 rounded-full items-center justify-center mb-5 ${
              seg === 'my' ? 'bg-rose-50 dark:bg-rose-900/30' : 'bg-blue-50 dark:bg-blue-900/30'
            }`}
          >
            <Ionicons
              name={seg === 'my' ? 'heart-outline' : 'people-outline'}
              size={56}
              color={seg === 'my' ? '#F43F5E' : '#3B82F6'}
            />
          </View>
          <Text className="text-xl font-semibold text-ink dark:text-slate-100 mb-2">
            {seg === 'my' ? '还没有关心任何人' : '还没有人关心你'}
          </Text>
          <Text className="text-sm text-ink-muted dark:text-slate-400 text-center mb-6">
            {seg === 'my'
              ? '输入邀请码开始关心你爱的人'
              : '把你的邀请码分享给亲友，让他们关心你'}
          </Text>
          {seg === 'me' && (
            <Pressable
              onPress={() => {
                haptics.medium()
                shareInvite()
              }}
              className="bg-blue-500 rounded-full px-6 py-3 active:scale-95 shadow-warm-sm flex-row items-center"
            >
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text className="text-white font-semibold ml-1.5">查看我的邀请码</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96, gap: 12 }}
          renderItem={({ item: r }) => {
            const name =
              seg === 'my'
                ? r.supervised_name ?? `用户 #${r.supervised_id}`
                : r.supervisor_name ?? `用户 #${r.supervisor_id}`
            const iconBg = seg === 'my' ? 'bg-rose-50 dark:bg-rose-900/30' : 'bg-blue-50 dark:bg-blue-900/30'
            const iconColor = seg === 'my' ? '#F43F5E' : '#3B82F6'
            const chipBg = seg === 'my' ? 'bg-rose-50 dark:bg-rose-900/30' : 'bg-blue-50 dark:bg-blue-900/30'
            const chipText = seg === 'my' ? 'text-rose-600' : 'text-blue-600'
            return (
              <Pressable
                onPress={() => {
                  haptics.light()
                  onRowPress(r)
                }}
                className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700 flex-row items-center active:bg-background dark:active:bg-slate-900 active:scale-[0.98]"
              >
                <View
                  className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center mr-3`}
                >
                  <Ionicons name="person" size={20} color={iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink dark:text-slate-100">
                    {name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className={`${chipBg} rounded-full px-2 py-0.5 mr-2`}>
                      <Text className={`text-xs ${chipText}`}>{r.relation_type}</Text>
                    </View>
                    <Text className="text-xs text-ink-faint dark:text-slate-500">{r.status}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            )
          }}
        />
      )}
    </View>
  )
}
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { caresAPI } from '../../src/services/api'

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
    setAdding(true)
    try {
      await caresAPI.addCare({ invite_code: invite.trim() })
      setInvite('')
      if (seg === 'my') await load()
      else setSeg('my')
    } catch (e: any) {
      Alert.alert('添加失败', e?.response?.data?.msg ?? '未知错误')
    } finally {
      setAdding(false)
    }
  }

  const onRowPress = (r: CareRow) => {
    const targetId = seg === 'my' ? r.supervised_id : r.supervisor_id
    router.push({ pathname: '/care/[userId]', params: { userId: String(targetId) } })
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
            placeholderTextColor="#9CA3AF"
            value={invite}
            onChangeText={setInvite}
            autoCapitalize="characters"
          />
          <Pressable
            onPress={add}
            disabled={adding}
            className={`bg-primary rounded-xl px-6 py-3 active:bg-primary-hover shadow-warm-sm ${
              adding ? 'opacity-60' : ''
            }`}
          >
            {adding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">添加</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Segmented control */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row bg-background p-1 rounded-full">
          <Pressable
            onPress={() => setSeg('my')}
            className={`flex-1 rounded-full py-2 items-center ${
              seg === 'my' ? 'bg-surface shadow-warm-sm' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                seg === 'my' ? 'text-primary' : 'text-ink-muted'
              }`}
            >
              我关心的
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSeg('me')}
            className={`flex-1 rounded-full py-2 items-center ${
              seg === 'me' ? 'bg-surface shadow-warm-sm' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                seg === 'me' ? 'text-primary' : 'text-ink-muted'
              }`}
            >
              关心我的
            </Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name={seg === 'my' ? 'heart-outline' : 'people-outline'}
            size={80}
            color="#F3E9DA"
          />
          <Text className="text-lg font-semibold text-ink mt-4 mb-2">
            {seg === 'my' ? '还没有关心任何人' : '还没有人关心你'}
          </Text>
          <Text className="text-sm text-ink-muted text-center">
            {seg === 'my' ? '输入邀请码开始关心你爱的人' : '把你的邀请码分享给亲友'}
          </Text>
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
            const iconBg = seg === 'my' ? 'bg-rose-50' : 'bg-blue-50'
            const iconColor = seg === 'my' ? '#F43F5E' : '#3B82F6'
            const chipBg = seg === 'my' ? 'bg-rose-50' : 'bg-blue-50'
            const chipText = seg === 'my' ? 'text-rose-600' : 'text-blue-600'
            return (
              <Pressable
                onPress={() => onRowPress(r)}
                className="bg-surface rounded-2xl p-4 border border-border flex-row items-center active:bg-background"
              >
                <View
                  className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center mr-3`}
                >
                  <Ionicons name="person" size={20} color={iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink">{name}</Text>
                  <View className="flex-row items-center mt-1">
                    <View className={`${chipBg} rounded-full px-2 py-0.5 mr-2`}>
                      <Text className={`text-xs ${chipText}`}>{r.relation_type}</Text>
                    </View>
                    <Text className="text-xs text-ink-faint">{r.status}</Text>
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

import { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { caresAPI } from '../../src/services/api'
import { haptics } from '../../src/utils/haptics'
import { SkeletonRow } from '../../src/components/Skeleton'

interface CareMeRow {
  id: number
  supervisor_id: number
  relation_type: string
  status: string
  supervisor_name?: string
}

export default function CareMeScreen() {
  const router = useRouter()
  const [rows, setRows] = useState<CareMeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    caresAPI
      .getCaresme()
      .then((r) => setRows((r.data as any).cares_me ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View className="flex-1 bg-background dark:bg-slate-900">
      <View className="p-5">
        <Text className="text-2xl font-bold text-ink dark:text-slate-100">关心我的人</Text>
        <Text className="text-sm text-ink-muted dark:text-slate-400 mt-1">共 {rows.length} 人</Text>
      </View>
      {loading ? (
        <View className="px-5 gap-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mb-5">
            <Ionicons name="people-outline" size={56} color="#3B82F6" />
          </View>
          <Text className="text-xl font-semibold text-ink dark:text-slate-100 mb-2">
            还没有人关心你
          </Text>
          <Text className="text-sm text-ink-muted dark:text-slate-400 text-center">
            把你的邀请码分享给亲友
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96, gap: 12 }}
          renderItem={({ item: r }) => (
            <Pressable
              onPress={() => {
                haptics.light()
                router.push({
                  pathname: '/care/[userId]',
                  params: { userId: String(r.supervisor_id) },
                })
              }}
              className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700 flex-row items-center active:bg-background dark:active:bg-slate-900 active:scale-[0.98]"
            >
              <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink dark:text-slate-100">
                  {r.supervisor_name ?? `用户 #${r.supervisor_id}`}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-blue-50 dark:bg-blue-900/30 rounded-full px-2 py-0.5 mr-2">
                    <Text className="text-xs text-blue-600">{r.relation_type}</Text>
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
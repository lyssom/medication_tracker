import { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { planAPI } from '../../src/services/api'
import { haptics } from '../../src/utils/haptics'
import { Skeleton, SkeletonRow } from '../../src/components/Skeleton'

interface PlanItem {
  id: number
  medication_id: number
  medication_name?: string
  scheduled_time: string
  dose: number
  dose_unit: string
  is_taken: boolean
}

export default function CareDetailScreen() {
  const router = useRouter()
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const [plans, setPlans] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    planAPI
      .getCareTodayPlan(Number(userId))
      .then((r) => {
        const data = (r.data as any).data ?? []
        setPlans(data)
      })
      .catch((e) => {
        haptics.warn()
        setError(e?.message ?? '加载失败')
      })
      .finally(() => setLoading(false))
  }, [userId])

  const completedCount = plans.filter((p) => p.is_taken).length
  const totalCount = plans.length
  const complianceRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <View className="flex-1 bg-background dark:bg-slate-900">
        <View className="bg-surface dark:bg-slate-800 px-5 pt-12 pb-4 border-b border-divider dark:border-slate-700 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-background dark:bg-slate-900 mr-3" />
          <View className="flex-1">
            <Skeleton width={60} height={10} />
            <View className="h-1.5" />
            <Skeleton width="40%" height={18} />
          </View>
        </View>
        <View className="bg-surface dark:bg-slate-800 px-5 pt-4 pb-5 border-b border-divider dark:border-slate-700">
          <Skeleton width={80} height={10} />
          <View className="h-2" />
          <Skeleton width="50%" height={28} />
          <View className="h-3" />
          <Skeleton width="100%" height={6} rounded={999} />
        </View>
        <View className="px-5 pt-3 gap-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background dark:bg-slate-900">
      {/* Header */}
      <View className="bg-surface dark:bg-slate-800 px-5 pt-12 pb-4 border-b border-divider dark:border-slate-700 flex-row items-center">
        <Pressable
          onPress={() => {
            haptics.light()
            router.back()
          }}
          hitSlop={12}
          className="w-10 h-10 rounded-full bg-background dark:bg-slate-900 items-center justify-center mr-3 active:bg-divider active:scale-95"
        >
          <Ionicons name="chevron-back" size={22} color="#1F2937" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xs text-ink-muted dark:text-slate-400">关心对象</Text>
          <Text className="text-xl font-bold text-ink dark:text-slate-100 mt-0.5">
            用户 #{userId}
          </Text>
        </View>
      </View>

      {/* Stats header */}
      <View className="bg-surface dark:bg-slate-800 px-5 pt-4 pb-5 border-b border-divider dark:border-slate-700">
        <Text className="text-sm text-ink-muted dark:text-slate-400">今日服药</Text>
        <Text className="text-3xl font-bold text-ink dark:text-slate-100 mt-1">
          {completedCount}
          <Text className="text-lg text-ink-faint dark:text-slate-500">/{totalCount}</Text>
        </Text>
        <View className="flex-row items-center mt-2">
          <View className="flex-1 h-2 bg-background dark:bg-slate-900 rounded-full overflow-hidden mr-3">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${complianceRate}%` }}
            />
          </View>
          <Text className="text-sm font-semibold text-primary">{complianceRate}%</Text>
        </View>
      </View>

      {/* List */}
      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#F43F5E" />
          <Text className="text-danger mt-3">{error}</Text>
        </View>
      ) : plans.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 rounded-full bg-primary-soft dark:bg-emerald-900/40 items-center justify-center mb-5">
            <Ionicons name="clipboard-outline" size={56} color="#10B981" />
          </View>
          <Text className="text-lg font-semibold text-ink dark:text-slate-100 mb-2">
            今日还没有服药计划
          </Text>
          <Text className="text-sm text-ink-muted dark:text-slate-400 text-center">
            添加药物后会自动生成每日计划
          </Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ padding: 20, paddingBottom: 96, gap: 12 }}
          renderItem={({ item: p }) => (
            <View className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700 flex-row items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  p.is_taken ? 'bg-primary' : 'bg-background dark:bg-slate-900'
                }`}
              >
                <Ionicons
                  name={p.is_taken ? 'checkmark' : 'ellipse-outline'}
                  size={p.is_taken ? 20 : 18}
                  color={p.is_taken ? '#fff' : '#9CA3AF'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink dark:text-slate-100">
                  {p.medication_name ?? `药物 #${p.medication_id}`}
                </Text>
                <Text className="text-xs text-ink-muted dark:text-slate-400 mt-0.5">
                  {p.scheduled_time} · {p.dose}
                  {p.dose_unit}
                </Text>
              </View>
              <View
                className={`px-2.5 py-1 rounded-full ${
                  p.is_taken
                    ? 'bg-primary-soft dark:bg-emerald-900/40'
                    : 'bg-background dark:bg-slate-900'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    p.is_taken ? 'text-primary dark:text-emerald-400' : 'text-ink-muted dark:text-slate-400'
                  }`}
                >
                  {p.is_taken ? '已服药' : '未服药'}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}
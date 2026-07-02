import { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { planAPI } from '../../src/services/api'

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
      .catch((e) => setError(e?.message ?? '加载失败'))
      .finally(() => setLoading(false))
  }, [userId])

  const completedCount = plans.filter((p) => p.is_taken).length
  const totalCount = plans.length
  const complianceRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#10B981" size="large" />
        <Text className="mt-3 text-ink-muted">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface px-5 pt-12 pb-4 border-b border-divider flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3 active:bg-divider"
        >
          <Ionicons name="chevron-back" size={22} color="#1F2937" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xs text-ink-muted">关心对象</Text>
          <Text className="text-xl font-bold text-ink mt-0.5">用户 #{userId}</Text>
        </View>
      </View>

      {/* Stats header */}
      <View className="bg-surface px-5 pt-4 pb-5 border-b border-divider">
        <Text className="text-sm text-ink-muted">今日服药</Text>
        <Text className="text-3xl font-bold text-ink mt-1">
          {completedCount}<Text className="text-lg text-ink-faint">/{totalCount}</Text>
        </Text>
        <View className="flex-row items-center mt-2">
          <View className="flex-1 h-2 bg-background rounded-full overflow-hidden mr-3">
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
          <Text className="text-danger">{error}</Text>
        </View>
      ) : plans.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="clipboard-outline" size={80} color="#F3E9DA" />
          <Text className="text-ink-muted mt-3">今日还没有服药计划</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ padding: 20, paddingBottom: 96, gap: 12 }}
          renderItem={({ item: p }) => (
            <View className="bg-surface rounded-2xl p-4 border border-border flex-row items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  p.is_taken ? 'bg-primary' : 'bg-background'
                }`}
              >
                <Ionicons
                  name={p.is_taken ? 'checkmark' : 'ellipse-outline'}
                  size={p.is_taken ? 20 : 18}
                  color={p.is_taken ? '#fff' : '#9CA3AF'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-ink">
                  {p.medication_name ?? `药物 #${p.medication_id}`}
                </Text>
                <Text className="text-xs text-ink-muted mt-0.5">
                  {p.scheduled_time} · {p.dose}
                  {p.dose_unit}
                </Text>
              </View>
              <View
                className={`px-2.5 py-1 rounded-full ${
                  p.is_taken ? 'bg-primary-soft' : 'bg-background'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    p.is_taken ? 'text-primary' : 'text-ink-muted'
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
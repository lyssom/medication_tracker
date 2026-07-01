import { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#10B981" size="large" />
        <Text className="mt-3 text-gray-500">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Stats header */}
      <View className="bg-white px-5 pt-5 pb-6 border-b border-gray-100">
        <Text className="text-sm text-gray-500">今日服药</Text>
        <Text className="text-3xl font-bold text-gray-900 mt-1">
          {completedCount}<Text className="text-lg text-gray-400">/{totalCount}</Text>
        </Text>
        <View className="flex-row items-center mt-2">
          <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mr-3">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${complianceRate}%` }}
            />
          </View>
          <Text className="text-sm font-semibold text-emerald-600">{complianceRate}%</Text>
        </View>
      </View>

      {/* List */}
      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500">{error}</Text>
        </View>
      ) : plans.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-3">📋</Text>
          <Text className="text-gray-600">今日还没有服药计划</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item: p }) => (
            <View className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  p.is_taken ? 'bg-emerald-500' : 'bg-gray-100'
                }`}
              >
                <Text className={p.is_taken ? 'text-white text-lg' : 'text-gray-400 text-lg'}>
                  {p.is_taken ? '✓' : '○'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {p.medication_name ?? `药物 #${p.medication_id}`}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {p.scheduled_time} · {p.dose}
                  {p.dose_unit}
                </Text>
              </View>
              <View
                className={`px-2.5 py-1 rounded-full ${
                  p.is_taken ? 'bg-emerald-50' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    p.is_taken ? 'text-emerald-600' : 'text-gray-500'
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
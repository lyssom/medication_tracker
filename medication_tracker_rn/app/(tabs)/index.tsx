import { useEffect, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { planAPI } from '../../src/services/api'

interface TodayPlan {
  id: number
  medication_id: number
  medication_name: string
  scheduled_time: string
  dose: number
  dose_unit: string
  is_taken: boolean
}

function timeUntil(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const target = new Date()
  target.setHours(h ?? 8, m ?? 0, 0, 0)
  if (target < new Date()) target.setDate(target.getDate() + 1)
  const diffMs = target.getTime() - Date.now()
  const totalMin = Math.max(0, Math.floor(diffMs / 60000))
  const hh = Math.floor(totalMin / 60)
  const mm = totalMin % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`
}

export default function HomeScreen() {
  const [plans, setPlans] = useState<TodayPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      await planAPI.regenerateToday().catch(() => {})
      const r = await planAPI.getTodayPlan()
      setPlans(r.data ?? [])
    } catch (e) {
      console.warn('load plans failed', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const takenCount = plans.filter((p) => p.is_taken).length
  const next = plans.find((p) => !p.is_taken)

  const onCheckin = async (planId: number) => {
    setBusyId(planId)
    setPlans((cur) => cur.map((p) => (p.id === planId ? { ...p, is_taken: true } : p)))
    try {
      await planAPI.markTaken({ plan_id: planId })
    } catch (e) {
      setPlans((cur) => cur.map((p) => (p.id === planId ? { ...p, is_taken: false } : p)))
      console.warn('checkin failed', e)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
    >
      <View className="mb-4">
        <Text className="text-sm text-ink-muted">早上好</Text>
        <Text className="text-2xl font-bold text-ink mt-1">今日服药</Text>
      </View>

      {/* Hero card */}
      <View className="bg-primary rounded-3xl p-6 shadow-warm mb-4">
        {loading && plans.length === 0 ? (
          <View className="items-center py-4">
            <ActivityIndicator color="#fff" />
          </View>
        ) : next ? (
          <>
            <Text className="text-white/90 text-sm font-semibold">下一服药</Text>
            <Text className="text-white text-5xl font-bold mt-2 tracking-tight">
              {next.scheduled_time}
            </Text>
            <View className="mt-3 h-px bg-white/25" />
            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-white/90 text-sm font-medium">
                距现在 {timeUntil(next.scheduled_time)}
              </Text>
              <View className="bg-white/25 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-bold">
                  {takenCount}/{plans.length} 已服
                </Text>
              </View>
            </View>
          </>
        ) : plans.length > 0 ? (
          <>
            <Text className="text-white/90 text-sm font-semibold">今日已完成</Text>
            <Text className="text-white text-5xl font-bold mt-2 tracking-tight">100%</Text>
            <View className="mt-3 h-px bg-white/25" />
            <Text className="text-white/90 text-sm font-medium mt-3">
              {plans.length} 项全部完成 ✓
            </Text>
          </>
        ) : (
          <>
            <Text className="text-white/90 text-sm font-semibold">今日无计划</Text>
            <Text className="text-white text-3xl font-bold mt-2 tracking-tight">—</Text>
            <View className="mt-3 h-px bg-white/25" />
            <Text className="text-white/90 text-sm font-medium mt-3">
              到「药物」页添加第一项
            </Text>
          </>
        )}
      </View>

      {/* Quick stats */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-3xl font-bold text-primary">{takenCount}</Text>
          <Text className="text-xs text-ink-muted mt-1">已服</Text>
        </View>
        <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-3xl font-bold text-accent">{plans.length - takenCount}</Text>
          <Text className="text-xs text-ink-muted mt-1">待服</Text>
        </View>
        <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-3xl font-bold text-blue-500">
            {plans.length > 0 ? Math.round((takenCount / plans.length) * 100) : 0}%
          </Text>
          <Text className="text-xs text-ink-muted mt-1">依从率</Text>
        </View>
      </View>

      {/* Today's plan list */}
      <View className="bg-surface rounded-2xl p-4 border border-border">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-ink">今日时间表</Text>
          <Pressable onPress={load} hitSlop={10} className="flex-row items-center px-2 py-1">
            <Ionicons name="refresh" size={14} color="#10B981" />
            <Text className="text-primary text-sm ml-1">{loading ? '加载中…' : '刷新'}</Text>
          </Pressable>
        </View>
        {loading && plans.length === 0 ? (
          <View className="py-4">
            <ActivityIndicator color="#10B981" />
          </View>
        ) : plans.length === 0 ? (
          <Text className="text-sm text-ink-faint text-center py-6">
            还没有药物,去「药物」页添加
          </Text>
        ) : (
          plans.map((p, i) => {
            const isBusy = busyId === p.id
            return (
              <View
                key={p.id}
                className={`flex-row items-center py-2.5 px-2 -mx-2 ${
                  i > 0 ? 'border-t border-divider' : ''
                }`}
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                    p.is_taken ? 'bg-primary' : 'bg-accent-soft'
                  }`}
                >
                  {isBusy ? (
                    <ActivityIndicator size="small" color={p.is_taken ? '#fff' : '#F59E0B'} />
                  ) : p.is_taken ? (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={18} color="#F59E0B" />
                  )}
                </View>
                <Text className="text-sm font-semibold text-ink w-14">{p.scheduled_time}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink">{p.medication_name}</Text>
                  <Text className="text-xs text-ink-muted">
                    {p.dose}
                    {p.dose_unit} · {p.is_taken ? '已服' : '未服'}
                  </Text>
                </View>
                {p.is_taken ? (
                  <View className="bg-primary-soft rounded-full px-3 py-1.5">
                    <Text className="text-primary text-xs font-semibold">已服</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => {
                      if (!isBusy) onCheckin(p.id)
                    }}
                    disabled={isBusy}
                    hitSlop={10}
                    className="bg-accent rounded-full px-4 py-2 active:bg-accent-hover"
                  >
                    <Text className="text-white text-sm font-semibold">打卡</Text>
                  </Pressable>
                )}
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}

import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { planAPI } from '../../src/services/api'
import { haptics } from '../../src/utils/haptics'
import { computeAdherence, DayAdherence } from '../../src/utils/adherence'
import { Skeleton } from '../../src/components/Skeleton'
import { TrendBars } from '../../src/components/TrendBars'

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
  const [trend, setTrend] = useState<DayAdherence[]>([])

  const load = async () => {
    setLoading(true)
    try {
      await planAPI.regenerateToday().catch(() => {})
      const r = await planAPI.getTodayPlan()
      const today = r.data ?? []
      setPlans(today)
      // 趋势: 用今日数据填当日 (无历史时间戳, 单点)
      setTrend(computeAdherence(today, 7))
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
    haptics.success()
    setBusyId(planId)
    setPlans((cur) => cur.map((p) => (p.id === planId ? { ...p, is_taken: true } : p)))
    try {
      await planAPI.markTaken({ plan_id: planId })
      // 同步更新 trend 当日
      setTrend((t) => {
        const last = t[t.length - 1]
        if (!last) return t
        const newTaken = last.taken + 1
        const newTotal = last.total + 1
        return [
          ...t.slice(0, -1),
          { ...last, taken: newTaken, total: newTotal, rate: newTotal > 0 ? newTaken / newTotal : 0 },
        ]
      })
    } catch (e) {
      haptics.warn()
      setPlans((cur) => cur.map((p) => (p.id === planId ? { ...p, is_taken: false } : p)))
      console.warn('checkin failed', e)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-slate-900"
      contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
    >
      <View className="mb-4">
        <Text className="text-sm text-ink-muted dark:text-slate-400">早上好</Text>
        <Text className="text-2xl font-display font-bold text-ink dark:text-slate-100 mt-1">
          今日服药
        </Text>
      </View>

      {/* Hero card */}
      <View className="bg-primary rounded-3xl p-6 shadow-warm mb-4">
        {loading && plans.length === 0 ? (
          <View className="py-2">
            <Skeleton width="40%" height={14} className="bg-white/30" />
            <View className="h-3" />
            <Skeleton width="70%" height={44} rounded={12} className="bg-white/30" />
            <View className="h-3" />
            <Skeleton width="50%" height={12} className="bg-white/30" />
          </View>
        ) : next ? (
          <>
            <Text className="text-white/90 text-sm font-semibold">下一服药</Text>
            <Text className="text-white text-5xl font-display font-extrabold mt-2 tracking-tight">
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
            <Text className="text-white text-5xl font-display font-extrabold mt-2 tracking-tight">100%</Text>
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
        <View className="flex-1 bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700">
          <Text className="text-3xl font-bold text-primary">{takenCount}</Text>
          <Text className="text-xs text-ink-muted dark:text-slate-400 mt-1">已服</Text>
        </View>
        <View className="flex-1 bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700">
          <Text className="text-3xl font-bold text-accent">{plans.length - takenCount}</Text>
          <Text className="text-xs text-ink-muted dark:text-slate-400 mt-1">待服</Text>
        </View>
        <View className="flex-1 bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700">
          <Text className="text-3xl font-bold text-blue-500">
            {plans.length > 0 ? Math.round((takenCount / plans.length) * 100) : 0}%
          </Text>
          <Text className="text-xs text-ink-muted dark:text-slate-400 mt-1">依从率</Text>
        </View>
      </View>

      {/* 7-day trend */}
      <View className="mb-4">
        <TrendBars data={trend} />
      </View>

      {/* Today's plan list */}
      <View className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-ink dark:text-slate-100">今日时间表</Text>
          <Pressable
            onPress={() => {
              haptics.light()
              load()
            }}
            hitSlop={10}
            className="flex-row items-center px-2 py-1 active:opacity-70"
          >
            <Ionicons name="refresh" size={14} color="#10B981" />
            <Text className="text-primary text-sm ml-1">{loading ? '加载中…' : '刷新'}</Text>
          </Pressable>
        </View>
        {loading && plans.length === 0 ? (
          <View className="gap-3">
            <Skeleton height={44} rounded={12} />
            <Skeleton height={44} rounded={12} />
            <Skeleton height={44} rounded={12} />
          </View>
        ) : plans.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons name="calendar-outline" size={48} color="#F3E9DA" />
            <Text className="text-sm text-ink-faint dark:text-slate-500 mt-3">
              还没有药物, 去「药物」页添加
            </Text>
          </View>
        ) : (
          plans.map((p, i) => {
            const isBusy = busyId === p.id
            return (
              <View
                key={p.id}
                className={`flex-row items-center py-2.5 px-2 -mx-2 ${
                  i > 0 ? 'border-t border-divider dark:border-slate-700' : ''
                }`}
              >
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                    p.is_taken ? 'bg-primary' : 'bg-accent-soft'
                  }`}
                >
                  {p.is_taken ? (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={18} color="#F59E0B" />
                  )}
                </View>
                <Text className="text-sm font-semibold text-ink dark:text-slate-100 w-14">
                  {p.scheduled_time}
                </Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink dark:text-slate-100">
                    {p.medication_name}
                  </Text>
                  <Text className="text-xs text-ink-muted dark:text-slate-400">
                    {p.dose}
                    {p.dose_unit} · {p.is_taken ? '已服' : '未服'}
                  </Text>
                </View>
                {p.is_taken ? (
                  <View className="bg-primary-soft dark:bg-emerald-900/40 rounded-full px-3 py-1.5">
                    <Text className="text-primary dark:text-emerald-400 text-xs font-semibold">已服</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => {
                      if (!isBusy) onCheckin(p.id)
                    }}
                    disabled={isBusy}
                    hitSlop={10}
                    className={`bg-accent rounded-full px-4 py-2 active:bg-accent-hover active:scale-95 ${
                      isBusy ? 'opacity-60' : ''
                    }`}
                  >
                    <Text className="text-white text-sm font-semibold">{isBusy ? '…' : '打卡'}</Text>
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
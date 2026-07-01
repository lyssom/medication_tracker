import * as React from 'react'
import { useEffect, useState } from 'react'
import { ScrollView, View, Alert } from 'react-native'
import {
  Card,
  Text,
  Divider,
  ActivityIndicator,
  Button,
} from 'react-native-paper'
import { planAPI } from '../../services/api'

type DailyPlan = {
  id: number
  user_id: number
  medication_id: number
  medication_name?: string
  scheduled_time: string
  dose: number
  dose_unit: string
  is_taken: boolean
  plan_date?: string
  status: 'taken' | 'pending'
}

export default function HomeScreen() {
  const [plans, setPlans] = useState<DailyPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [mode, setMode] = useState<'today' | 'all'>('today')

  useEffect(() => {
    loadPlans()
  }, [mode])

  // 根据模式加载计划
  const loadPlans = async () => {
    setLoading(true)
    try {
      const res =
        mode === 'today'
          ? await planAPI.getTodayPlan()
          : await planAPI.getAllPlan()

      const list = Array.isArray(res.data) ? res.data : []

      const withStatus: DailyPlan[] = list.map((p: any) => ({
        ...p,
        status: p.is_taken ? 'taken' : 'pending',
      }))

      setPlans(withStatus)
    } catch (e) {
      console.error('loadPlans failed', e)
      setPlans([])
      Alert.alert('加载失败', '获取用药计划失败')
    } finally {
      setLoading(false)
    }
  }

  // 标记已服药
  const markAsTaken = async (planId: number) => {
    setUpdatingId(planId)
    try {
      const res = await planAPI.markTaken({ plan_id: planId })
      if (res.data?.success) {
        await loadPlans()
      } else {
        Alert.alert('操作失败', res.data?.message ?? '标记失败')
      }
    } catch (e) {
      Alert.alert('操作失败', '标记已服药失败')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* 标题 + 切换 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text variant="titleLarge">
          {mode === 'today' ? '今日吃药' : '全部用药记录'}
        </Text>

        <Button
          mode="outlined"
          compact
          onPress={() =>
            setMode((m) => (m === 'today' ? 'all' : 'today'))
          }
        >
          {mode === 'today' ? '全部' : '今日'}
        </Button>
      </View>

      {/* 列表 */}
      {plans.length > 0 ? (
        plans.map((p) => (
          <Card key={p.id} style={{ marginBottom: 12, padding: 12 }}>
            <Text variant="titleMedium">
              {p.medication_name ?? `药物 #${p.medication_id}`}
            </Text>

            <Divider style={{ marginVertical: 6 }} />

            {mode === 'all' && p.plan_date && (
              <Text variant="bodySmall">日期：{p.plan_date}</Text>
            )}

            <Text variant="bodyMedium">时间：{p.scheduled_time}</Text>
            <Text variant="bodyMedium">
              剂量：{p.dose} {p.dose_unit}
            </Text>

            <Text
              variant="bodySmall"
              style={{
                marginTop: 4,
                marginBottom: 8,
                color: p.status === 'taken' ? '#2e7d32' : '#f57c00',
              }}
            >
              {p.status === 'taken' ? '已服用' : '未服用'}
            </Text>

            {mode === 'today' && p.status !== 'taken' && (
              <Button
                mode="contained"
                onPress={() => markAsTaken(p.id)}
                loading={updatingId === p.id}
              >
                ✓ 已服药
              </Button>
            )}
          </Card>
        ))
      ) : (
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Text variant="bodyMedium">
            {mode === 'today'
              ? '今天没有药物安排'
              : '暂无用药记录'}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

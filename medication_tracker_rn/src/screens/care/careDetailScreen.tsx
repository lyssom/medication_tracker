// screens/care/CareDetailScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, ScrollView } from 'react-native'
import { Text, Card, Divider, ActivityIndicator } from 'react-native-paper'
import { planAPI } from '../../services/api'

interface Props {
  userId: number
  username: string
}

export default function CareDetailScreen({ userId, username }: Props) {
  console.log('userId', userId)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await planAPI.getCareTodayPlan(userId)
        setPlans(res.data.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  if (loading) return <ActivityIndicator />

  return (
    <ScrollView>
      <Text variant="titleLarge">{username} · 今日服药</Text>

      {plans.map((p) => (
        <Card key={p.id} style={{ marginVertical: 8 }}>
          <Card.Content>
            <Text>{p.medication_name}</Text>
            <Divider />
            <Text>时间：{p.scheduled_time}</Text>
            <Text>
              剂量：{p.dose} {p.dose_unit}
            </Text>
            <Text>{p.is_taken ? '✅ 已服用' : '⏳ 未服用'}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  )
}

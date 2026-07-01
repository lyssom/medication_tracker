import { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { caresAPI } from '../../src/services/api'

interface CareMeRow {
  id: number
  supervisor_id: number
  relation_type: string
  status: string
  supervisor_name?: string
}

export default function CareMeScreen() {
  const [rows, setRows] = useState<CareMeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    caresAPI
      .getCaresme()
      .then((r) => setRows((r.data as any).cares_me ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-5">
        <Text className="text-2xl font-bold text-gray-900">关心我的人</Text>
        <Text className="text-sm text-gray-500 mt-1">共 {rows.length} 人</Text>
      </View>
      {rows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-7xl mb-4">👥</Text>
          <Text className="text-lg font-semibold text-gray-700 mb-2">还没有人关心你</Text>
          <Text className="text-sm text-gray-500 text-center">把你的邀请码分享给亲友</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}
          renderItem={({ item: r }) => (
            <View className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Text className="text-lg">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {r.supervisor_name ?? `用户 #${r.supervisor_id}`}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-blue-50 rounded-full px-2 py-0.5 mr-2">
                    <Text className="text-xs text-blue-600">{r.relation_type}</Text>
                  </View>
                  <Text className="text-xs text-gray-400">{r.status}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}
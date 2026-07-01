import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native'
import { caresAPI } from '../../src/services/api'

interface CareRow {
  id: number
  supervised_id: number
  relation_type: string
  status: string
  supervised_name?: string
}

export default function CareScreen() {
  const [rows, setRows] = useState<CareRow[]>([])
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState('')
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await caresAPI.getmyCares()
      setRows((r.data as any).my_cares ?? [])
    } catch {
      setErr('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const add = async () => {
    if (!invite.trim()) return
    setAdding(true)
    try {
      await caresAPI.addCare({ invite_code: invite.trim() })
      setInvite('')
      await load()
    } catch (e: any) {
      Alert.alert('添加失败', e?.response?.data?.msg ?? '未知错误')
    } finally {
      setAdding(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Add section */}
      <View className="bg-white p-5 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-900 mb-1">添加关心</Text>
        <Text className="text-xs text-gray-500 mb-3">输入对方邀请码</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50 mr-2"
            placeholder="如：ABC123"
            value={invite}
            onChangeText={setInvite}
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
          <Pressable
            onPress={add}
            disabled={adding}
            className={`bg-emerald-500 rounded-xl px-6 py-3 active:bg-emerald-600 ${adding ? 'opacity-60' : ''}`}
          >
            {adding ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">添加</Text>}
          </Pressable>
        </View>
      </View>

      {/* List */}
      {err ? <Text className="text-red-500 text-center py-3">{err}</Text> : null}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-7xl mb-4">💝</Text>
          <Text className="text-lg font-semibold text-gray-700 mb-2">还没有关心任何人</Text>
          <Text className="text-sm text-gray-500 text-center">输入邀请码开始关心你爱的人</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item: r }) => (
            <View className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center mr-3">
                <Text className="text-lg">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {r.supervised_name ?? `用户 #${r.supervised_id}`}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-pink-50 rounded-full px-2 py-0.5 mr-2">
                    <Text className="text-xs text-pink-600">{r.relation_type}</Text>
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
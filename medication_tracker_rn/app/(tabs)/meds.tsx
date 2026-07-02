import { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMedStore } from '../../src/store/useMedStore'

export default function MedsTab() {
  const meds = useMedStore((s) => s.medications)
  const isLoading = useMedStore((s) => s.isLoading)
  const fetchMedications = useMedStore((s) => s.fetchMedications)
  const deleteMedication = useMedStore((s) => s.deleteMedication)
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchMedications().catch(() => {})
    setRefreshing(false)
  }

  useEffect(() => {
    fetchMedications().catch(() => {})
  }, [])

  const confirmDelete = (medId: number, name: string) => {
    Alert.alert('删除药物', `确定删除「${name}」？打卡记录会一并删除。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(medId)
          try {
            await deleteMedication(medId)
          } catch (e: any) {
            Alert.alert('删除失败', e?.message ?? '未知错误')
          } finally {
            setDeletingId(null)
          }
        },
      },
    ])
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
        <View>
          <Text className="text-2xl font-bold text-ink">我的药物</Text>
          <Text className="text-sm text-ink-muted mt-0.5">共 {meds.length} 项</Text>
        </View>
        <Pressable
          onPress={() => router.push('/meds/add')}
          className="bg-primary rounded-full px-5 py-2.5 active:bg-primary-hover shadow-warm-sm flex-row items-center"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-1">添加</Text>
        </Pressable>
      </View>

      {/* Content */}
      {isLoading && meds.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : meds.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="medkit-outline" size={80} color="#F3E9DA" />
          <Text className="text-lg font-semibold text-ink mt-4 mb-2">还没有药物</Text>
          <Text className="text-sm text-ink-muted text-center">
            点击右上角「添加」开始管理你的药物清单
          </Text>
        </View>
      ) : (
        <FlatList
          data={meds}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
          }
          renderItem={({ item: m }) => (
            <View className="bg-surface rounded-2xl p-4 border border-border flex-row items-center">
              <Pressable
                onPress={() => router.push({ pathname: '/meds/add', params: { id: String(m.id) } })}
                className="flex-row items-center flex-1 active:opacity-70"
              >
                <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center mr-3">
                  <Ionicons name="medkit" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink">{m.name}</Text>
                  <Text className="text-xs text-ink-muted mt-0.5">
                    {m.alias ?? '无别名'} · 库存 {m.stock}
                    {m.unit}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => confirmDelete(m.id, m.name)}
                disabled={deletingId === m.id}
                hitSlop={10}
                className="ml-2 w-10 h-10 rounded-full bg-danger-soft items-center justify-center active:bg-rose-100"
              >
                {deletingId === m.id ? (
                  <ActivityIndicator size="small" color="#F43F5E" />
                ) : (
                  <Ionicons name="close" size={20} color="#F43F5E" />
                )}
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  )
}

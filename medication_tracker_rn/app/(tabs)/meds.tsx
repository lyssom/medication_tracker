import { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMedStore } from '../../src/store/useMedStore'
import { haptics } from '../../src/utils/haptics'
import { SkeletonCard } from '../../src/components/Skeleton'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirmDelete = (medId: number, name: string) => {
    Alert.alert('删除药物', `确定删除「${name}」？打卡记录会一并删除。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          haptics.warn()
          setDeletingId(medId)
          try {
            await deleteMedication(medId)
            haptics.success()
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
    <View className="flex-1 bg-background dark:bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
        <View>
          <Text className="text-2xl font-bold text-ink dark:text-slate-100">我的药物</Text>
          <Text className="text-sm text-ink-muted dark:text-slate-400 mt-0.5">
            共 {meds.length} 项
          </Text>
        </View>
        <Pressable
          onPress={() => {
            haptics.medium()
            router.push('/meds/add')
          }}
          className="bg-primary rounded-full px-5 py-2.5 active:bg-primary-hover active:scale-95 shadow-warm-sm flex-row items-center"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white font-semibold ml-1">添加</Text>
        </Pressable>
      </View>

      {/* Content */}
      {isLoading && meds.length === 0 ? (
        <View className="px-5 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : meds.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-primary-soft dark:bg-emerald-900/40 items-center justify-center mb-5">
            <Ionicons name="medkit-outline" size={56} color="#10B981" />
          </View>
          <Text className="text-xl font-semibold text-ink dark:text-slate-100 mb-2">
            还没有药物
          </Text>
          <Text className="text-sm text-ink-muted dark:text-slate-400 text-center mb-6">
            添加你的第一个药物，开始管理每日服药计划
          </Text>
          <Pressable
            onPress={() => {
              haptics.medium()
              router.push('/meds/add')
            }}
            className="bg-primary rounded-full px-6 py-3 active:bg-primary-hover active:scale-95 shadow-warm-sm flex-row items-center"
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="text-white font-semibold ml-1">添加第一个药物</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={meds}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
            />
          }
          renderItem={({ item: m }) => (
            <View className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700 flex-row items-center">
              <Pressable
                onPress={() => {
                  haptics.light()
                  router.push({ pathname: '/meds/add', params: { id: String(m.id) } })
                }}
                className="flex-row items-center flex-1 active:opacity-70"
              >
                <View className="w-10 h-10 rounded-full bg-primary-soft dark:bg-emerald-900/40 items-center justify-center mr-3">
                  <Ionicons name="medkit" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink dark:text-slate-100">
                    {m.name}
                  </Text>
                  <Text className="text-xs text-ink-muted dark:text-slate-400 mt-0.5">
                    {m.alias ?? '无别名'} · 库存 {m.stock}
                    {m.unit}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => confirmDelete(m.id, m.name)}
                disabled={deletingId === m.id}
                hitSlop={10}
                className="ml-2 w-10 h-10 rounded-full bg-danger-soft dark:bg-rose-900/30 items-center justify-center active:bg-rose-100"
              >
                {deletingId === m.id ? (
                  <Ionicons name="hourglass-outline" size={18} color="#F43F5E" />
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
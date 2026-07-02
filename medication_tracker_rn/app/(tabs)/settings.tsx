import { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  Alert,
  Switch,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../src/store/useAuthStore'
import { useVersionStore } from '../../src/store/useVersionStore'
import { useThemeStore } from '../../src/store/useThemeStore'
import { useMedStore } from '../../src/store/useMedStore'
import { planAPI } from '../../src/services/api'
import { haptics } from '../../src/utils/haptics'

interface UpcomingDose {
  id: number
  medication_name: string
  scheduled_time: string
}

export default function SettingsScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const latest = useVersionStore((s) => s.latest)
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const medsCount = useMedStore((s) => s.medications.length)
  const [upcoming, setUpcoming] = useState<UpcomingDose[]>([])

  useEffect(() => {
    planAPI
      .getTodayPlan()
      .then((r) => {
        const plans = (r.data ?? []) as any[]
        setUpcoming(
          plans
            .filter((p) => !p.is_taken)
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              medication_name: p.medication_name,
              scheduled_time: p.scheduled_time,
            }))
        )
      })
      .catch(() => {})
  }, [])

  const onLogout = async () => {
    await logout()
    router.replace('/auth/login')
  }

  const toggleDark = (v: boolean) => {
    haptics.light()
    setMode(v ? 'dark' : 'light')
  }

  const onExport = () => {
    Alert.alert('数据导出', '该功能开发中，敬请期待')
  }

  const versionLabel = latest
    ? `v${latest.version} (build ${latest.build})`
    : 'v0.0.1'

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-slate-900"
      contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
    >
      <Text className="text-2xl font-bold text-ink dark:text-slate-100 mb-5">设置</Text>

      {/* Profile */}
      <View className="bg-surface dark:bg-slate-800 rounded-2xl p-5 border border-border dark:border-slate-700 flex-row items-center mb-4">
        <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mr-4">
          <Text className="text-white text-2xl font-bold">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-ink-muted dark:text-slate-400">当前账户</Text>
          <Text className="text-lg font-semibold text-ink dark:text-slate-100 mt-0.5">
            {user?.username ?? '未登录'}
          </Text>
          {user?.invite_code && (
            <Text className="text-xs text-ink-faint dark:text-slate-500 mt-0.5">
              邀请码: {user.invite_code}
            </Text>
          )}
        </View>
      </View>

      {/* Reminders summary */}
      <View className="bg-surface dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 mb-3 overflow-hidden">
        <View className="flex-row items-center px-5 py-4 border-b border-divider dark:border-slate-700">
          <View className="w-10 h-10 rounded-full bg-primary-soft dark:bg-emerald-900/40 items-center justify-center mr-3">
            <Ionicons name="alarm-outline" size={20} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-base text-ink dark:text-slate-100 font-medium">服药提醒</Text>
            <Text className="text-xs text-ink-muted dark:text-slate-400 mt-0.5">
              {medsCount} 种药物 · {upcoming.length} 项今日待服
            </Text>
          </View>
        </View>
        {upcoming.length > 0 ? (
          <View className="px-5 py-3 gap-2">
            {upcoming.map((d) => (
              <View key={d.id} className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text className="text-sm text-ink dark:text-slate-100 ml-2 font-semibold w-14">
                  {d.scheduled_time}
                </Text>
                <Text className="text-sm text-ink-muted dark:text-slate-400 flex-1">
                  {d.medication_name}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="px-5 py-4">
            <Text className="text-sm text-ink-faint dark:text-slate-500">
              今日无待服药计划
            </Text>
          </View>
        )}
      </View>

      {/* Dark mode */}
      <View className="bg-surface dark:bg-slate-800 rounded-2xl px-5 py-4 border border-border dark:border-slate-700 flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-3">
          <Ionicons
            name={mode === 'dark' ? 'moon' : 'moon-outline'}
            size={20}
            color={mode === 'dark' ? '#FCD34D' : '#6B7280'}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base text-ink dark:text-slate-100 font-medium">深色模式</Text>
          <Text className="text-xs text-ink-muted dark:text-slate-400 mt-0.5">
            切换更舒适的视觉体验
          </Text>
        </View>
        <Switch
          value={mode === 'dark'}
          onValueChange={toggleDark}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#fff"
        />
      </View>

      {/* Export (placeholder) */}
      <Pressable
        onPress={onExport}
        className="bg-surface dark:bg-slate-800 rounded-2xl px-5 py-4 border border-border dark:border-slate-700 flex-row items-center active:bg-background dark:active:bg-slate-900 mb-3"
      >
        <View className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 items-center justify-center mr-3">
          <Ionicons name="archive-outline" size={20} color="#F59E0B" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-ink dark:text-slate-100 font-medium">数据导出</Text>
          <Text className="text-xs text-ink-muted dark:text-slate-400 mt-0.5">
            导出打卡记录 (开发中)
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </Pressable>

      {/* About */}
      <View className="bg-surface dark:bg-slate-800 rounded-2xl px-5 py-4 border border-border dark:border-slate-700 flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3">
          <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-ink dark:text-slate-100 font-medium">关于</Text>
          <Text className="text-xs text-ink-muted dark:text-slate-400 mt-0.5">
            药伴 · {versionLabel}
          </Text>
        </View>
      </View>

      {/* Logout */}
      <Pressable
        onPress={() => {
          Alert.alert('退出登录', '确定退出当前账户？', [
            { text: '取消', style: 'cancel' },
            {
              text: '退出',
              style: 'destructive',
              onPress: () => {
                haptics.warn()
                onLogout()
              },
            },
          ])
        }}
        className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-danger-soft dark:border-rose-900/40 active:bg-rose-50 dark:active:bg-rose-900/20 mt-3"
      >
        <Text className="text-danger text-center font-semibold">退出登录</Text>
      </Pressable>
    </ScrollView>
  )
}
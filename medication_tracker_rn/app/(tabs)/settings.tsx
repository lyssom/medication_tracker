import { View, Text, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/store/useAuthStore'

interface MenuItem {
  icon: string
  label: string
  sub: string
  onPress: () => void
}

export default function SettingsScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const placeholder = (label: string) => () =>
    Alert.alert(label, '该功能开发中')

  const menu: MenuItem[] = [
    { icon: '🔔', label: '服药提醒', sub: '到点通知', onPress: placeholder('服药提醒') },
    { icon: '🌙', label: '深色模式', sub: '跟随系统', onPress: placeholder('深色模式') },
    { icon: '📦', label: '数据导出', sub: '导出打卡记录', onPress: placeholder('数据导出') },
    { icon: 'ℹ️', label: '关于', sub: 'v0.0.1', onPress: placeholder('关于') },
  ]

  return (
    <View className="flex-1 bg-background p-5 pb-24">
      <Text className="text-2xl font-bold text-gray-900 mb-5">设置</Text>

      {/* Profile card */}
      <View className="bg-white rounded-2xl p-5 border border-gray-100 flex-row items-center mb-3">
        <View className="w-14 h-14 rounded-full bg-emerald-500 items-center justify-center mr-4">
          <Text className="text-white text-2xl font-bold">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500">当前账户</Text>
          <Text className="text-lg font-semibold text-gray-900 mt-0.5">
            {user?.username ?? '未登录'}
          </Text>
        </View>
      </View>

      {/* Menu items */}
      {menu.map((item) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          className="bg-white rounded-2xl px-5 py-4 border border-gray-100 flex-row items-center active:bg-gray-50 mb-2"
        >
          <Text className="text-2xl mr-3">{item.icon}</Text>
          <View className="flex-1">
            <Text className="text-base text-gray-900">{item.label}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">{item.sub}</Text>
          </View>
          <Text className="text-gray-300 text-xl">›</Text>
        </Pressable>
      ))}

      {/* Logout */}
      <Pressable
        onPress={async () => {
          await logout()
          router.replace('/auth/login')
        }}
        className="bg-white rounded-2xl p-4 border border-red-100 active:bg-red-50 mt-3"
      >
        <Text className="text-red-500 text-center font-semibold">退出登录</Text>
      </Pressable>
    </View>
  )
}
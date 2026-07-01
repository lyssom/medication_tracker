import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'

export default function CareTab() {
  const router = useRouter()
  return (
    <View className="flex-1 bg-gray-50 p-5">
      <Text className="text-2xl font-bold text-gray-900 mb-1">关心</Text>
      <Text className="text-sm text-gray-500 mb-5">查看关心你和被你关心的人</Text>

      <Pressable
        onPress={() => router.push('/care')}
        className="bg-white rounded-2xl p-5 border border-gray-100 active:bg-gray-50 mb-3"
      >
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center mr-3">
            <Text className="text-xl">💝</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">我关心的人</Text>
            <Text className="text-xs text-gray-500 mt-0.5">通过邀请码添加关心对象</Text>
          </View>
          <Text className="text-gray-300 text-xl">›</Text>
        </View>
        <View className="mt-3 bg-emerald-500 rounded-xl py-2.5 items-center">
          <Text className="text-white text-sm font-semibold">管理</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push('/care/me')}
        className="bg-white rounded-2xl p-5 border border-gray-100 active:bg-gray-50"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
            <Text className="text-xl">👥</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">关心我的人</Text>
            <Text className="text-xs text-gray-500 mt-0.5">谁在关心你？</Text>
          </View>
          <Text className="text-gray-300 text-xl">›</Text>
        </View>
        <View className="mt-3 border border-emerald-500 rounded-xl py-2.5 items-center">
          <Text className="text-emerald-500 text-sm font-semibold">查看</Text>
        </View>
      </Pressable>
    </View>
  )
}
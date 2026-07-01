import { View, Text } from 'react-native'

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50 p-5">
      {/* Greeting */}
      <View className="mb-4">
        <Text className="text-sm text-gray-500">早上好</Text>
        <Text className="text-2xl font-bold text-gray-900 mt-1">今日服药</Text>
      </View>

      {/* Hero card */}
      <View className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 shadow-lg mb-4">
        <Text className="text-emerald-50 text-sm">下一服药</Text>
        <Text className="text-white text-4xl font-bold mt-2">08:00</Text>
        <Text className="text-emerald-50 text-sm mt-2">距现在 02:00:00</Text>
        <View className="mt-4 bg-white/20 rounded-xl px-3 py-2 self-start">
          <Text className="text-white text-sm font-semibold">查看全部 3 项 ›</Text>
        </View>
      </View>

      {/* Quick stats */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
          <Text className="text-3xl font-bold text-emerald-500">2</Text>
          <Text className="text-xs text-gray-500 mt-1">今日已服</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
          <Text className="text-3xl font-bold text-amber-500">1</Text>
          <Text className="text-xs text-gray-500 mt-1">待服</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
          <Text className="text-3xl font-bold text-blue-500">67%</Text>
          <Text className="text-xs text-gray-500 mt-1">依从率</Text>
        </View>
      </View>

      {/* Today's schedule preview */}
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-gray-900">今日时间表</Text>
          <Text className="text-emerald-500 text-sm">全部</Text>
        </View>
        {[
          { time: '08:00', name: '阿莫西林', dose: '1 粒', taken: true },
          { time: '12:00', name: '维生素 D', dose: '1 片', taken: true },
          { time: '20:00', name: '阿莫西林', dose: '1 粒', taken: false },
        ].map((p, i) => (
          <View key={i} className={`flex-row items-center py-2.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
            <View className={`w-2 h-2 rounded-full mr-3 ${p.taken ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <Text className="text-sm font-semibold text-gray-700 w-14">{p.time}</Text>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">{p.name}</Text>
              <Text className="text-xs text-gray-500">{p.dose}</Text>
            </View>
            <Text className={p.taken ? 'text-emerald-500 text-xs font-semibold' : 'text-amber-500 text-xs font-semibold'}>
              {p.taken ? '✓ 已服' : '待服'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}
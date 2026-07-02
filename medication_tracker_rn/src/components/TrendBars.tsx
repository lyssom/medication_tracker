import { View, Text } from 'react-native'
import type { DayAdherence } from '../utils/adherence'

interface TrendBarsProps {
  data: DayAdherence[]
}

export function TrendBars({ data }: TrendBarsProps) {
  const maxBar = 64 // px
  const allZero = data.every((d) => d.total === 0)

  return (
    <View className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-ink dark:text-slate-100">7 日依从率</Text>
        <Text className="text-xs text-ink-muted dark:text-slate-400">近一周</Text>
      </View>

      {allZero ? (
        <View className="py-6 items-center">
          <Text className="text-sm text-ink-faint dark:text-slate-500">暂无打卡数据</Text>
        </View>
      ) : (
        <View className="flex-row items-end justify-between" style={{ height: maxBar + 28 }}>
          {data.map((d) => {
            const h = Math.max(2, Math.round(d.rate * maxBar))
            const pct = Math.round(d.rate * 100)
            const isToday = d === data[data.length - 1]
            return (
              <View key={d.date} className="items-center flex-1">
                <Text className="text-[10px] font-semibold text-primary mb-1">
                  {d.total > 0 ? `${pct}%` : ''}
                </Text>
                <View
                  className={`w-6 rounded-md ${isToday ? 'bg-primary' : 'bg-primary/40'}`}
                  style={{ height: h }}
                />
                <Text className="text-[10px] text-ink-muted dark:text-slate-400 mt-1.5">
                  {d.label}
                </Text>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

export default TrendBars
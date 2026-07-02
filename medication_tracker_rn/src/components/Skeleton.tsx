import { useEffect, useRef } from 'react'
import { Animated, View, ViewStyle } from 'react-native'

interface SkeletonProps {
  width?: number | string
  height?: number
  rounded?: number
  className?: string
  style?: ViewStyle
}

export function Skeleton({
  width = '100%',
  height = 16,
  rounded = 8,
  className = '',
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: rounded,
          backgroundColor: '#E8DFD0',
          opacity,
        },
        style,
      ]}
      className={className}
    />
  )
}

export function SkeletonCard() {
  return (
    <View className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700">
      <Skeleton width="60%" height={14} />
      <View className="h-2" />
      <Skeleton width="100%" height={12} />
      <View className="h-2" />
      <Skeleton width="40%" height={12} />
    </View>
  )
}

export function SkeletonRow() {
  return (
    <View className="bg-surface dark:bg-slate-800 rounded-2xl p-4 border border-border dark:border-slate-700 flex-row items-center">
      <Skeleton width={40} height={40} rounded={999} />
      <View className="flex-1 ml-3">
        <Skeleton width="50%" height={12} />
        <View className="h-2" />
        <Skeleton width="30%" height={10} />
      </View>
    </View>
  )
}

export default Skeleton
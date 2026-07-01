import { Tabs } from 'expo-router'
import { Pill, Heart, Home as HomeIcon } from '@tamagui/lucide-icons'
import { useTheme } from 'tamagui'

export default function TabsLayout() {
  const theme = useTheme()
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary?.val ?? '#10B981',
        tabBarInactiveTintColor: theme.color?.val ?? '#6B7280',
        headerStyle: { backgroundColor: theme.cardBackground?.val ?? '#fff' },
        headerTitleStyle: { color: theme.color?.val ?? '#1F2937' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '今日',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meds"
        options={{
          title: '药物',
          tabBarIcon: ({ color, size }) => <Pill size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: '关心',
          tabBarIcon: ({ color, size }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

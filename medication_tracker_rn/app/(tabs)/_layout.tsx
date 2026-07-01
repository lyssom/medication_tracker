import { Tabs } from 'expo-router'
import { PaperProvider, Icon } from 'react-native-paper'

export default function TabsLayout() {
  return (
    <PaperProvider>
      <Tabs screenOptions={{ tabBarActiveTintColor: '#10B981', tabBarInactiveTintColor: '#6B7280' }}>
        <Tabs.Screen name="index" options={{ title: '今日', tabBarIcon: ({ color, size }) => <Icon source="home" size={size} color={color} /> }} />
        <Tabs.Screen name="meds" options={{ title: '药物', tabBarIcon: ({ color, size }) => <Icon source="pill" size={size} color={color} /> }} />
        <Tabs.Screen name="care" options={{ title: '关心', tabBarIcon: ({ color, size }) => <Icon source="heart" size={size} color={color} /> }} />
        <Tabs.Screen name="settings" options={{ title: '设置', tabBarIcon: ({ color, size }) => <Icon source="cog" size={size} color={color} /> }} />
      </Tabs>
    </PaperProvider>
  )
}

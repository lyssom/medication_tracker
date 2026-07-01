// screens/home/CareMeScreen.tsx
import React, { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { Text, Avatar, List, Divider } from 'react-native-paper'
import { caresAPI } from '../../services/api'

// 用户类型
interface User {
  id: number
  name: string
  avatarUrl?: string
}

// 页面 Props
interface CareMeScreenProps {
}

const CareMeScreen: React.FC<CareMeScreenProps> = () => {
  const [caresMe, setCaresMe] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // ------------------- 获取关心我的人 -------------------
  useEffect(() => {
    const fetchCaresMe = async () => {
      try {
        setLoading(true)
        const res = await caresAPI.getCaresme()
        // 处理返回字段
        setCaresMe(
          res.data.cares_me.map((s: any) => ({
            id: s.supervisor_id,
            name: s.supervisor_name,
            avatarUrl: s.supervisor_avatar_url,
          }))
        )
      } catch (err) {
        console.error('获取关心我的人失败', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCaresMe()
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // ------------------- 渲染列表 -------------------
  const renderUserList = (users: User[]) => {
    if (users.length === 0) {
      return <Text style={styles.emptyText}>暂无数据</Text>
    }

    return users.map((user) => (
      <List.Item
        key={user.id}
        title={user.name}
        left={() =>
          user.avatarUrl ? (
            <Avatar.Image size={40} source={{ uri: user.avatarUrl }} />
          ) : (
            <Avatar.Text size={40} label={user.name[0]} />
          )
        }
      />
    ))
  }

  // ------------------- 页面渲染 -------------------
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView>
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            关心我的人
          </Text>
          {renderUserList(caresMe)}
        </View>
        <Divider />
      </ScrollView>
    </View>
  )
}

// ------------------- 样式 -------------------
const styles = StyleSheet.create({
  section: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    paddingVertical: 8,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})

export default CareMeScreen

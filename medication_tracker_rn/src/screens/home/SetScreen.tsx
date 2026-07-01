import React from 'react'
import { View, StyleSheet } from 'react-native'
import { List, Text, Divider, IconButton } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '../../store/useAuthStore'

export default function EntryScreen({ setPage }) {
  const { user, logout } = useAuthStore()

  const inviteCode = user?.invite_code

  const handleLogout = async () => {
    // 清除本地 token
    await AsyncStorage.removeItem('access_token')

    // 清空 zustand 用户信息
    logout?.()  // 如果你有写 logout 方法

    // 跳回登录页
    setPage({ name: 'login' })
  }

  return (
    <View style={styles.container}>
      {/* 顶部右上角退出按钮 */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <IconButton
          icon="logout"
          size={22}
          onPress={handleLogout}
        />
      </View>

      {/* 用户信息卡片 */}
      <View style={styles.userCard}>
        <Text variant="titleMedium" style={styles.username}>
          👋 你好，{user?.username || '用户'}
        </Text>

        <Text variant="bodyMedium" style={styles.inviteText}>
          我的邀请码：<Text style={styles.inviteCode}>{inviteCode}</Text>
        </Text>
      </View>

      <Divider />

      <List.Section>
        <List.Item
          title="药物管理"
          description="管理我的药物与服药计划"
          left={props => <List.Icon {...props} icon="pill" />}
          onPress={() => setPage({ name: 'medicine' })}
        />

        <List.Item
          title="我关心的人"
          description="我为他们查看和提醒服药"
          left={props => <List.Icon {...props} icon="account-heart-outline" />}
          onPress={() => setPage({ name: 'care' })}
        />

        <List.Item
          title="关心我的人"
          description="可以查看和提醒我服药的人"
          left={props => <List.Icon {...props} icon="account-eye-outline" />}
          onPress={() => setPage({ name: 'careMe' })}
        />
      </List.Section>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
    paddingTop: 4,
  },
  userCard: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
  },
  username: {
    fontWeight: '600',
    marginBottom: 6,
  },
  inviteText: {
    color: '#6B7280',
  },
  inviteCode: {
    color: '#10B981',
    fontWeight: '600',
  },
})

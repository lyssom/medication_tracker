// screens/home/CareScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native'
import { Text, Avatar, List, Divider, Button } from 'react-native-paper'
import { caresAPI } from '../../services/api'

// ------------------- 用户类型 -------------------
interface User {
  id: number
  username: string
  avatarUrl?: string
}

// ------------------- 页面组件 -------------------
const CareScreen: React.FC = () => {
  // ------------------- State -------------------
  const [myCares, setMyCares] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  // ------------------- 获取我关心的人 -------------------
  useEffect(() => {
    const fetchCares = async () => {
      try {
        setLoading(true)
        const res = await caresAPI.getmyCares()

        setMyCares(
          res.data.my_cares.map((s: any) => ({
            id: s.supervised_id,
            username: s.supervised_name,
            avatarUrl: s.supervised_avatar_url,
          }))
        )
      } catch (err) {
        console.error('获取关心关系失败', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCares()
  }, [])

  // ------------------- 添加我关心的人（基于邀请码） -------------------
  const handleAddCare = async () => {
    if (!inviteCode.trim()) return

    try {
      const res = await caresAPI.addCare({
        invite_code: inviteCode.trim(),
        relation_type: 'friend',
      })

      const user = res.data.user

      setMyCares((prev) => [
        ...prev,
        {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatar_url,
        },
      ])

      setInviteCode('')
      setModalVisible(false)
    } catch (err: any) {
      console.error('添加失败', err.response?.data || err)
    }
  }

  // ------------------- Loading -------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // ------------------- 渲染用户列表 -------------------
  const renderUserList = (users: User[]) => {
    if (users.length === 0) {
      return <Text style={styles.emptyText}>暂无关心的人</Text>
    }

    return users.map((user) => (
      <List.Item
        key={user.id}
        title={user.username}
        left={() =>
          user.avatarUrl ? (
            <Avatar.Image size={40} source={{ uri: user.avatarUrl }} />
          ) : (
            <Avatar.Text size={40} label={user.username[0].toUpperCase()} />
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
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              我关心的人
            </Text>
            <Button mode="contained" onPress={() => setModalVisible(true)}>
              添加
            </Button>
          </View>
          {renderUserList(myCares)}
        </View>
        <Divider />
      </ScrollView>

      {/* ------------------- 添加关心人 Modal ------------------- */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              添加我关心的人
            </Text>

            <Text style={{ color: '#666', marginBottom: 12 }}>
              输入对方的邀请码即可添加
            </Text>

            <TextInput
              placeholder="邀请码"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Button onPress={() => setModalVisible(false)}>取消</Button>
              <Button mode="contained" onPress={handleAddCare}>
                添加
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// ------------------- 样式 -------------------
const styles = StyleSheet.create({
  section: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
})

export default CareScreen

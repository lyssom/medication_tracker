// src/screens/care/careHomeScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Text, Avatar, List, Divider, Button } from 'react-native-paper'
import { caresAPI } from '../../services/api'

interface User {
  id: number
  name: string
  avatarUrl?: string
}

interface CareHomeScreenProps {
  setPage: (page: any) => void
}

const CareHomeScreen: React.FC<CareHomeScreenProps> = ({ setPage }) => {
  const [myCares, setMyCares] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCares = async () => {
      try {
        setLoading(true)
        const res = await caresAPI.getmyCares()
        setMyCares(
          res.data.my_cares.map((s: any) => ({
            id: s.supervised_id,
            name: s.supervised_name,
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            我关心的人
          </Text>

          {myCares.length === 0 && (
            <Text style={styles.emptyText}>暂无数据</Text>
          )}

          {myCares.map((user) => (
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
              right={() => (
                <Button
                  mode="outlined"
                  compact
                  onPress={() =>
                    setPage({
                      name: 'careDetail',
                      userId: user.id,
                      username: user.name,
                    })
                  }
                >
                  详情
                </Button>
              )}
            />
          ))}
        </View>

        <Divider />
      </ScrollView>
    </View>
  )
}

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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default CareHomeScreen

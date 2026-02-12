import React, { useState } from 'react'
import { View } from 'react-native'
import { Text, Button, Chip, Portal, Modal } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'

const WEEK_DAYS = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 7 },
]

function formatRule(time: string, days: number[]) {
  if (days.length === 7) return `每天 ${time}`
  if (days.length === 1)
    return `每周${WEEK_DAYS[days[0] - 1].label} ${time}`
  return `每周${days.map(d => WEEK_DAYS[d - 1].label).join('、')} ${time}`
}

interface Rule {
  time: string
  days: number[]
}

interface Props {
  value: Rule[]
  onChange: (v: Rule[]) => void
}

const MedTimePicker: React.FC<Props> = ({ value, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const [time, setTime] = useState(new Date())
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7])

  const toggleDay = (d: number) => {
    setDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    )
  }

  const addRule = () => {
    const hh = time.getHours().toString().padStart(2, '0')
    const mm = time.getMinutes().toString().padStart(2, '0')

    onChange([
      ...value,
      {
        time: `${hh}:${mm}`,
        days,
      },
    ])

    setModalVisible(false)
  }

  const timeText = `${time
    .getHours()
    .toString()
    .padStart(2, '0')}:${time
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

  return (
    <View>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>
        服药时间
      </Text>

      {value.map((r, i) => (
        <Chip key={i} style={{ marginBottom: 6 }}>
          {formatRule(r.time, r.days)}
        </Chip>
      ))}

      <Button onPress={() => setModalVisible(true)}>
        + 添加服药时间
      </Button>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 16,
            margin: 20,
            borderRadius: 8,
          }}
        >
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            选择服药时间
          </Text>

          {/* 时间选择 */}
          <Button
            mode="outlined"
            onPress={() => setShowTimePicker(true)}
            style={{ marginBottom: 8 }}
          >
            选择时间（{timeText}）
          </Button>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour
              onChange={(event, selectedDate) => {
                if (event.type === 'set' && selectedDate) {
                  setTime(selectedDate)
                }
                // ✅ Android 必须立即卸载
                setShowTimePicker(false)
              }}
            />
          )}

          {/* 星期选择 */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginVertical: 12,
            }}
          >
            {WEEK_DAYS.map(d => (
              <Chip
                key={d.value}
                selected={days.includes(d.value)}
                onPress={() => toggleDay(d.value)}
                style={{ marginRight: 6, marginBottom: 6 }}
              >
                周{d.label}
              </Chip>
            ))}
          </View>

          <Text style={{ marginBottom: 12 }}>
            {formatRule(timeText, days)}
          </Text>

          <Button mode="contained" onPress={addRule}>
            确定
          </Button>
        </Modal>
      </Portal>
    </View>
  )
}

export default MedTimePicker

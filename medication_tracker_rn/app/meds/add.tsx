import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useMedStore } from '../../src/store/useMedStore'
import { haptics } from '../../src/utils/haptics'

type RepeatKind = 'daily' | 'weekdays' | 'custom'

interface ScheduleEntry {
  id: number
  time: string
  repeat: RepeatKind
  days: number[]
}

const DEFAULT_DAYS = [1, 2, 3, 4, 5]
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

function daysForRepeat(repeat: RepeatKind, current: number[]): number[] {
  if (repeat === 'daily') return []
  if (repeat === 'weekdays') return [1, 2, 3, 4, 5]
  return current.length ? current : DEFAULT_DAYS.slice()
}

function repeatLabel(repeat: RepeatKind, days: number[]): string {
  if (repeat === 'daily') return '每天'
  if (repeat === 'weekdays') return '工作日'
  if (days.length === 7) return '每天'
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return '工作日'
  return days.sort((a, b) => a - b).map((d) => '周' + DAY_LABELS[d]).join(' ')
}

let nextId = 1

export default function AddMedScreen() {
  const router = useRouter()
  const createMedication = useMedStore((s) => s.createMedication)
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([
    { id: nextId++, time: '08:00', repeat: 'daily', days: [] },
  ])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<number | null>(null)
  const [err, setErr] = useState('')
  const [sub, setSub] = useState(false)

  const openTimePicker = (id: number) => {
    haptics.light()
    setPickerTarget(id)
    setPickerOpen(true)
  }

  const onTimeChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setPickerOpen(false)
    if (!date || pickerTarget == null) return
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    setSchedule((s) =>
      s.map((e) => (e.id === pickerTarget ? { ...e, time: `${hh}:${mm}` } : e))
    )
  }

  const addRow = () => {
    haptics.medium()
    setSchedule((s) => [
      ...s,
      { id: nextId++, time: '12:00', repeat: 'daily', days: [] },
    ])
  }
  const removeRow = (id: number) => {
    haptics.warn()
    setSchedule((s) => s.filter((e) => e.id !== id))
  }
  const setRowRepeat = (id: number, repeat: RepeatKind) => {
    haptics.light()
    setSchedule((s) =>
      s.map((e) =>
        e.id === id ? { ...e, repeat, days: daysForRepeat(repeat, e.days) } : e
      )
    )
  }
  const toggleDay = (id: number, day: number) => {
    haptics.light()
    setSchedule((s) =>
      s.map((e) => {
        if (e.id !== id) return e
        const has = e.days.includes(day)
        return {
          ...e,
          days: has ? e.days.filter((d) => d !== day) : [...e.days, day].sort((a, b) => a - b),
        }
      })
    )
  }

  const submit = async () => {
    haptics.medium()
    if (!name.trim()) {
      setErr('药物名称不能为空')
      haptics.warn()
      return
    }
    if (schedule.length === 0) {
      setErr('至少添加一个服药时间')
      haptics.warn()
      return
    }
    setSub(true)
    try {
      const times = schedule.map((e) => ({
        time: e.time,
        days: e.repeat === 'custom' && e.days.length ? e.days : null,
      }))
      await createMedication({
        name: name.trim(),
        alias: alias.trim() || null,
        times,
      })
      haptics.success()
      router.back()
    } catch (e: any) {
      haptics.warn()
      Alert.alert('保存失败', e?.message ?? '未知错误')
      setErr(e?.message ?? '保存失败')
    } finally {
      setSub(false)
    }
  }

  const pickerEntry = schedule.find((e) => e.id === pickerTarget)

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-slate-900"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 96 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-5">
          <View className="mb-5">
            <Text className="text-2xl font-bold text-ink dark:text-slate-100">添加药物</Text>
            <Text className="text-sm text-ink-muted dark:text-slate-400 mt-1">
              填写下方信息后保存
            </Text>
          </View>

          <View className="bg-surface dark:bg-slate-800 rounded-2xl p-5 border border-border dark:border-slate-700 gap-5">
            <View>
              <Text className="text-sm font-medium text-ink dark:text-slate-200 mb-2">
                药物名称 <Text className="text-danger">*</Text>
              </Text>
              <TextInput
                className="border border-border dark:border-slate-600 rounded-xl px-4 py-3 text-base bg-background dark:bg-slate-900 text-ink dark:text-slate-100"
                placeholder="如：阿莫西林"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-ink dark:text-slate-200 mb-2">
                别名 / 品牌
              </Text>
              <TextInput
                className="border border-border dark:border-slate-600 rounded-xl px-4 py-3 text-base bg-background dark:bg-slate-900 text-ink dark:text-slate-100"
                placeholder="选填"
                value={alias}
                onChangeText={setAlias}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-medium text-ink dark:text-slate-200">
                  服药时间 <Text className="text-danger">*</Text>
                </Text>
                <Pressable
                  onPress={addRow}
                  className="px-3 py-1 rounded-full bg-primary-soft dark:bg-emerald-900/40 active:bg-primary-soft/80"
                >
                  <Text className="text-primary dark:text-emerald-400 text-sm font-semibold">+ 添加</Text>
                </Pressable>
              </View>

              {schedule.map((e, i) => (
                <View
                  key={e.id}
                  className={`rounded-xl border border-border dark:border-slate-600 bg-background dark:bg-slate-900 p-4 ${i > 0 ? 'mt-3' : ''}`}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Pressable
                      onPress={() => openTimePicker(e.id)}
                      className="bg-surface dark:bg-slate-800 border border-primary/40 rounded-xl px-4 py-2 active:bg-primary-soft"
                    >
                      <Text className="text-primary dark:text-emerald-400 text-2xl font-bold tracking-tight">
                        {e.time}
                      </Text>
                    </Pressable>
                    {schedule.length > 1 && (
                      <Pressable
                        onPress={() => removeRow(e.id)}
                        className="w-9 h-9 items-center justify-center rounded-full bg-danger-soft active:bg-rose-100"
                      >
                        <Ionicons name="close" size={20} color="#F43F5E" />
                      </Pressable>
                    )}
                  </View>

                  <View className="flex-row gap-2 mb-3">
                    {(['daily', 'weekdays', 'custom'] as RepeatKind[]).map((r) => {
                      const active = e.repeat === r
                      return (
                        <Pressable
                          key={r}
                          onPress={() => setRowRepeat(e.id, r)}
                          className={`flex-1 rounded-lg py-2 items-center active:scale-95 ${
                            active
                              ? 'bg-primary'
                              : 'bg-surface dark:bg-slate-800 border border-border dark:border-slate-600'
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              active
                                ? 'text-white'
                                : 'text-ink-muted dark:text-slate-400'
                            }`}
                          >
                            {r === 'daily' ? '每天' : r === 'weekdays' ? '工作日' : '自定义'}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>

                  {e.repeat === 'custom' && (
                    <View className="flex-row gap-1.5">
                      {ALL_DAYS.map((d) => {
                        const active = e.days.includes(d)
                        return (
                          <Pressable
                            key={d}
                            onPress={() => toggleDay(e.id, d)}
                            className={`flex-1 rounded-md py-1.5 items-center active:scale-95 ${
                              active
                                ? 'bg-primary'
                                : 'bg-surface dark:bg-slate-800 border border-border dark:border-slate-600'
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                active ? 'text-white' : 'text-ink-muted dark:text-slate-400'
                              }`}
                            >
                              {DAY_LABELS[d]}
                            </Text>
                          </Pressable>
                        )
                      })}
                    </View>
                  )}

                  {e.repeat !== 'daily' && (
                    <Text className="text-xs text-ink-faint dark:text-slate-500 mt-2">
                      → {repeatLabel(e.repeat, e.days)}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {err ? (
              <Text className="text-danger text-sm text-center">{err}</Text>
            ) : null}

            <Pressable
              onPress={submit}
              disabled={sub}
              className={`bg-primary rounded-xl py-4 items-center active:bg-primary-hover active:scale-95 shadow-warm-sm ${
                sub ? 'opacity-60' : ''
              }`}
            >
              {sub ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">保存</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              className="rounded-xl py-3 items-center active:opacity-70"
            >
              <Text className="text-ink-muted dark:text-slate-400 text-sm">取消</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {pickerOpen && pickerEntry && (
        <DateTimePicker
          value={(() => {
            const [h, m] = pickerEntry.time.split(':').map(Number)
            const d = new Date()
            d.setHours(h ?? 8, m ?? 0, 0, 0)
            return d
          })()}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </KeyboardAvoidingView>
  )
}
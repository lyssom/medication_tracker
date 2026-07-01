import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useMedStore } from '../../src/store/useMedStore'

export default function AddMedScreen() {
  const router = useRouter()
  const createMedication = useMedStore((s) => s.createMedication)
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [stock, setStock] = useState('0')
  const [times, setTimes] = useState('08:00, 20:00')
  const [err, setErr] = useState('')
  const [sub, setSub] = useState(false)

  const submit = async () => {
    if (!name.trim()) {
      setErr('药物名称不能为空')
      return
    }
    setSub(true)
    try {
      const parsed = times
        .split(',')
        .map((s) => s.trim())
        .filter((s) => /^\d{1,2}:\d{2}$/.test(s))
        .map((t) => ({ time: t }))
      await createMedication({
        name: name.trim(),
        alias: alias.trim() || null,
        stock: Number(stock) || 0,
        times: parsed,
      })
      router.back()
    } catch (e: any) {
      Alert.alert('保存失败', e?.message ?? '未知错误')
      setErr(e?.message ?? '保存失败')
    } finally {
      setSub(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
      <View className="p-5">
        <View className="mb-5">
          <Text className="text-2xl font-bold text-gray-900">添加药物</Text>
          <Text className="text-sm text-gray-500 mt-1">填写下方信息后保存</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 border border-gray-100 gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">药物名称 *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
              placeholder="如：阿莫西林"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">别名 / 品牌</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
              placeholder="选填"
              value={alias}
              onChangeText={setAlias}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">当前库存</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
              placeholder="0"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">服用时间</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
              placeholder="08:00, 20:00"
              value={times}
              onChangeText={setTimes}
              placeholderTextColor="#9CA3AF"
            />
            <Text className="text-xs text-gray-400 mt-1.5">多个时间用英文逗号分隔</Text>
          </View>

          {err ? (
            <Text className="text-red-500 text-sm text-center">{err}</Text>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={sub}
            className={`bg-emerald-500 rounded-xl py-4 items-center mt-2 active:bg-emerald-600 ${sub ? 'opacity-60' : ''}`}
          >
            {sub ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-base">保存</Text>}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="rounded-xl py-3 items-center"
          >
            <Text className="text-gray-500 text-sm">取消</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
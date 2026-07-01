// screens/home/AddMedScreen.tsx
import React, { useState } from 'react'
import { View, ScrollView } from 'react-native'
import {
  Button,
  Text,
  TextInput,
  Switch,
  Divider,
} from 'react-native-paper'

import MedTimePicker from '../../components/MedTimePicker'
import { medsAPI } from '../../services/api'

interface TimeRule {
  time: string
  days: number[]
}

interface AddMedScreenProps {
  medication?: any
  onDone: () => void
}

const AddMedScreen: React.FC<AddMedScreenProps> = ({ medication, onDone }) => {
  /** =======================
   * 基础状态
   ======================= */
  const [simpleMode, setSimpleMode] = useState(true)

  const [name, setName] = useState(medication?.name ?? '')
  const [alias, setAlias] = useState(medication?.alias ?? '')
  const [category, setCategory] = useState(medication?.category ?? '')
  const [form, setForm] = useState(medication?.form ?? '')
  const [specification, setSpecification] = useState(
    medication?.specification ?? ''
  )
  const [stock, setStock] = useState(String(medication?.stock ?? 0))
  const [unit, setUnit] = useState(medication?.unit ?? '粒')
  const [defaultDose, setDefaultDose] = useState(
    String(medication?.default_dose ?? 1)
  )
  const [doseUnit, setDoseUnit] = useState(
    medication?.dose_unit ?? '片'
  )

  const [times, setTimes] = useState<TimeRule[]>(
    medication?.times
      ? medication.times.map((t: string) => ({
          time: t,
          days: [1, 2, 3, 4, 5, 6, 7],
        }))
      : []
  )

  const [notes, setNotes] = useState(medication?.notes ?? '')
  const [requirePhoto, setRequirePhoto] = useState(
    medication?.require_photo ?? false
  )

  /** =======================
   * 提交
   ======================= */
  const submit = async () => {
    if (!name.trim()) return

    const payload = {
      name,
      alias,
      category,
      form,
      specification,
      stock: Number(stock),
      unit,
      default_dose: Number(defaultDose),
      dose_unit: doseUnit,
      frequency: 'custom',
      times,
      notes,
      require_photo: requirePhoto,
    }

    console.log('提交数据', payload)

    await medsAPI.create(payload)
    onDone()
  }

  /** =======================
   * UI
   ======================= */
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        {medication ? '编辑药物' : '添加药物'}
      </Text>

      {/* ===== 模式切换 ===== */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ flex: 1 }}>
          {simpleMode ? '简易模式（推荐）' : '详细模式'}
        </Text>
        <Switch
          value={!simpleMode}
          onValueChange={(v) => setSimpleMode(!v)}
        />
      </View>

      <Divider style={{ marginBottom: 16 }} />

      {/* ===== 必填项：始终显示 ===== */}
      <TextInput
        label="药物名称 *"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 12 }}
      />

      <MedTimePicker value={times} onChange={setTimes} />

      {/* ===== 详细模式 ===== */}
      {!simpleMode && (
        <>
          <Divider style={{ marginVertical: 16 }} />

          <TextInput
            label="别名"
            value={alias}
            onChangeText={setAlias}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="分类"
            value={category}
            onChangeText={setCategory}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="剂型（如 片剂 / 胶囊）"
            value={form}
            onChangeText={setForm}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="规格（如 10mg × 30片）"
            value={specification}
            onChangeText={setSpecification}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="库存数量"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="库存单位（粒 / 盒）"
            value={unit}
            onChangeText={setUnit}
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="单次剂量"
            value={defaultDose}
            onChangeText={setDefaultDose}
            keyboardType="numeric"
            style={{ marginBottom: 8 }}
          />

          <TextInput
            label="剂量单位（片 / 粒）"
            value={doseUnit}
            onChangeText={setDoseUnit}
            style={{ marginBottom: 12 }}
          />

          <TextInput
            label="备注"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ marginBottom: 12 }}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ flex: 1 }}>是否需要拍照</Text>
            <Switch
              value={requirePhoto}
              onValueChange={setRequirePhoto}
            />
          </View>
        </>
      )}

      <Button
        mode="contained"
        onPress={submit}
        disabled={!name.trim() || times.length === 0}
      >
        保存
      </Button>
    </ScrollView>
  )
}

export default AddMedScreen

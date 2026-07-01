import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, Text, Input, Card, Button, H3, Spinner } from 'tamagui'
import { useMedStore } from '../../src/store/useMedStore'

export default function AddMedScreen() {
  const params = useLocalSearchParams<{ id?: string }>()
  const id = params.id ? Number(params.id) : null
  const router = useRouter()

  const fetchMedDetail = useMedStore((s) => s.fetchMedicationDetail)
  const createMedication = useMedStore((s) => s.createMedication)

  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [stock, setStock] = useState('0')
  const [dose, setDose] = useState('1')
  const [times, setTimes] = useState('08:00, 20:00')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (id) {
      fetchMedDetail(id)
        .then((m) => {
          setName(m.name ?? '')
          setAlias(m.alias ?? '')
          setStock(String(m.stock ?? 0))
          setDose(String(m.default_dose ?? 1))
          setTimes((m.times ?? []).join(', '))
          setNotes(m.notes ?? '')
        })
        .catch(() => setErr('加载失败'))
        .finally(() => setLoading(false))
    }
  }, [id])

  const submit = async () => {
    setErr('')
    if (!name.trim()) {
      setErr('药物名称不能为空')
      return
    }
    setSubmitting(true)
    try {
      const timesArr = times
        .split(',')
        .map((s) => s.trim())
        .filter((s) => /^\d{1,2}:\d{2}$/.test(s))
        .map((t) => ({ time: t }))

      await createMedication({
        name: name.trim(),
        alias: alias.trim() || null,
        stock: Number(stock) || 0,
        default_dose: Number(dose) || 1,
        times: timesArr,
        notes: notes.trim() || null,
      })
      router.back()
    } catch (e: any) {
      setErr(e?.message ?? '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner color="$primary" />

  return (
    <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
      <H3 color="$primary">{id ? '编辑药物' : '添加药物'}</H3>

      <Card backgroundColor="$cardBackground" size="$4" gap="$3">
        <Input placeholder="药物名称 *" value={name} onChangeText={setName} size="$4" />
        <Input placeholder="别名/品牌" value={alias} onChangeText={setAlias} size="$4" />
        <Input
          placeholder="当前库存"
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          size="$4"
        />
        <Input
          placeholder="每次剂量"
          value={dose}
          onChangeText={setDose}
          keyboardType="numeric"
          size="$4"
        />
        <Input
          placeholder="服用时间 (HH:MM, HH:MM)"
          value={times}
          onChangeText={setTimes}
          size="$4"
        />
        <Input
          placeholder="备注"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          size="$4"
        />
        {err ? (
          <Text color="$error" textAlign="center">
            {err}
          </Text>
        ) : null}
        <Button
          backgroundColor="$primary"
          color="#fff"
          size="$4"
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? '保存中…' : '保存'}
        </Button>
      </Card>
    </YStack>
  )
}

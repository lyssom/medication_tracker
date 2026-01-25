import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useMedicineStore } from '../../store/medicineStore'

export default function HomeScreen() {
  const { medicines, fetchMedicines } = useMedicineStore()

  useEffect(() => {
    fetchMedicines()
  }, [])

  return (
    <View>
      <Text>今日吃药</Text>
      {medicines.map((m) => (
        <Text key={m.id}>
          {m.name} - {m.times.join(',')}
        </Text>
      ))}
    </View>
  )
}

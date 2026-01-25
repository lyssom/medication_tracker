import React from 'react'
import { View, Button } from 'react-native'
import { useMedicineStore } from '../../store/medicineStore'

export default function MedicineListScreen() {
  const { addMedicine } = useMedicineStore()

  return (
    <View>
      <Button
        title="添加药物"
        onPress={() =>
          addMedicine({
            name: '二甲双胍',
            dose: '1片',
            times: ['08:00', '20:00'],
          })
        }
      />
    </View>
  )
}

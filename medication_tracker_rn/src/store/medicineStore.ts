import { create } from 'zustand'
import { api } from '../services/api'
import { useUserStore } from './userStore'

export const useMedicineStore = create((set) => ({
  medicines: [],
  fetchMedicines: async () => {
    const userId = useUserStore.getState().userId
    const res = await api.get('/medicines', { params: { userId } })
    set({ medicines: res.data })
  },
  addMedicine: async (data) => {
    const userId = useUserStore.getState().userId
    await api.post('/medicines', { ...data, userId })
  },
}))

import { create } from 'zustand'
import { api } from '../services/api'

type UserState = {
  userId?: string
  login: (name: string) => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  login: async (name) => {
    const res = await api.post('/login', { name })
    set({ userId: res.data.userId })
  },
}))

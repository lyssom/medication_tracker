import { create } from 'zustand'

type UserStore = {
  userId: string | null
  token: string | null
  login: (userId: string, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  userId: null,
  token: null,
  login: (userId, token) => set({ userId, token }),
  logout: () => set({ userId: null, token: null }),
}))

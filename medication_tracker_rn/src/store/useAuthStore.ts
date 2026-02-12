import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  invitation: string;
  avatar_url?: string;
  phone?: string;
  invite_code?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (data: { username: string; password: string;}) => Promise<void>;
  register: (data: { username: string; password?: string; invitation?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      login: async (data: { username: string; password: string;}) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(data);
          const { user, access_token } = response.data;
          set({
            user,
            accessToken: access_token,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.error || '登录失败');
        }
      },

      register: async (data: { username: string; password?: string; nickname?: string; phone?: string }) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          const { user, access_token } = response.data;
          console.log(user, access_token);
          set({
            user,
            accessToken: access_token,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.error || '注册失败');
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

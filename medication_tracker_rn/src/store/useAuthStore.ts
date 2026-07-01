import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  invitation?: string;
  avatar_url?: string;
  phone?: string;
  invite_code?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (data: { username: string; password: string }) => Promise<void>;
  register: (data: { username: string; password?: string; invitation?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (v: boolean) => void;
}

// SecureStore adapter for zustand persist
const secureStorage: StateStorage = {
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      // fallback to no-persist if hardware keystore unavailable
      // eslint-disable-next-line no-console
      console.warn('[auth-storage] SecureStore.setItemAsync failed, dropped:', e);
    }
  },
  getItem: async (key) => {
    try {
      const v = await SecureStore.getItemAsync(key);
      return v ?? null;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[auth-storage] SecureStore.getItemAsync failed, dropped:', e);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[auth-storage] SecureStore.deleteItemAsync failed, dropped:', e);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      hasHydrated: false,

      login: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(data);
          const { user, access_token } = response.data;
          set({ user, accessToken: access_token, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.error || '登录失败');
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          const { user, access_token } = response.data;
          set({ user, accessToken: access_token, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.error || '注册失败');
        }
      },

      logout: async () => {
        // 清 SecureStore 中 persist 的 user/token
        await secureStorage.removeItem('auth-storage');
        set({ user: null, accessToken: null });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

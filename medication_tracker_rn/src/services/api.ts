import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

export const api = axios.create({
  // baseURL: 'http://114.215.177.111:5000/api', // Android 模拟器
  baseURL: 'http://10.67.0.14:5000/api',
})

// 请求拦截器：自动加 Authorization
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken

    // 确保 headers 存在
    config.headers = config.headers ?? {}

    // 如果还没设置 Content-Type，补一个
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      const state = useAuthStore.getState()

      // 防止重复触发 logout
      if (state.user) {
        console.log('Token 失效或过期，自动登出')
        state.logout()
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data: { username: string; password: string; }) => 
    api.post('/auth/login', data),
  
  register: (data: { username: string; password?: string; nickname?: string; phone?: string }) => 
    api.post('/auth/register', data),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  logout: () => 
    api.post('/auth/logout'),
};

export const medsAPI = {
  getList: (params?: { group_id?: number; keyword?: string }) => 
    api.get('/meds', { params }),
  
  getDetail: (medId: number) => 
    api.get(`/meds/${medId}`),
  
  create: (data: any) => 
    api.post('/meds', data),
  
  update: (medId: number, data: any) => 
    api.put(`/meds/${medId}`, data),
  
  delete: (medId: number) => 
    api.delete(`/meds/${medId}`),
  
  updateStock: (medId: number, data: { operation: string; amount: number }) => 
    api.post(`/meds/${medId}/stock`, data),
  
  getGroups: () => 
    api.get('/meds/groups'),
  
  createGroup: (data: { name: string; description?: string }) => 
    api.post('/meds/groups', data),
  
  updateGroup: (groupId: number, data: any) => 
    api.put(`/meds/groups/${groupId}`, data),
  
  deleteGroup: (groupId: number) => 
    api.delete(`/meds/groups/${groupId}`),
};



export const caresAPI = {
  getmyCares: () => 
    api.get('/care/my_cares'),
  getCaresme: () => 
    api.get('/care/cares_me'),
  addCare: (data: any) => 
    api.post('/care/add', data),
}


export const planAPI = {
  getTodayPlan: () => 
    api.get('/plan/today'),

  getAllPlan: () => 
    api.get('/plan/all'),
  
  markTaken: (data: any) => 
    api.post(`/plan/take`, data),

  getCareTodayPlan: (userId: number) => 
    api.get(`/plan/care/${userId}`),
}
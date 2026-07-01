import axios from 'axios'

// baseURL: 开发用本机 5000；生产用 https://lyssom.tech/medication
export const api = axios.create({
  baseURL: __DEV__
    ? 'http://10.67.0.124:5000/api'
    : 'https://lyssom.tech/medication/api',
})

// 请求拦截器：自动加 Authorization（延迟引用 useAuthStore 避免 require cycle）
api.interceptors.request.use(
  (config) => {
    let token: string | null = null
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useAuthStore } = require('../store/useAuthStore')
      token = useAuthStore.getState().accessToken
    } catch {
      /* authStore not initialized yet */
    }

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
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { useAuthStore } = require('../store/useAuthStore')
        const state = useAuthStore.getState()
        // 防止重复触发 logout
        if (state.user) {
          console.log('Token 失效或过期，自动登出')
          state.logout()
        }
      } catch {
        /* store not loaded */
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


// P0-04 fix: checkinAPI stub
// TODO: backend checkin 端点待实现；先返 stub 防 crash
export const checkinAPI = {
  getToday: () => api.get('/checkin/today'),
  create: (formData: FormData) =>
    api.post('/checkin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  batch: (data: any) => api.post('/checkin/batch', data),
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

export interface AppVersion {
  version: string;
  build: number;
  released_at?: string;
  mandatory: boolean;
  download_url: string;
  notes: string;
}

export const versionAPI = {
  getLatest: () =>
    api.get<{ success: boolean; data: AppVersion; note?: string }>(
      '/latest'
    ),
}
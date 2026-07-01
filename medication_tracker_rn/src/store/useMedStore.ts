import { create } from 'zustand';
import { medsAPI, checkinAPI } from '../services/api';

export interface Medication {
  id: number;
  user_id: number;
  group_id?: number;
  name: string;
  alias?: string;
  category?: string;
  form?: string;
  specification?: string;
  stock: number;
  unit: string;
  default_dose: number;
  dose_unit: string;
  frequency: string;
  times: string[];
  image_url?: string;
  notes?: string;
  is_active: boolean;
  group_name?: string;
  schedules?: Schedule[];
}

export interface Schedule {
  id: number;
  medication_id: number;
  time: string;
  dose: number;
  dose_unit: string;
  require_photo: boolean;
  medication_name?: string;
  stock?: number;
}

export interface MedicationGroup {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  sort_order: number;
  medication_count: number;
}

interface TodayStats {
  date: string;
  total_planned: number;
  total_completed: number;
  compliance_rate: number;
  medications: {
    medication_id: number;
    name: string;
    planned_times: string[];
    checked_times: number;
    stock: number;
    checkins: any[];
  }[];
}

interface MedState {
  medications: Medication[];
  groups: MedicationGroup[];
  todayStats: TodayStats | null;
  isLoading: boolean;
  error: string | null;
  
  // 药物操作
  fetchMedications: (params?: { group_id?: number; keyword?: string }) => Promise<void>;
  fetchMedicationDetail: (medId: number) => Promise<Medication>;
  createMedication: (data: any) => Promise<Medication>;
  updateMedication: (medId: number, data: any) => Promise<Medication>;
  deleteMedication: (medId: number) => Promise<void>;
  updateStock: (medId: number, operation: string, amount: number) => Promise<void>;
  
  // 服药组操作
  fetchGroups: () => Promise<void>;
  createGroup: (data: { name: string; description?: string }) => Promise<MedicationGroup>;
  deleteGroup: (groupId: number) => Promise<void>;
  
  // 今日统计
  fetchTodayStats: () => Promise<void>;
  
  // 打卡操作
  checkIn: (data: { medication_id: number; schedule_id?: number; dose?: number; 
                   is_makeup?: boolean; makeup_reason?: string; photos?: any[] }) => Promise<void>;
  batchCheckIn: (medicationIds: number[], timeGroup?: string, is_makeup?: boolean) => Promise<void>;
}

export const useMedStore = create<MedState>((set, get) => ({
  medications: [],
  groups: [],
  todayStats: null,
  isLoading: false,
  error: null,

  fetchMedications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await medsAPI.getList(params);
      set({ medications: response.data.medications, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchMedicationDetail: async (medId) => {
    try {
      const response = await medsAPI.getDetail(medId);
      return response.data.medication;
    } catch (error: any) {
      throw error;
    }
  },

  createMedication: async (data) => {
    try {
      const response = await medsAPI.create(data);
      const newMed = response.data.medication;
      set((state) => ({
        medications: [newMed, ...state.medications],
      }));
      return newMed;
    } catch (error: any) {
      throw error;
    }
  },

  updateMedication: async (medId, data) => {
    try {
      const response = await medsAPI.update(medId, data);
      const updatedMed = response.data.medication;
      set((state) => ({
        medications: state.medications.map((m) =>
          m.id === medId ? updatedMed : m
        ),
      }));
      return updatedMed;
    } catch (error: any) {
      throw error;
    }
  },

  deleteMedication: async (medId) => {
    try {
      await medsAPI.delete(medId);
      set((state) => ({
        medications: state.medications.filter((m) => m.id !== medId),
      }));
    } catch (error: any) {
      throw error;
    }
  },

  updateStock: async (medId, operation, amount) => {
    try {
      const response = await medsAPI.updateStock(medId, { operation, amount });
      const newStock = response.data.stock;
      set((state) => ({
        medications: state.medications.map((m) =>
          m.id === medId ? { ...m, stock: newStock } : m
        ),
      }));
    } catch (error: any) {
      throw error;
    }
  },

  fetchGroups: async () => {
    try {
      const response = await medsAPI.getGroups();
      set({ groups: response.data.groups });
    } catch (error: any) {
      throw error;
    }
  },

  createGroup: async (data) => {
    try {
      const response = await medsAPI.createGroup(data);
      const newGroup = response.data.group;
      set((state) => ({
        groups: [...state.groups, newGroup],
      }));
      return newGroup;
    } catch (error: any) {
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await medsAPI.deleteGroup(groupId);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId),
      }));
    } catch (error: any) {
      throw error;
    }
  },

  fetchTodayStats: async () => {
    try {
      const response = await checkinAPI.getToday();
      set({ todayStats: response.data });
    } catch (error: any) {
      throw error;
    }
  },

  checkIn: async (data) => {
    try {
      const formData = new FormData();
      formData.append('medication_id', data.medication_id.toString());
      
      if (data.schedule_id) {
        formData.append('schedule_id', data.schedule_id.toString());
      }
      if (data.dose) {
        formData.append('dose', data.dose.toString());
      }
      if (data.is_makeup) {
        formData.append('is_makeup', 'true');
      }
      if (data.makeup_reason) {
        formData.append('makeup_reason', data.makeup_reason);
      }
      
      // 添加照片
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photo, index) => {
          formData.append('photos', {
            uri: photo.uri,
            type: 'image/jpeg',
            name: `checkin_${index}.jpg`,
          } as any);
        });
      }
      
      await checkinAPI.create(formData);
      
      // 刷新今日统计
      await get().fetchTodayStats();
      await get().fetchMedications();
    } catch (error: any) {
      throw error;
    }
  },

  batchCheckIn: async (medicationIds, timeGroup = 'all', is_makeup = false) => {
    try {
      await checkinAPI.batch({
        medication_ids: medicationIds,
        time_group: timeGroup,
        is_makeup,
      });
      
      // 刷新数据
      await get().fetchTodayStats();
      await get().fetchMedications();
    } catch (error: any) {
      throw error;
    }
  },
}));

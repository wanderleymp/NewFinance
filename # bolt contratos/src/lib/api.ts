import axios from 'axios';
import { Contract, ExtraService, Adjustment, HistoryEntry, ContractModification, ContractSummary } from '../types/contract';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const contractsApi = {
  list: async () => {
    const response = await api.get<Contract[]>('/contracts');
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  create: async (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Contract>('/contracts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Contract>) => {
    const response = await api.put<Contract>(`/contracts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/contracts/${id}`);
  },

  getHistory: async (id: string) => {
    const response = await api.get<HistoryEntry[]>(`/contracts/${id}/history`);
    return response.data;
  },

  getExtraServices: async (id: string) => {
    const response = await api.get<ExtraService[]>(`/contracts/${id}/services`);
    return response.data;
  },

  getAdjustments: async (id: string) => {
    const response = await api.get<Adjustment[]>(`/contracts/${id}/adjustments`);
    return response.data;
  },

  getModifications: async (id: string) => {
    const response = await api.get<ContractModification[]>(`/contracts/${id}/modifications`);
    return response.data;
  },

  addModification: async (id: string, data: Omit<ContractModification, 'id' | 'contractId' | 'createdAt'>) => {
    const response = await api.post<ContractModification>(`/contracts/${id}/modifications`, data);
    return response.data;
  },

  removeModification: async (id: string) => {
    await api.delete(`/modifications/${id}`);
  },

  getSummary: async (id: string) => {
    const response = await api.get<ContractSummary>(`/contracts/${id}/summary`);
    return response.data;
  },

  getBilling: async (id: string) => {
    const response = await api.get(`/contracts/${id}/billing`);
    return response.data;
  },
};
// src/services/supplierService.ts
import { apiClient } from './api';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto, PaginatedResponse } from '../types/indexSupplier';

export interface SupplierFilters {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const supplierService = {
  // Obtener lista paginada
  getAll: async (filters: SupplierFilters = {}): Promise<PaginatedResponse<Supplier>> => {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.department) params.set('department', filters.department);
    if (filters.status) params.set('status', filters.status);
    if (filters.page) params.set('_page', String(filters.page));
    if (filters.pageSize) params.set('_limit', String(filters.pageSize));

    const response = await apiClient.get<Supplier[]>(`/suppliers?${params}`);
    const total = parseInt(response.headers['x-total-count'] || '0', 10);

    return {
      data: response.data,
      total,
      page: filters.page || 1,
      pageSize: filters.pageSize || 10,
      totalPages: Math.ceil(total / (filters.pageSize || 10)),
    };
  },

  // Obtener uno por ID
  getById: async (id: number): Promise<Supplier> => {
    const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  // Crear nuevo supplier
  create: async (data: CreateSupplierDto): Promise<Supplier> => {
    const response = await apiClient.post<Supplier>('/suppliers', data);
    return response.data;
  },

  // Actualizar supplier (PATCH y no PUT: data es parcial y json-server
  // reemplazaría el recurso completo con un PUT, perdiendo los campos no enviados)
  update: async (id: number, data: UpdateSupplierDto): Promise<Supplier> => {
    const response = await apiClient.patch<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  // Eliminar supplier
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};

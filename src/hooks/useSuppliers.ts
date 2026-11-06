// src/hooks/useSuppliers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { handleError } from '../utils/errorHandler';
import { supplierService, type SupplierFilters } from '../services/supplierService';
import type { CreateSupplierDto, UpdateSupplierDto } from '../types/indexSupplier';

// Query key factory: centraliza los nombres de las queries
export const supplierKeys = {
  all: ['suppliers'] as const,
  list: (filters: SupplierFilters) => ['suppliers', 'list', filters] as const,
  detail: (id: number) => ['suppliers', id] as const,
};

// Hook para obtener la lista de suppliers
export function useSuppliers(filters: SupplierFilters = {}) {
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: () => supplierService.getAll(filters),
  });
}

// Hook para obtener un supplier por ID
export function useSupplier(id: number | null) {
  return useQuery({
    queryKey: supplierKeys.detail(id!),
    queryFn: () => supplierService.getById(id!),
    enabled: !!id, // Solo ejecuta si hay un ID
  });
}

// Hook para crear supplier
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierDto) => supplierService.create(data),
    onSuccess: (newSupplier) => {
      // Invalida la lista para que se refetche
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success(`${newSupplier.name} fue agregado exitosamente.`);
    },
    onError: (error) => {
      handleError(error, 'Error al crear supplier');
    },
  });
}

// Hook para actualizar supplier
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierDto }) =>
      supplierService.update(id, data),
    onSuccess: (updatedSupplier) => {
      // Actualiza el cache directamente (sin re-fetch)
      queryClient.setQueryData(
        supplierKeys.detail(updatedSupplier.id),
        updatedSupplier
      );
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success(`${updatedSupplier.name} fue actualizado exitosamente.`);
    },
    onError: (error) => {
      handleError(error, 'Error al actualizar supplier');
    },
  });
}

// Hook para eliminar supplier
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => supplierService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Empleado eliminado correctamente.');
    },
    onError: (error) => {
      handleError(error, 'Error al eliminar supplier');
    },
  });
}

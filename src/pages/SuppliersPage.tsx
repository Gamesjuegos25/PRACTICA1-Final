// src/pages/SuppliersPage.tsx
import { useState, useCallback, useMemo } from 'react';
import type { Supplier, SupplierStatus } from '../types/indexSupplier';
import SupplierCard from '../components/SupplierCard';
import StatsBadge from '../components/StatsBadge';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import SupplierForm from '../components/SupplierForm';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../hooks/useSuppliers';
import type { SupplierFormData } from '../schemas/supplierSchema';
import { useHasRole } from '../components/RoleGuard';

const formFieldClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

// Ciclo de estados al hacer clic en la insignia de una tarjeta
const nextStatus: Record<SupplierStatus, SupplierStatus> = {
  active: 'inactive',
  inactive: 'active',
};

function SuppliersPage() {
    // La página ya está restringida por RoleGuard a ADMIN/HR_MANAGER (App.tsx).
    // Eliminar suppliers, en la API real, es exclusivo de ADMIN (ni HR_MANAGER
    // puede), por eso la acción se deshabilita según el rol sin bloquear la ruta
    // ni ocultar la sección.
    const canDeleteSuppliers = useHasRole(['ADMIN']);

    // Estado de los filtros: es estado local de la UI, no del servidor
    const [search, setSearch] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<SupplierStatus | ''>('');

    // Estado del servidor: la lista de suppliers, filtrada. TanStack Query se encarga
    // de pedirla, cachearla y mantenerla sincronizada, sin useEffect ni useState.
    const { data, isLoading: loading, isError, error: queryError } = useSuppliers({
      search: search || undefined,
      status: selectedStatus || undefined,
    });
    const suppliers = data?.data || [];

    // Segunda query, sin filtros: las estadísticas son sobre el total de suppliers,
    // no sobre el filtro activo, por lo que necesitan su propia lista en caché.
    const { data: allData } = useSuppliers({});
    const allSuppliers = useMemo(() => allData?.data ?? [], [allData]);
    const totalSuppliers = allSuppliers.length;
    const activeSuppliers = allSuppliers.filter(emp => emp.status === 'active').length;
    const inactiveSuppliers = allSuppliers.filter(emp => emp.status === 'inactive').length;

    const createSupplier = useCreateSupplier();
    const updateSupplier = useUpdateSupplier();
    const deleteSupplier = useDeleteSupplier();

    // Estado del modal de creación/edición
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Memoizamos el handler para no recrearlo en cada render
    const handleSelectSupplier = useCallback((supplier: Supplier) => {
      alert(`Supplier: ${supplier.name}`);
    }, []);

    const handleDeleteSupplier = useCallback((id: number) => {
      if (!confirm('¿Estás seguro de eliminar este supplier?')) return;
      deleteSupplier.mutate(id);
    }, [deleteSupplier]);

    // Actualiza el estado de un supplier (ciclo Activo → En permiso → Inactivo → Activo)
    const handleToggleStatus = useCallback((supplier: Supplier) => {
      updateSupplier.mutate({ id: supplier.id, data: { status: nextStatus[supplier.status] } });
    }, [updateSupplier]);

    const handleOpenCreate = useCallback(() => {
      setEditingSupplier(undefined);
      setSubmitError(null);
      setModalOpen(true);
    }, []);

    const handleOpenEdit = useCallback((supplier: Supplier) => {
      setEditingSupplier(supplier);
      setSubmitError(null);
      setModalOpen(true);
    }, []);

    // React Hook Form ya validó los datos con Zod antes de llegar aquí;
    // esta función solo decide si crea o actualiza y llama a la mutación correspondiente.
    const handleSubmit = useCallback(async (formData: SupplierFormData) => {
      setSubmitError(null);
      try {
        if (editingSupplier) {
          await updateSupplier.mutateAsync({ id: editingSupplier.id, data: formData });
        } else {
          await createSupplier.mutateAsync(formData);
        }
        setModalOpen(false);
      } catch {
        setSubmitError('No se pudo guardar el supplier. Intenta de nuevo.');
      }
    }, [editingSupplier, createSupplier, updateSupplier]);

    const statuses: SupplierStatus[] = ['active', 'inactive'];
    const statusLabels: Record<SupplierStatus, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
    
    };

    return (
      <div className="p-6">
        {/* Encabezado */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestión de Suppliers</h2>
            <p className="text-slate-500 mt-1">
              {loading ? 'Cargando...' : `${suppliers.length} de ${totalSuppliers} suppliers`}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Nuevo supplier
          </button>
        </div>

        {/* Estadísticas */}
        <div className="flex flex-wrap gap-4 mb-6">
          <StatsBadge label="Total de suppliers" value={totalSuppliers} variant="blue" />
          <StatsBadge label="Suppliers activos" value={activeSuppliers} variant="green" />
          <StatsBadge label="Suppliers inactivos" value={inactiveSuppliers} variant="red" />
        </div>

        {/* Barra de filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-end gap-3">
          {/* Búsqueda por texto */}
          <FormField label="Buscar" className="flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Buscar por nombre, email o cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={formFieldClass}
            />
          </FormField>

      s

          {/* Filtro por estado */}
          <FormField label="Estado" className="min-w-[160px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as SupplierStatus | '')}
              className={formFieldClass}
            >
              <option value="">Todos los estados</option>
              {statuses.map(status => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </select>
          </FormField>

        

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mr-3" />
            <span>Cargando suppliers...</span>
          </div>
        )}

        {/* Estado de error */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">Error al cargar los suppliers</p>
            <p className="text-red-500 text-sm mt-1">
              {(queryError as Error)?.message || 'Error desconocido'}
            </p>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !isError && suppliers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No se encontraron suppliers con los filtros aplicados.</p>
          </div>
        )}

        {/* Lista de suppliers */}
        {!loading && !isError && suppliers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="relative">
                <div className="absolute -top-2.5 -right-2.5 z-10 flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(supplier)}
                    aria-label="Editar supplier"
                    title="Editar supplier"
                    className="w-6 h-6 rounded-full border-2 border-white bg-brand-600 text-white cursor-pointer text-xs leading-5 shadow-md"
                  >
                    ✎
                  </button>
                  {canDeleteSuppliers && (
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      aria-label="Eliminar supplier"
                      title="Eliminar supplier"
                      className="w-6 h-6 rounded-full border-2 border-white bg-red-500 text-white cursor-pointer text-sm leading-5 shadow-md"
                    >
                      ×
                    </button>
                  )}
                </div>
                <SupplierCard
                  supplier={supplier}
                  onSelect={handleSelectSupplier}
                  onToggleStatus={handleToggleStatus}
                />
              </div>
            ))}
          </div>
        )}

        {/* Modal de creación/edición (React Hook Form + Zod) */}
        <Modal
          isOpen={modalOpen}
          title={editingSupplier ? `Editar: ${editingSupplier.name}` : 'Nuevo supplier'}
          onClose={() => setModalOpen(false)}
        >
          <SupplierForm
            supplier={editingSupplier}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            isLoading={createSupplier.isPending || updateSupplier.isPending}
            error={submitError}
          />
        </Modal>
      </div>
      /</div>
    );
}

export default SuppliersPage;

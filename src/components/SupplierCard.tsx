// src/components/SupplierCard.tsx
import type { Supplier } from '../types/indexSupplier';

interface SupplierCardProps {
  supplier: Supplier;
  onSelect?: (supplier: Supplier) => void;
  onToggleStatus?: (supplier: Supplier) => void;
}

const statusConfig = {
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' },
  inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactivo' },
};

function SupplierCard({ supplier, onSelect, onToggleStatus }: SupplierCardProps) {
  const { name,   status } = supplier;
  const statusStyle = statusConfig[status];

  return (
    <div
      onClick={() => onSelect?.(supplier)}
      className={`
        bg-white rounded-xl border border-slate-200 p-5 w-full
        hover:shadow-md hover:border-blue-300
        transition-all duration-200
        ${onSelect ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>

        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
       
        <span
          onClick={(e) => { e.stopPropagation(); onToggleStatus?.(supplier); }}
          title={onToggleStatus ? 'Clic para cambiar el estado' : undefined}
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} ${onToggleStatus ? 'cursor-pointer hover:opacity-75' : ''}`}
        >
          {statusStyle.label}
        </span>
      </div>
    </div>
  );
}

export default SupplierCard;

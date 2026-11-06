// src/schemas/supplierSchema.ts
import { z } from 'zod';

export const supplierSchema = z.object({
  name: z
    .string({ error: 'El nombre es requerido' })
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  email: z
    .string({ error: 'El email es requerido' })
    .email('Formato de email inválido'),

 phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
 
category: z.enum(['insumos', 'servicios', 'tecnologia']).default('insumos'),

 calification: z.enum(['1', '2', '3', '4', '5']).default('1'),

 registryDate: z
    .string({ error: 'La fecha de registro es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),


  status: z.enum(['active', 'inactive']).default('active'),

 

 
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

// Tipo de entrada del schema (antes de que Zod aplique z.coerce y los .default()):
// react-hook-form lo usa para el formulario, distinto del tipo
// de salida (SupplierFormData) que recibe onSubmit una vez validado.
export type SupplierFormInput = z.input<typeof supplierSchema>;

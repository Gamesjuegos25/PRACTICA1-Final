// src/types/index.ts

// --- Tipos base del dominio ---


export type SupplierRole = "admin" | "hr" | "supplier";
export type Category = "insumos" | "servicios" | "tecnologia";
export type calification = "1" | "2" | "3"| "4" | "5";

export type SupplierStatus = "active" | "inactive" ;

// --- Entidad principal ---

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone?: string;
  category : Category;
calification: calification;
 registryDate: string; // ISO 8601: "2024-01-15"
  status: SupplierStatus;
}

// --- Tipos para creación y actualización ---

export type CreateSupplierDto = Omit<Supplier, "id">;
export type UpdateSupplierDto = Partial<CreateSupplierDto>;

// --- Tipos de autenticación (JWT contra API-RH) ---

// Roles que emite API-RH (distintos del SupplierRole de arriba, que es un
// campo del empleado del mock local).
export type AuthRole = "ADMIN" | "HR_MANAGER" | "EMPLOYEE";

export interface AuthUserRole {
  code: AuthRole;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: AuthUserRole;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// --- Tipos de respuesta de la API ---

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Tipos de navegación ---

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  allowedRoles: AuthRole[];
}

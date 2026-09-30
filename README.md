# Mini Sistema de RRHH

Aplicación web para la gestión de empleados. El listado y el CRUD de empleados
se sirven desde una API local (JSON Server); la sesión (login, renovación del
token y roles) se resuelve contra una instancia de API-RH.

## Stack

- React 19 y TypeScript, con Vite como herramienta de build.
- TailwindCSS para los estilos.
- React Router para la navegación y las rutas protegidas por rol.
- Zustand para el estado de sesión.
- TanStack Query para el estado del servidor.
- React Hook Form y Zod para formularios y validación.
- Axios como cliente HTTP, con interceptores para el token y los errores.
- react-hot-toast para las notificaciones.
- ESLint (`typescript-eslint`) como linter.

## Requisitos

- Node.js 20 o superior.
- La URL base de una instancia de API-RH.

## Puesta en marcha

```bash
npm install
cp .env.example .env
```

Completa `.env` con la URL base de API-RH, sin `/api/v1` al final:

```
VITE_AUTH_API_URL=<API_BASE_URL_ASIGNADA>
```

Levanta la API local de empleados y la aplicación, cada una en su terminal:

```bash
npm run mock-api   # JSON Server en http://localhost:3001 (datos de db.json)
npm run dev        # aplicación en http://localhost:5173
```

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Compila TypeScript y genera el build de producción. |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto. |
| `npm run preview` | Sirve el build de producción de forma local. |
| `npm run mock-api` | Levanta JSON Server con `db.json`. |

## Estructura

```
src/
├── components/   # Componentes reutilizables (EmployeeCard, Modal, guards, etc.)
├── hooks/        # Hooks de TanStack Query (useEmployees)
├── layouts/      # Estructura de página (Header)
├── pages/        # Login, Dashboard y Empleados
├── schemas/      # Esquemas de validación con Zod
├── services/     # Clientes HTTP y servicios (API local y API-RH)
├── store/        # Estado de sesión con Zustand
├── types/        # Tipos e interfaces compartidos
└── utils/        # Manejo de errores y datos de apoyo
```

## Roles

| Rol | Acceso |
| --- | --- |
| `ADMIN` | Dashboard y empleados, con permiso para eliminar. |
| `HR_MANAGER` | Dashboard y empleados. |
| `EMPLOYEE` | Dashboard. |

El ocultamiento de opciones por rol es solo de experiencia de uso: la
autorización real la aplica el backend.

## Flujo de ramas

- `main` y `stage`: ramas estables.
- `develop`: integración.
- `feature_*`: cambios individuales, que se integran a `develop`.

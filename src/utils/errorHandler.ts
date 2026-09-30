// src/utils/errorHandler.ts
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Forma de API-RH: { success:false, error:{ code, message, details } }
interface ApiRhErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; messages: string[] }[];
  };
}

// Forma cruda de NestJS (la que devuelve el mock local): { message, error, statusCode }
interface RawNestError {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

// API-RH responde los mensajes en inglés; el código (error.code) es estable,
// así que se traduce aquí. Solo incluye códigos definidos por la API.
const MENSAJES_POR_CODIGO: Record<string, string> = {
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  UNAUTHORIZED: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  INSUFFICIENT_ROLE: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  EMPLOYEE_PROFILE_NOT_LINKED: 'Tu cuenta aún no está vinculada a un empleado.',
  DOCUMENT_STORAGE_BUSY: 'El almacenamiento está ocupado. Reintenta en unos segundos.',
  DOCUMENT_FILE_CONTENT_INVALID: 'El contenido del archivo no coincide con su tipo.',
  LEAVE_REQUEST_DATE_OVERLAP: 'Las fechas se traslapan con otra solicitud.',
  VACATION_BALANCE_EXCEEDED: 'No tienes saldo suficiente de vacaciones.',
};

// Extrae el mensaje legible de cualquier tipo de error, venga del mock local o de API-RH
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // 1. Envelope real de API-RH
    const envelope = data as Partial<ApiRhErrorEnvelope> | undefined;
    if (envelope?.error) {
      const traducido = MENSAJES_POR_CODIGO[envelope.error.code];
      if (traducido) return traducido;
      if (envelope.error.message) return envelope.error.message;
    }

    // 2. Forma cruda del mock local (JSON Server)
    const raw = data as RawNestError | undefined;
    if (raw?.message) {
      // A veces es un array de mensajes de validación
      return Array.isArray(raw.message) ? raw.message[0] : raw.message;
    }

    // Errores de red (sin respuesta del servidor)
    if (!error.response) {
      return 'Sin conexión. Verifica tu red e intenta de nuevo.';
    }

    // Fallback por código HTTP
    switch (error.response.status) {
      case 400: return 'Solicitud inválida. Verifica los datos enviados.';
      case 401: return 'Sesión expirada. Por favor inicia sesión de nuevo.';
      case 403: return 'No tienes permisos para realizar esta acción.';
      case 404: return 'El recurso solicitado no fue encontrado.';
      case 413: return 'El archivo es demasiado grande.';
      case 422: return 'Los datos enviados no son válidos.';
      case 500: return 'Error del servidor. Intenta de nuevo en unos momentos.';
      default: return `Error inesperado (${error.response.status}).`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
}

// Errores de infraestructura: red caída, 403 y 5xx. Los notifican los
// interceptores de axios UNA vez; handleError no los repite.
export function isGloballyHandled(error: unknown): boolean {
  if (!(error instanceof AxiosError)) return false;
  const status = error.response?.status;
  return !error.response || status === 403 || (status !== undefined && status >= 500);
}

// Toast global para los errores de infraestructura (se llama desde los interceptores).
// El "id" evita apilar el mismo toast si fallan varias peticiones a la vez.
export function notifyGlobalError(error: unknown): void {
  if (!isGloballyHandled(error)) return;
  const status = (error as AxiosError).response?.status;

  if (status === undefined) {
    toast.error('Sin conexión con el servidor. Verifica que esté en línea.', { id: 'error-red' });
  } else if (status === 403) {
    toast.error('No tienes permisos para realizar esta acción.', { id: 'error-403' });
  } else {
    toast.error('Error del servidor. Intenta de nuevo en unos momentos.', { id: 'error-5xx' });
  }
}

// Errores locales (400, 404, 409, 422...): cada operación los muestra con su contexto
export function handleError(error: unknown, context?: string): void {
  console.error('[Error]', context, error);
  if (isGloballyHandled(error)) return;

  const message = extractErrorMessage(error);
  toast.error(context ? `${context}: ${message}` : message);
}

// Mapea errores de validación del servidor a campos de React Hook Form.
// API-RH: error.details = [{ field, messages[] }] (400). El mock usa 422 con { errors }.
export function mapServerValidationErrors(
  error: unknown,
  setError: (field: string, error: { message: string }) => void
): void {
  if (!(error instanceof AxiosError)) return;
  const status = error.response?.status;
  if (status !== 400 && status !== 422) return;

  const data = error.response?.data as
    | Partial<ApiRhErrorEnvelope>
    | { errors?: Record<string, string> }
    | undefined;

  const details = (data as Partial<ApiRhErrorEnvelope> | undefined)?.error?.details;
  if (details) {
    details.forEach(({ field, messages }) => setError(field, { message: messages[0] }));
    return;
  }

  const errors = (data as { errors?: Record<string, string> } | undefined)?.errors;
  if (errors) {
    Object.entries(errors).forEach(([field, message]) => setError(field, { message }));
  }
}

/**
 * Toast Notification Types & Constants
 * Centraliza todos los tipos y mensajes de toast del proyecto
 */

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface ToastProps {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  actions?: ActionButton;
  onDismiss?: () => void;
  highlightTitle?: boolean;
}

/**
 * Mensajes de toast reutilizables
 * DRY: Un único lugar para todos los mensajes
 */
export const TOAST_MESSAGES = {
  // Profesionales
  professional: {
    updateSuccess: {
      title: '✅ Profesional actualizado',
      message: 'Los cambios se guardaron correctamente',
    },
    updateError: {
      title: '❌ Error al actualizar',
      message: 'No se pudo guardar los cambios. Intenta de nuevo.',
    },
    deleteSuccess: {
      title: '✅ Profesional eliminado',
      message: 'El profesional fue removido del sistema',
    },
    deleteError: {
      title: '❌ Error al eliminar',
      message: 'No se pudo eliminar el profesional. Intenta de nuevo.',
    },
    createSuccess: {
      title: '✅ Profesional creado',
      message: 'El nuevo profesional fue agregado exitosamente',
    },
    createError: {
      title: '❌ Error al crear',
      message: 'No se pudo crear el profesional. Intenta de nuevo.',
    },
  },

  // Servicios
  service: {
    updateSuccess: {
      title: '✅ Servicio actualizado',
      message: 'Los cambios se guardaron correctamente',
    },
    updateError: {
      title: '❌ Error al actualizar',
      message: 'No se pudo guardar los cambios. Intenta de nuevo.',
    },
    deleteSuccess: {
      title: '✅ Servicio eliminado',
      message: 'El servicio fue removido del sistema',
    },
    deleteError: {
      title: '❌ Error al eliminar',
      message: 'No se pudo eliminar el servicio. Intenta de nuevo.',
    },
    createSuccess: {
      title: '✅ Servicio creado',
      message: 'El nuevo servicio fue agregado exitosamente',
    },
    createError: {
      title: '❌ Error al crear',
      message: 'No se pudo crear el servicio. Intenta de nuevo.',
    },
  },

  // Autenticación
  auth: {
    loginSuccess: {
      title: '✅ Sesión iniciada',
      message: 'Bienvenido de vuelta',
    },
    loginError: {
      title: '❌ Error al iniciar sesión',
      message: 'Email o contraseña incorrectos',
    },
    logoutSuccess: {
      title: '✅ Sesión cerrada',
      message: 'Hasta luego',
    },
  },

  // Citas
  appointment: {
    createSuccess: {
      title: '✅ Cita reservada',
      message: 'Tu cita fue confirmada exitosamente',
    },
    createError: {
      title: '❌ Error al reservar',
      message: 'No se pudo crear la cita. Intenta de nuevo.',
    },
    cancelSuccess: {
      title: '✅ Cita cancelada',
      message: 'La cita fue cancelada correctamente',
    },
    cancelError: {
      title: '❌ Error al cancelar',
      message: 'No se pudo cancelar la cita. Intenta de nuevo.',
    },
  },

  // Genéricos
  generic: {
    success: {
      title: '✅ Operación exitosa',
      message: 'Los cambios se guardaron correctamente',
    },
    error: {
      title: '❌ Algo salió mal',
      message: 'Intenta de nuevo o contacta soporte',
    },
    info: {
      title: 'ℹ️ Información',
      message: 'Nota importante',
    },
    warning: {
      title: '⚠️ Advertencia',
      message: 'Por favor verifica antes de continuar',
    },
  },

  superAdmin: {
    tenantCreateConflict: {
      title: '⚠️ No se pudo crear el cliente',
      message: 'Ya existe un cliente con ese slug o email. Revisa los datos e intenta de nuevo.',
    },
  },
} as const;

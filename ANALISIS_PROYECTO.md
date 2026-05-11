# 📊 Análisis Completo: turnow

**Fecha de análisis:** 11 de Mayo, 2026  
**Estado del proyecto:** En desarrollo avanzado (JWT, refresh, multi-tenant y routing funcionales)

---

## 🏗️ ARQUITECTURA GENERAL

```
Frontend (React 19.2.3 + TypeScript + Vite)    ↔    Backend (Spring Boot + Java)
  └─ SPA (Single Page Application)                    └─ REST API
```

---

## 📋 BACKEND (Java/Spring Boot)

### ✅ ENDPOINTS IMPLEMENTADOS

#### 1️⃣ **Autenticación** (`/auth`)
- ✅ `POST /auth/login` - Login con email/password + JWT
  - Request: `{ email, password }`
  - Response: `{ accessToken, tokenType, expiresIn, userId, tenantId, tenantName, email, fullName, firstName, lastName, role }`
  - JWT firmado con HS256, con expiración de 1h en la respuesta actual
  - `POST /auth/refresh` - Renueva el token mientras siga siendo válido
  - Roles: SUPER_ADMIN, TENANT_ADMIN, STAFF, CLIENT
  - Password encoding: BCrypt con fallback a plaintext

#### 2️⃣ **Super Admin** (`/admin/super`)
- ✅ `GET /admin/super/overview` - Dashboard global
  - Retorna: Total tenants, activos, appointments, revenue, crecimiento mensual, planes
- ✅ `GET /admin/super/tenants` - Listar tenants (con búsqueda)
- ✅ `POST /admin/super/tenants` - Crear nuevo tenant
- ✅ `PATCH /admin/super/tenants/{tenantId}/status` - Actualizar estado
- ✅ `DELETE /admin/super/tenants/{tenantId}` - Eliminar tenant

#### 3️⃣ **Tenant Admin** (`/admin/tenant`)
- ✅ `GET /admin/tenant/{tenantId}/overview` - Dashboard del admin del negocio
  - Incluye: Tenant info, métricas, appointments, profesionales, servicios
- ✅ `GET /admin/tenant/{tenantId}/appointments` - Listar citas (filtrable por fecha)
- ✅ `GET /admin/tenant/{tenantId}/professionals` - Listar profesionales
- ✅ `POST /admin/tenant/{tenantId}/professionals` - Crear profesional
- ✅ `PUT /admin/tenant/{tenantId}/professionals/{professionalId}` - Editar profesional
- ✅ `DELETE /admin/tenant/{tenantId}/professionals/{professionalId}` - Eliminar profesional
- ✅ `GET /admin/tenant/{tenantId}/services` - Listar servicios
- ✅ `POST /admin/tenant/{tenantId}/services` - Crear servicio
- ✅ `PUT /admin/tenant/{tenantId}/services/{serviceId}` - Editar servicio
- ✅ `DELETE /admin/tenant/{tenantId}/services/{serviceId}` - Eliminar servicio
- ✅ `PUT /admin/tenant/{tenantId}/settings` - Actualizar configuración (colores, etc)

#### 4️⃣ **Public Booking** (`/public`)
- ✅ `GET /public/tenant/{slug}` - Obtener info pública del negocio
- ✅ `GET /public/tenant/{slug}/services` - Listar servicios públicos
- ✅ `GET /public/tenant/{slug}/professionals` - Listar profesionales (filtrable por servicio)
- ✅ `GET /public/tenant/{slug}/slots` - Obtener horarios disponibles
  - Params: professionalId, serviceId, date
- ✅ `POST /public/tenant/{slug}/appointments` - Crear cita
- ✅ `POST /public/appointments/cancel/{token}` - Cancelar cita por token

### 🛠️ SERVICIOS IMPLEMENTADOS
- **SlotCalculatorService** - Calcula horarios disponibles
- **AppointmentService** - Gestiona citas
- **TenantSettingsRepository** - Configuración por tenant (colores, etc)

### 🗄️ MODELO MULTI-TENANT ACTUAL
- ✅ `User`, `Professional`, `Service` y `Appointment` están vinculados a `Tenant` con `@ManyToOne`
- ✅ Las entidades exponen `tenantId` de solo lectura para consultas y DTOs
- ✅ Migraciones Flyway `V2` y `V3` agregaron las claves foráneas necesarias
- ✅ `SUPER_ADMIN` es el único rol que puede existir sin `tenant_id`

### 🔒 SEGURIDAD
- ✅ **JWT implementado** - HS256 firmado, claims: userId, tenantId, role, email (sub)
- ✅ **JwtAuthenticationFilter** - Valida token en cada request
- ✅ **@PreAuthorize** - Control de acceso por rol en endpoints admin
- ✅ **CORS configurado** - Permite localhost en dev, dominios específicos en prod
- ✅ **Session stateless** (sin cookies de sesión)
- ✅ **CSRF deshabilitado** (apropiado para SPA con JWT)
- ✅ **Password encoding** - BCrypt con fallback a plaintext para migración
- ✅ **Environment-based secrets** - JWT_SECRET via env var en dev/prod

---

## 🎨 FRONTEND (React 19 + TypeScript)

### ✅ PÁGINAS IMPLEMENTADAS

#### 1️⃣ **Landing Page** (`LandingPage.tsx`)
- ✅ Página pública de bienvenida
- ✅ Botones: "Iniciar sesión" y "Reservar turno"

#### 2️⃣ **Login** (`LoginPage.tsx`)
- ✅ Formulario de login (email + password)
- ✅ Integrado con AuthContext
- ✅ Validaciones básicas

#### 3️⃣ **Public Booking** (`PublicBooking.tsx`)
- ✅ 3-step booking wizard:
  - Step 1: Seleccionar servicio
  - Step 2: Seleccionar profesional y fecha
  - Step 3: Seleccionar hora y datos del cliente
- ✅ Calendario interactivo
- ✅ Carga de horarios disponibles en tiempo real
- ✅ Demo hardcodeado con slug: `bella-vida-spa`

#### 4️⃣ **Tenant Admin Dashboard** (`TenantAdminDashboard.tsx`)
- ✅ 5 pestañas (Tabs):
  - Dashboard: Métricas y citas recientes
  - Calendario: Ver citas por fecha
  - Profesionales: Listar, crear, editar, eliminar
  - Servicios: Listar, crear, editar, eliminar
  - Configuración: Actualizar datos del negocio
- ✅ Carga datos desde API
- ✅ Interfaz responsive con sidebar

#### 5️⃣ **Super Admin Dashboard** (`SuperAdminDashboard.tsx`)
- ✅ 3 pestañas:
  - Overview: Métricas globales
  - Tenants: Listar, crear, buscar, cambiar estado, eliminar
  - Plans: Información de planes (UI)
- ✅ Búsqueda de tenants
- ✅ Interfaz responsiva

### 🔌 API CLIENT (`src/lib/api.ts`)
- Cliente centralizado con `request()` y refresh automático cuando recibe `401`.
- Guarda el token en `localStorage['turnow_token']` y reintenta la request con el token nuevo si el refresh funciona.
- La lógica de dominio está separada en repositorios: `authRepository`, `superAdminRepository`, `tenantAdminRepository` y `publicBookingRepository`.

### 🎭 CONTEXTO DE AUTENTICACIÓN
- ✅ **AuthContext** - Maneja user + token binding
- ✅ **JWT persistence** - Token almacenado en localStorage['turnow_token']
- ✅ **Session hydration** - Lee token + user al cargar la página y reconstruye el usuario desde el JWT
- ✅ **Token propagation** - Bearer token enviado en Authorization header
- ✅ **Token refresh** - El cliente renueva el access token contra `POST /auth/refresh` si el backend responde `401`
- ✅ **isAuthenticated** - Requiere user + token (no solo uno)
- ✅ **isReady** - Previene redirects prematuros durante hydration

### 🎨 COMPONENTES UI
- ✅ MetricCard - Tarjeta de métrica
- ✅ StatusBadge - Badge de estado
- ✅ BaseFormDialog - Dialog genérico reutilizable para formularios
- ✅ EditProfessionalDialog - Modal para editar profesionales
- ✅ EditServiceDialog - Modal para editar servicios
- ✅ CreateProfessionalDialog - Modal para crear profesionales
- ✅ CreateServiceDialog - Modal para crear servicios
- ✅ EditTenantDialog - Modal para editar datos del tenant
- ✅ EditTenantColorDialog - Modal para editar colores/branding del tenant
- ✅ Toast system - Notificaciones con sonner + framer-motion

---

## ⚙️ RUNTIME CONFIG (Dev/Prod)

### 📁 Configuración Frontend

**Archivo:** `src/lib/runtimeConfig.ts`
- ✅ Detección automática de ambiente por hostname
- ✅ El frontend local usa `http://localhost:8080/api`
- ✅ Los entornos no locales cargan `/config.development.json` o `/config.json`

**Ambientes actuales:**
- **Local** → API: `http://localhost:8080/api`
- **Dev** → API: `https://apidev-turnow.shiftya.online/api`
- **Prod** → API: `https://api-turnow.shiftya.online/api`

**Archivos de config:**
- `public/config.development.json` - Dev remoto
- `public/config.json` - Prod remoto

---

## 🛣️ REACT ROUTER (Routing implementado)

### ✅ Estructura de Rutas
```
/ → LandingRoute (detecta ambiente y redirige)
  ├─ /login → RequireGuestLayout → LoginPage (solo sin autenticación)
  ├─ /dashboard → RequireAuthLayout → DashboardRoute
  │   ├─ /super-admin → SuperAdminDashboard (si role=SUPER_ADMIN)
  │   └─ /tenant-admin → TenantAdminDashboard (si role=TENANT_ADMIN)
  └─ /booking → PublicBooking (sin protección)
```

### ✅ Guards Implementados (Layouts Separados)

**RequireAuthLayout** (`src/routes/RequireAuthLayout.tsx`)
- Valida: `isReady && isAuthenticated`
- Si falla → Redirige a `/login`
- Renderiza: `<Outlet />` para nested routes

**RequireGuestLayout** (`src/routes/RequireGuestLayout.tsx`)
- Valida: Usuario NO autenticado
- Si falla → Redirige a `/dashboard`
- Permite login sin estar logueado

**LandingRoute** (`src/routes/LandingRoute.tsx`)
- En localhost/dev → Redirige a `/login`
- En prod → Redirige a landing URL externa

**DashboardRoute** (`src/routes/DashboardRoute.tsx`)
- Renderiza dashboard según rol
- SUPER_ADMIN → SuperAdminDashboard
- TENANT_ADMIN → TenantAdminDashboard

### 📌 UI DE DASHBOARDS ACTUAL
- `TenantAdminDashboard` usa una sidebar + contenido desacoplado con tabs para dashboard, calendario, profesionales, servicios y configuración.
- `SuperAdminDashboard` usa una sidebar + contenido desacoplado con tabs para overview, tenants y plans.
- `BaseFormDialog` ya está corregido para evitar el nested button bug con `DialogTrigger asChild`.

---

## 🔴 GAPS Y FUNCIONALIDADES FALTANTES

### BACKEND
| Funcionalidad | Estado | Prioridad | Notas |
|---|---|---|---|
| **Logout endpoint** | ❌ Sin implementar | 🟡 MEDIA | Blacklist de tokens (opcional, solo client-side por ahora) |
| **Notificaciones por email** | ❌ Sin implementar | 🟡 MEDIA | Reminders y confirmaciones de cita |
| **Disponibilidad (Availability)** | ✅ Parcial | 🟡 MEDIA | SlotCalculator existe, pero todavía puede crecer |
| **Cancelación de citas** | ⚠️ Existe por token | 🟢 BAJA | Pero falta validación adicional |
| **Validación de datos** | ⚠️ Básica | 🟡 MEDIA | Agregar más @Valid decorators |

### FRONTEND
| Funcionalidad | Estado | Prioridad | Notas |
|---|---|---|---|
| **Refresh token automático** | ✅ Implementado | 🟢 BAJA | El cliente reintenta con `POST /auth/refresh` |
| **Error handling 401/403** | ✅ Parcialmente resuelto | 🟡 MEDIA | 401 dispara refresh; si falla, vuelve a login |
| **Editar tenant (admin)** | ✅ Implementado | 🟢 BAJA | Dialogs y acciones integradas en el dashboard |
| **Filtros avanzados** | ❌ Sin implementar | 🟢 BAJA | Por fecha, estado, etc |
| **Exportar datos** | ❌ Sin implementar | 🟢 BAJA | CSV, PDF |
| **Responsive design mobile** | ⚠️ Parcial | 🟢 BAJA | Sidebar existe pero mejorable |

---

## 🎨 COMPONENTES UI IMPLEMENTADOS (✅ 5 Mayo 2026)

### Estructura Base Creada

Se implementó una **arquitectura reutilizable de componentes UI** con soporte para variantes de formularios tipo dialog. Esto permite agregar nuevos dialogs de forma rápida sin duplicar código.

#### 1️⃣ Componentes UI Primitivos (`/src/components/ui/`)
- **`dialog.tsx`** - Dialog base con Radix UI (DialogContent, DialogHeader, etc.)
- **`button.tsx`** - Button reutilizable con variantes (default, outline, ghost, destructive)
- **`input.tsx`** - Input con estilos Tailwind
- **`label.tsx`** - Label para formularios
- **`toaster.tsx`** - Notificaciones con sonner

#### 2️⃣ Componente Base Reutilizable (`/src/components/dialogs/`)
- **`BaseFormDialog.tsx`** - Componente **genérico** para crear dialogs con formularios
  - Maneja lógica de abrir/cerrar
  - Renderiza campos dinámicamente (text, email, textarea, select)
  - Valida campos requeridos
  - Estados de loading automáticos
  - Trigger personalizable (botón o componente custom)

#### 3️⃣ Dialogs Especializados - CRUD Profesionales
- **`CreateProfessionalDialog.tsx`** - Dialog para crear profesionales
  - ✅ Campos: firstName, lastName, email, phone, speciality
  - ✅ Animaciones elegantes
  - ✅ Integrado en TenantAdminDashboard
- **`EditProfessionalDialog.tsx`** - Dialog para editar profesionales
  - ✅ Campos: firstName, lastName, email, phone, speciality (con defaultValue)
  - ✅ Animaciones elegantes (cascada de entrada)
  - ✅ Integrado en TenantAdminDashboard

#### 4️⃣ Dialogs Especializados - CRUD Servicios
- **`CreateServiceDialog.tsx`** - Dialog para crear servicios
  - ✅ Campos: name, description, category, duration, price
  - ✅ Integrado en TenantAdminDashboard
- **`EditServiceDialog.tsx`** - Dialog para editar servicios
  - ✅ Campos: name, description, category, duration, price (con defaultValue)
  - ✅ Animaciones elegantes (cascada de entrada)
  - ✅ Integrado en TenantAdminDashboard

#### 5️⃣ Dialogs Especializados - Settings
- **`EditTenantDialog.tsx`** - Dialog para editar datos del tenant
  - ✅ Campos: name, email, phone
  - ✅ Integrado en TenantAdminDashboard
- **`EditTenantColorDialog.tsx`** - Dialog para editar color theme del tenant
  - ✅ Color picker integrado
  - ✅ Preview en tiempo real

### ✅ Sistema de Notificaciones
- ✅ `useToast()` hook personalizado para toasts
- ✅ Integración con sonner + framer-motion
- ✅ Toasts en todas las operaciones CRUD
- ✅ Manejo de errores con toast messages

### 🔄 Cómo Agregar Nuevas Variantes

Para crear un nuevo dialog (ej: NewFeatureDialog):

```tsx
// src/components/dialogs/NewFeatureDialog.tsx
import { BaseFormDialog, type FormField } from "./BaseFormDialog";

interface NewFeatureDialogProps {
  onSave: (data: any) => Promise<void>;
}

export const NewFeatureDialog = ({ onSave }: NewFeatureDialogProps) => {
  const fields: FormField[] = [
    {
      id: "name",
      label: "Nombre",
      type: "text",
      required: true,
    },
    // ... más campos
  ];

  return (
    <BaseFormDialog
      title="Nueva Funcionalidad"
      fields={fields}
      onSubmit={onSave}
      triggerLabel="Crear"
    />
  );
};
```

### 📦 Dependencias Instaladas

```bash
@radix-ui/react-dialog          # Dialog primitivo
@radix-ui/react-icons           # Icons (Cross2Icon)
@radix-ui/react-slot            # For forwardRef with asChild
class-variance-authority        # Para variantes de componentes
sonner                          # Toast notifications
framer-motion                   # Animaciones suaves
```

---

## 📊 RESUMEN TÉCNICO

### Backend Stack
- **Framework:** Spring Boot 3.x
- **Lenguaje:** Java 21+
- **BD:** PostgreSQL con JPA/Hibernate y Flyway
- **Seguridad:** Spring Security + JWT + refresh token endpoint

### Frontend Stack
- **Framework:** React 19.2.3
- **Lenguaje:** TypeScript
- **Build tool:** Vite 7.3.2
- **Iconos:** Lucide React
- **Estilos:** Tailwind CSS (inferido por el código)

### Estado actual
- ✅ **Core funcional:** login, dashboards, booking público y CRUD multi-tenant están implementados
- ✅ **Autenticación:** JWT + refresh token + hydration de sesión en frontend
- ✅ **UI:** dialogs reutilizables, toasts y layouts separados por rol
- ⚠️ **Pendiente:** notificaciones, logout server-side, más validaciones y pulido responsive

---

## 🚀 PLAN DE IMPLEMENTACIÓN SUGERIDO

### ✅ Fase 1: Seguridad & Routing (COMPLETADA)
- ✅ JWT implementado en backend (HS256)
- ✅ JwtAuthenticationFilter + validación de tokens
- ✅ @PreAuthorize en endpoints admin
- ✅ React Router con nested routes
- ✅ Route guards (RequireAuthLayout, RequireGuestLayout)
- ✅ Token persistence en localStorage
- ✅ Bearer token propagation en API client

### 🔧 Fase 2: Runtime Config & Deployment (COMPLETADA)
- ✅ Runtime config para local/dev/prod con detección de hostname
- ✅ Config files (`config.json`, `config.development.json`)
- ✅ API local apuntando a `http://localhost:8080/api`
- ✅ Backend con JWT + refresh token implementados

### 🎨 Fase 3: UI/UX Polish (EN PROGRESO)
- ✅ BaseFormDialog component (reutilizable)
- ✅ CRUD Dialogs: Create/Edit para Profesionales y Servicios
- ✅ Dialogs para edición del tenant y su branding
- ✅ Toast notification system (sonner + framer-motion)
- ✅ Loading states + error handling
- ✅ Integración en TenantAdminDashboard
- ⏳ Responsive design mobile (pending minor tweaks)
- ⏳ Logout server-side y notificaciones por email

### 🔴 Fase 4: Funcionalidades Críticas (PENDING)
1. **Email notifications** - Confirmaciones y reminders de citas
2. **Logout proper** - Limpiar token + blacklist (opcional)
3. **Mejoras de disponibilidad** - SlotCalculator y validaciones de agenda
4. **Más validaciones y filtros** - UX y control de datos

### 🟡 Fase 5: Polish & Testing (PENDING)
1. Unit tests para AuthContext
2. E2E tests para login flow
3. Integration tests para CRUD operations
4. Swagger/OpenAPI documentation

---

## 📅 ESTADO ACTUAL

**MVP (mínimo viable):** 🟢 **Funcional**
- ✅ JWT, refresh token y session hydration
- ✅ CRUD completo multi-tenant para profesionales, servicios y tenant settings
- ✅ React Router con guards y dashboards por rol
- ✅ Runtime config local/dev/prod
- ⚠️ Quedan mejoras de producto y hardening

**Beta completo:** 🟡 **Cerca de completarse**
- Notificaciones por email
- Logout server-side
- Más tests E2E y de integración

**Release v1.0:** 🔴 **Pendiente de pulido final**
- Observabilidad y métricas
- Hardening de validaciones
- Mejoras responsive y UX

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### 🟡 SINCRONIZACIÓN DE ENTORNOS
1. **Redeploy remoto si hace falta**
  - El código local ya tiene JWT, refresh y tenantName en el login
  - Si el backend remoto sigue desactualizado, hay que publicar el build nuevo

### 🔧 PENDIENTES REALES
2. **Email notifications**
  - Confirmaciones y reminders de cita

3. **Logout server-side**
  - Limpiar token en cliente y, si se quiere endurecer, agregar blacklist

4. **Validar el flujo end-to-end**
  - Login local → token + user + tenant
  - Dashboard protegido accesible
  - Refresh de sesión al expirar el token

---

## 📊 RESUMEN DE PROGRESO

| Componente | Estado | Bloqueado | Notas |
|-----------|--------|-----------|-------|
| **JWT Backend** | ✅ Código OK | ⚠️ Si remoto | AuthController y refresh están en el código actual |
| **JWT Frontend** | ✅ Almacenaje OK | ❌ No | API client con refresh automático |
| **React Router** | ✅ Completo | ❌ No | Routes + Guards implementadas |
| **CRUD UI** | ✅ Completo | ❌ No | Dialogs + Forms working |
| **Runtime Config** | ✅ Completo | ❌ No | Dev/Prod separation OK |
| **Refresh Token** | ✅ Implementado | ❌ No | `POST /auth/refresh` ya existe y el cliente lo usa |
| **Email Notif** | ❌ No start | 🟢 Low priority | Para futuro |

---

## 🌐 CONFIGURACIÓN DEV & PROD

### 📁 Estado real de configuración
- `backend/src/main/resources/application.yml` es la base común y usa variables de entorno con fallback a localhost.
- `backend/src/main/resources/application-dev.yml` se usa con `SPRING_PROFILES_ACTIVE=dev` y el script local carga `backend/.env.local`.
- `backend/src/main/resources/application-prod.yml` mantiene el perfil de producción con validación estricta y Flyway activo.

### Backend local actual
- `start-backend.ps1` y `start-backend.bat` cargan `backend/.env.local` antes de arrancar.
- Ese archivo apunta a Supabase con `DATABASE_URL`, `DATABASE_USER` y `DATABASE_PASSWORD`.
- El backend local corre con perfil `dev` y por eso usa la base de datos remota de Supabase, no una base local de PostgreSQL.

### Frontend local actual
- `src/lib/runtimeConfig.ts` fuerza `http://localhost:8080/api` cuando el hostname es local.
- `public/config.development.json` sigue apuntando al entorno dev remoto.
- `public/config.json` sigue apuntando al entorno prod remoto.

---

**Analizado por:** Sistema de análisis automático  
**Confianza del análisis:** 95%

# 🚀 TURNOW API - Setup Local + API Remota

**Opción 1 - API Remota (RECOMENDADO para desarrollo local):**
- Frontend: `http://localhost:3000` (tu máquina)
- API: `https://apidev-turnow.shiftya.online` (Fly.io)

**Opción 2 - Todo local:**
- Frontend: `http://localhost:3000` (tu máquina)
- API: `http://localhost:8080` (Spring Boot local)

---

## ✅ Setup: Frontend Local + API Remota

### Paso 1: Configurar URL de API en el Frontend

En tu proyecto React/Vite, crea o actualiza el archivo `.env.local`:

```env
VITE_API_BASE_URL=https://apidev-turnow.shiftya.online
```

### Paso 2: Usar la URL en tu código

En tu código React (por ejemplo, en un archivo de configuración):

```javascript
// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = {
  login: (email, password) =>
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),
  
  getTenantOverview: (tenantId, token) =>
    fetch(`${API_BASE_URL}/api/admin/tenant/${tenantId}/overview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),
  // ... más endpoints
};
```

O si usas Axios:

```javascript
// src/config/axios.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Paso 3: Levantar el frontend

```bash
npm run dev
# O con Vite:
vite
```

Se abrirá en `http://localhost:3000` (o el puerto que uses)

---

## ✅ Testear conexión

### Test 1: Verificar CORS funciona

```bash
curl -H "Origin: http://localhost:3000" \
  https://apidev-turnow.shiftya.online/api/health
```

Debe responder: `"OK"` sin errores CORS

### Test 2: Login desde local

```bash
curl -X POST http://localhost:3000/api/proxy/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

O directamente desde tu navegador (console):

```javascript
fetch('https://apidev-turnow.shiftya.online/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'password123' 
  })
})
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.error(e))
```

---

## 📋 Todos los Endpoints (usa https://apidev-turnow.shiftya.online)

### 1️⃣ Health Check
```bash
curl https://apidev-turnow.shiftya.online/api/health
```

### 2️⃣ Login
```bash
curl -X POST https://apidev-turnow.shiftya.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3️⃣ Public Booking (sin autenticación)

```bash
# Obtener info del negocio
curl https://apidev-turnow.shiftya.online/api/public/tenant/{slug}

# Listar servicios
curl https://apidev-turnow.shiftya.online/api/public/tenant/{slug}/services

# Listar profesionales
curl https://apidev-turnow.shiftya.online/api/public/tenant/{slug}/professionals

# Obtener horarios disponibles
curl "https://apidev-turnow.shiftya.online/api/public/tenant/{slug}/slots?date=2026-05-10&professionalId={id}&serviceId={id}"

# Crear cita
curl -X POST https://apidev-turnow.shiftya.online/api/public/tenant/{slug}/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "uuid",
    "serviceId": "uuid",
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "clientPhone": "+54111234567",
    "appointmentDate": "2026-05-10",
    "startTime": "09:00",
    "clientNotes": "Primera vez"
  }'

# Cancelar cita
curl -X POST https://apidev-turnow.shiftya.online/api/public/appointments/cancel/{token}
```

### 4️⃣ Admin Tenant (con autenticación)

```bash
# Dashboard
curl -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/overview

# Citas
curl -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/appointments

# Profesionales
curl -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/professionals

# Crear profesional
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+54111234567",
    "speciality": "Cardiología",
    "active": true
  }' \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/professionals

# Actualizar profesional
curl -X PUT -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/professionals/{professionalId}

# Eliminar profesional
curl -X DELETE -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/professionals/{professionalId}

# Servicios
curl -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/services

# Crear servicio
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consulta Médica",
    "description": "Consulta general",
    "duration": 30,
    "price": 500.0,
    "active": true
  }' \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/services

# Actualizar servicio
curl -X PUT -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/services/{serviceId}

# Eliminar servicio
curl -X DELETE -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/services/{serviceId}

# Configuración
curl -X PUT -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Mi Negocio",
    "email": "admin@negocio.com",
    "phone": "+54111234567",
    "address": "Calle 123",
    "slug": "my-slug",
    "primaryColor": "#6366f1"
  }' \
  https://apidev-turnow.shiftya.online/api/admin/tenant/{tenantId}/settings
```

### 5️⃣ Super Admin (con autenticación)

```bash
# Dashboard global
curl -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/super/overview

# Listar negocios
curl -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/super/tenants

# Crear negocio
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Negocio",
    "slug": "nuevo-negocio",
    "email": "admin@nuevo.com",
    "phone": "+54111234567",
    "address": "Calle 123",
    "plan": "PROFESSIONAL"
  }' \
  https://apidev-turnow.shiftya.online/api/admin/super/tenants

# Cambiar estado
curl -X PATCH -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "SUSPENDED"}' \
  https://apidev-turnow.shiftya.online/api/admin/super/tenants/{tenantId}/status

# Eliminar negocio
curl -X DELETE -H "Authorization: Bearer {token}" \
  https://apidev-turnow.shiftya.online/api/admin/super/tenants/{tenantId}
```

---

## 💡 Tips Útiles

### Guardar token para reutilizar
```bash
TOKEN=$(curl -s -X POST https://apidev-turnow.shiftya.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' | jq -r '.token')

# Luego úsalo en otras peticiones
curl -H "Authorization: Bearer $TOKEN" \
  https://apidev-turnow.shiftya.online/api/admin/super/overview
```

### Ver JSON formateado (requiere jq)
```bash
curl https://apidev-turnow.shiftya.online/api/admin/super/overview | jq .
```

### Ver headers de respuesta
```bash
curl -i https://apidev-turnow.shiftya.online/api/health
```

### Guardar respuesta en archivo
```bash
curl https://apidev-turnow.shiftya.online/api/admin/super/overview > response.json
```

---

## 🔐 Autenticación

Todos los endpoints de `/admin/*` requieren token JWT:

```
Authorization: Bearer {token_jwt}
```

Obtén el token con `/auth/login`

---

## ✅ Resumen Rápido

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/health` | GET | ❌ | Verificar salud |
| `/auth/login` | POST | ❌ | Login |
| `/public/tenant/{slug}` | GET | ❌ | Info negocio |
| `/public/tenant/{slug}/services` | GET | ❌ | Servicios |
| `/public/tenant/{slug}/professionals` | GET | ❌ | Profesionales |
| `/public/tenant/{slug}/slots` | GET | ❌ | Horarios |
| `/public/tenant/{slug}/appointments` | POST | ❌ | Crear cita |
| `/admin/tenant/{id}/overview` | GET | ✅ | Dashboard |
| `/admin/tenant/{id}/professionals` | GET/POST/PUT/DELETE | ✅ | Gestionar |
| `/admin/tenant/{id}/services` | GET/POST/PUT/DELETE | ✅ | Gestionar |
| `/admin/super/overview` | GET | ✅ | Stats global |
| `/admin/super/tenants` | GET/POST/PATCH/DELETE | ✅ | Gestionar |

---

## 🚀 Próximos pasos

1. Configura `.env.local` en tu frontend con la URL remota
2. Levanta el frontend local con `npm run dev`
3. Prueba login desde la app
4. Verifica que CORS funcione (no debería haber errores en console)
5. ¡Desarrolla!

**API remota:** `https://apidev-turnow.shiftya.online`  
**Frontend local:** `http://localhost:3000`  
**Status:** ✅ Funcionando

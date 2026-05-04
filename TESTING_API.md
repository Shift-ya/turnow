# 🚀 TURNOW API - Testing Guide

**API está LIVE en:** `https://dev-turnow.fly.dev/api`

---

## ✅ Verificar que API funciona (rápido)

```bash
curl https://dev-turnow.fly.dev/api/health
# Respuesta: "OK"
```

---

## 📋 Todos los Endpoints

### 1️⃣ Health Check (sin autenticación)
```bash
curl https://dev-turnow.fly.dev/api/health
curl https://dev-turnow.fly.dev/api/health/live
```

### 2️⃣ Login
```bash
curl -X POST https://dev-turnow.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```
**Respuesta:** Token JWT + datos del usuario

### 3️⃣ Public Booking (sin autenticación - para clientes)

#### Obtener info del negocio
```bash
curl https://dev-turnow.fly.dev/api/public/tenant/{slug}
```

#### Listar servicios
```bash
curl https://dev-turnow.fly.dev/api/public/tenant/{slug}/services
```

#### Listar profesionales
```bash
curl https://dev-turnow.fly.dev/api/public/tenant/{slug}/professionals
```

#### Obtener horarios disponibles
```bash
curl "https://dev-turnow.fly.dev/api/public/tenant/{slug}/slots?date=2026-05-10&professionalId={id}&serviceId={id}"
```

#### Crear cita
```bash
curl -X POST https://dev-turnow.fly.dev/api/public/tenant/{slug}/appointments \
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
```

#### Cancelar cita
```bash
curl -X POST https://dev-turnow.fly.dev/api/public/appointments/cancel/{token}
```

---

## 4️⃣ Admin Tenant (con autenticación - dueño del negocio)

### Dashboard
```bash
curl -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/overview
```

### Citas
```bash
curl -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/appointments

# Con fecha específica
curl -H "Authorization: Bearer {token}" \
  "https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/appointments?date=2026-05-10"
```

### Profesionales
```bash
# Listar
curl -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/professionals

# Crear
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
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/professionals

# Actualizar
curl -X PUT -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "+54111234567",
    "speciality": "Cardiología",
    "active": true
  }' \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/professionals/{professionalId}

# Eliminar
curl -X DELETE -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/professionals/{professionalId}
```

### Servicios
```bash
# Listar
curl -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/services

# Crear
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consulta Médica",
    "description": "Consulta general",
    "duration": 30,
    "price": 500.0,
    "active": true
  }' \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/services

# Actualizar
curl -X PUT -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consulta Médica",
    "description": "Consulta general actualizada",
    "duration": 45,
    "price": 600.0,
    "active": true
  }' \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/services/{serviceId}

# Eliminar
curl -X DELETE -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/services/{serviceId}
```

### Configuración
```bash
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
  https://dev-turnow.fly.dev/api/admin/tenant/{tenantId}/settings
```

---

## 5️⃣ Super Admin (con autenticación - administrador de plataforma)

### Dashboard global
```bash
curl -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/super/overview
```

### Listar negocios
```bash
curl -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/super/tenants

# Con búsqueda
curl -H "Authorization: Bearer {token}" \
  "https://dev-turnow.fly.dev/api/admin/super/tenants?search=keyword"
```

### Crear negocio
```bash
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
  https://dev-turnow.fly.dev/api/admin/super/tenants
```

### Cambiar estado
```bash
curl -X PATCH -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "SUSPENDED"}' \
  https://dev-turnow.fly.dev/api/admin/super/tenants/{tenantId}/status
```

### Eliminar negocio
```bash
curl -X DELETE -H "Authorization: Bearer {token}" \
  https://dev-turnow.fly.dev/api/admin/super/tenants/{tenantId}
```

---

## 💡 Tips Útiles

### Guardar token para reutilizar
```bash
TOKEN=$(curl -s -X POST https://dev-turnow.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' | jq -r '.token')

# Luego úsalo en otras peticiones
curl -H "Authorization: Bearer $TOKEN" \
  https://dev-turnow.fly.dev/api/admin/super/overview
```

### Ver JSON formateado (requiere jq)
```bash
curl https://dev-turnow.fly.dev/api/admin/super/overview | jq .
```

### Ver headers de respuesta
```bash
curl -i https://dev-turnow.fly.dev/api/health
```

### Guardar respuesta en archivo
```bash
curl https://dev-turnow.fly.dev/api/admin/super/overview > response.json
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

**API Live:** `https://dev-turnow.fly.dev/api`  
**Status:** ✅ Funcionando  
**Total Endpoints:** 30+

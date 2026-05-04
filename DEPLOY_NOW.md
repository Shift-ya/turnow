# 🚀 Deploy en 3 Pasos

## ✅ El cambio ya está hecho

✓ CORS actualizado en `application-prod.yml`  
✓ Commit hecho y pushed  
✓ Listo para desplegar  

---

## 3️⃣ Pasos para Desplegar

### Paso 1: Abre una terminal en tu proyecto

```bash
cd c:\Users\dante\Documents\turnow.worktrees\copilot-worktree-2026-05-04T17-09-54\backend
```

### Paso 2: Deploy a Fly.io

```bash
flyctl deploy -a dev-turnow
```

Esto va a:
- Descargar tu código de GitHub
- Compilar el backend Java
- Crear imagen Docker
- Desplegar a Fly.io
- Ejecutar health checks

**Tiempo:** ~10-15 minutos

### Paso 3: Verificar que funciona

```bash
# Test 1: Health check
curl https://apidev-turnow.shiftya.online/api/health
# Debe responder: "OK"

# Test 2: CORS desde localhost
curl -H "Origin: http://localhost:3000" \
  https://apidev-turnow.shiftya.online/api/health
# Debe responder: "OK" sin errores CORS
```

---

## 🎯 Ahora en tu Frontend

### 1. Crea `.env.local`

En la raíz de tu proyecto frontend:

```env
VITE_API_BASE_URL=https://apidev-turnow.shiftya.online
```

### 2. Usa en tu código

```javascript
const API = import.meta.env.VITE_API_BASE_URL;

// Login
const response = await fetch(`${API}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### 3. Levanta el frontend

```bash
npm run dev
```

Se abrirá en `http://localhost:3000`

---

## ✨ ¡Listo!

Ya puedes:
- ✅ Correr el frontend en local
- ✅ Conectarte a la API remota en Fly.io
- ✅ Loguearte y usar todos los endpoints
- ✅ Desarrollar sin problemas de CORS

**API remota:** `https://apidev-turnow.shiftya.online`  
**Frontend local:** `http://localhost:3000`  

🚀 **Happy coding!**

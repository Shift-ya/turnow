# ✅ CORS Fix Aplicado - Ready to Deploy

## 🎯 Lo que se cambió

**Archivo:** `backend/src/main/resources/application-prod.yml`

```diff
  cors:
-   allowed-origins: ${CORS_ORIGINS:http://localhost:5173}
+   allowed-origins: ${CORS_ORIGINS:http://localhost:5173,http://localhost:3000}
```

**Commit:** `chore: add localhost:3000 to CORS allowed origins for local frontend development`  
**Status:** ✅ Committed y pushed a GitHub

---

## 🚀 Cómo Desplegar

### Opción 1: Con Bash (Linux/Mac/Git Bash)
```bash
cd c:\Users\dante\Documents\turnow.worktrees\copilot-worktree-2026-05-04T17-09-54
bash deploy.sh
```

### Opción 2: Con el CLI de Fly.io
```bash
cd c:\Users\dante\Documents\turnow.worktrees\copilot-worktree-2026-05-04T17-09-54\backend
flyctl deploy -a dev-turnow
```

### Opción 3: Web UI de Fly.io
1. Abre https://fly.io/apps
2. Selecciona `dev-turnow`
3. Los cambios se detectarán automáticamente desde GitHub

---

## ⏱️ Tiempo de Deployment

- **Build:** 5-10 minutos (compilar Java, crear imagen Docker)
- **Deploy:** 2-3 minutos (push a registry, restart machine)
- **Total:** ~10-15 minutos

---

## ✅ Verificar que funciona

### Inmediatamente después del deploy:
```bash
# Test 1: Verificar health
curl https://apidev-turnow.shiftya.online/api/health

# Test 2: Verificar CORS desde localhost
curl -H "Origin: http://localhost:3000" \
  https://apidev-turnow.shiftya.online/api/health

# Test 3: Probar login desde navegador (F12 Console)
fetch('https://apidev-turnow.shiftya.online/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'test@example.com', 
    password: 'password123' 
  })
})
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.error(e))
```

---

## 🎯 Para Usar en Local

### 1. Crear `.env.local` en tu frontend

```env
VITE_API_BASE_URL=https://apidev-turnow.shiftya.online
```

### 2. Actualizar tu código React

```javascript
// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const login = (email, password) =>
  fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());
```

### 3. Levantar el frontend

```bash
npm install
npm run dev
```

Se abrirá en `http://localhost:3000` y podrás usar la API remota.

---

## 📋 Resumen de Archivos

| Archivo | Propósito |
|---------|-----------|
| `TESTING_API.md` | Guía completa de endpoints con ejemplos |
| `DEPLOYMENT_GUIDE.md` | Instrucciones detalladas de deployment |
| `deploy.sh` | Script automático para deployment |

---

## 🐛 Si algo falla

### Logs del deployment
```bash
flyctl logs -a dev-turnow
```

### Ver estado de la máquina
```bash
flyctl status -a dev-turnow
```

### Revertir cambios
```bash
git revert HEAD
git push
flyctl deploy -a dev-turnow
```

---

## 💡 Pro Tips

**Guardá el token para testing:**
```bash
TOKEN=$(curl -s -X POST https://apidev-turnow.shiftya.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' | jq -r '.token')

echo $TOKEN
```

**Ver logs en tiempo real:**
```bash
flyctl logs -a dev-turnow --follow
```

**SSH a la máquina de Fly.io:**
```bash
flyctl ssh console -a dev-turnow
```

---

## ✨ Ready!

- ✅ Cambios aplicados
- ✅ Git commit & push hecho
- ✅ Listo para hacer deploy

**Próximo paso:** Ejecuta el deploy con `flyctl deploy -a dev-turnow` desde tu terminal 🚀

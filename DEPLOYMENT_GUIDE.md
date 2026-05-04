# 🚀 Guía de Deployment - CORS Fix

## ✅ Cambios Realizados

He actualizado el archivo `backend/src/main/resources/application-prod.yml`:

**Antes:**
```yaml
cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:5173}
```

**Después:**
```yaml
cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:5173,http://localhost:3000}
```

Esto permite que el frontend local en `http://localhost:3000` (o `http://localhost:5173` para Vite) pueda hacer requests a la API remota sin problemas de CORS.

---

## 📋 Pasos para Desplegar

### Opción 1: Desplegar desde tu máquina (Windows)

#### Paso 1: Hacer commit de los cambios
```bash
cd c:\Users\dante\Documents\turnow.worktrees\copilot-worktree-2026-05-04T17-09-54

git add backend/src/main/resources/application-prod.yml
git commit -m "chore: add localhost:3000 to CORS allowed origins for local frontend development"
git push
```

#### Paso 2: Build con Maven
```bash
cd backend
mvn clean package -DskipTests
```

Esto va a:
- Compilar el código Java
- Crear el JAR en `backend/target/app.jar`
- Tomar ~5-10 minutos

Si falla, verás el error. Si todo OK, verás:
```
BUILD SUCCESS
```

#### Paso 3: Build Docker image
```bash
docker build -t dev-turnow:latest .
```

#### Paso 4: Login a Fly.io y Desplegar
```bash
flyctl auth login
# Luego deploy
flyctl deploy -a dev-turnow
```

---

### Opción 2: Desplegar directamente con Fly.io (más simple)

Si tienes Fly CLI instalado:

```bash
cd c:\Users\dante\Documents\turnow.worktrees\copilot-worktree-2026-05-04T17-09-54\backend

# Make commit
git add src/main/resources/application-prod.yml
git commit -m "chore: add localhost:3000 to CORS allowed origins"
git push

# Deploy
flyctl deploy -a dev-turnow
```

Fly.io va a:
1. Detectar los cambios
2. Compilar automáticamente
3. Crear imagen Docker
4. Desplegar a producción
5. Ejecutar health checks

---

## ⚠️ Importante: Variable de Entorno en Fly.io

Para que CORS funcione correctamente en **producción**, debes asegurar que en Fly.io esté seteada esta variable de entorno:

```bash
flyctl secrets set CORS_ORIGINS="https://apidev-turnow.shiftya.online,http://localhost:3000,http://localhost:5173"
```

Pero en realidad, con el valor default que puse (`http://localhost:5173,http://localhost:3000`), debería funcionar para desarrollo local.

Para que funcione desde cualquier dominio de producción, actualiza la variable:

```bash
flyctl secrets set CORS_ORIGINS="https://apidev-turnow.shiftya.online,https://app.turnow.com"
```

---

## ✅ Verificar que funciona

### Test 1: Verificar CORS desde tu máquina
```bash
curl -H "Origin: http://localhost:3000" \
  https://apidev-turnow.shiftya.online/api/health
```

Debe responder `"OK"` sin errores CORS.

### Test 2: Desde el navegador (F12 Console)
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
  .then(data => console.log('Success:', data))
  .catch(e => console.error('Error:', e))
```

Si ves en console `Success: {...}` significa que CORS funciona ✅

---

## 🐛 Troubleshooting

### Error: "Access to XMLHttpRequest blocked by CORS policy"
- Asegúrate de que `http://localhost:3000` está en `CORS_ORIGINS`
- Verifica que el frontend envía `Origin: http://localhost:3000`
- Reinicia el servidor después de cambiar CORS_ORIGINS

### Error: "Connection refused"
- Verifica que el API está up: `curl https://apidev-turnow.shiftya.online/api/health`
- Usa HTTPS (no HTTP)

### Cambios no se reflejan
- Debes hacer **commit y push** de los cambios
- Luego hacer **deploy** a Fly.io
- Fly.io rebuildeará automáticamente

---

## 📝 Resumen de qué se cambió

| Archivo | Cambio |
|---------|--------|
| `backend/src/main/resources/application-prod.yml` | Agregué `http://localhost:3000` a CORS allowed origins |

**Total cambios:** 1 línea modificada

---

## 🚀 Próximos pasos después del deploy

1. **Hacer commit y push** de los cambios
2. **Deploy a Fly.io** con `flyctl deploy -a dev-turnow`
3. **Levantar frontend local** con `npm run dev`
4. **Configurar `.env.local`** en el frontend:
   ```env
   VITE_API_BASE_URL=https://apidev-turnow.shiftya.online
   ```
5. **Probar login** desde el navegador
6. **Verificar CORS** en DevTools (no debe haber errores)

---

**¿Listo para desplegar?** 🚀

# 🚀 Checklist de Deploy a Producción

## Antes de hacer merge a main:

### ✅ Configuración de Frontend
- [ ] `packages/web-app/.env` tiene `VITE_API_URL=https://bc-16wt.onrender.com`
- [ ] No hay imports de debug temporales
- [ ] No hay console.logs de desarrollo

### ✅ Configuración de Backend  
- [ ] `packages/backend/.env` tiene la DATABASE_URL correcta de Neon
- [ ] Variables de producción configuradas (JWT_SECRET, etc.)
- [ ] No hay configuraciones de desarrollo hardcodeadas

### ✅ Código
- [ ] Tests pasan (si los tienes)
- [ ] No hay archivos temporales o de debug
- [ ] Imports y exports están limpios
- [ ] No hay dependencias de desarrollo en producción

### ✅ Deploy
- [ ] Backend en Render tiene las variables de entorno actualizadas
- [ ] Frontend en Vercel se desplegará automáticamente
- [ ] Base de datos Neon está accesible

### ✅ Post-Deploy
- [ ] Verificar health check: https://bc-16wt.onrender.com/health  
- [ ] Probar login con: admin@beautycontrol.com / AdminPassword123!
- [ ] Verificar que la webapp carga correctamente

## Comandos útiles:
```bash
# Verificar diferencias antes del merge
git diff main..development

# Ver archivos que cambiarán
git diff --name-only main..development

# Verificar configuración actual
grep -r "VITE_API_URL" packages/web-app/
grep -r "DATABASE_URL" packages/backend/
```
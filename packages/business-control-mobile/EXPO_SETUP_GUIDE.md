# 📱 Guía de Configuración Expo - Business Control Mobile

## ✅ Cambios Realizados

### 1. **api.js** - Mejorada la detección de entorno
- ✅ Prioriza `EXPO_PUBLIC_API_URL` en React Native
- ✅ Fallback a IP local si no está definido
- ✅ Log de debug para verificar configuración

### 2. **.env en shared** - Limpiado y documentado
- ✅ Eliminadas URLs duplicadas
- ✅ Comentarios claros para desarrollo/producción
- ✅ Variables correctamente formateadas

### 3. **Archivos .env nuevos en business-control-mobile**
- ✅ `.env.development` - Para desarrollo local
- ✅ `.env.production` - Para builds de producción

## 🚀 Cómo Usar

### Desarrollo Local (con backend en tu PC):

1. **Verifica que el backend esté corriendo:**
   ```bash
   cd packages/backend
   npm start
   # Debe estar en http://192.168.0.213:3001
   ```

2. **Inicia Expo en modo desarrollo:**
   ```bash
   cd packages/business-control-mobile
   npx expo start
   ```

3. **En la consola de Expo deberías ver:**
   ```
   🔧 API Configuration: {
     BASE_URL: 'http://192.168.0.213:3001',
     isReactNative: true,
     EXPO_PUBLIC_API_URL: 'http://192.168.0.213:3001'
   }
   ```

### Si aún tienes error de red:

#### Opción 1: Verificar IP
```bash
# En Windows:
ipconfig
# Busca "IPv4 Address" de tu adaptador de red activo

# Actualiza en .env.development si cambió tu IP:
EXPO_PUBLIC_API_URL=http://TU_IP_AQUI:3001
```

#### Opción 2: Verificar firewall
- Windows Defender puede estar bloqueando el puerto 3001
- Agrega una excepción para Node.js

#### Opción 3: Probar con ngrok (túnel público)
```bash
# Instalar ngrok
npm install -g ngrok

# Crear túnel al backend
ngrok http 3001

# Usar la URL de ngrok en .env.development
EXPO_PUBLIC_API_URL=https://abc123.ngrok.io
```

## 🔍 Debug

### Ver qué URL está usando la app:
Abre la app en el simulador/dispositivo y verifica los logs en la consola de Expo. Deberías ver el log de configuración al inicio.

### Verificar que el backend esté accesible:
```bash
# Desde tu PC:
curl http://192.168.0.213:3001/health

# Desde otro dispositivo en la misma red:
curl http://192.168.0.213:3001/health
```

## 📝 Notas Adicionales

### Para el Calendario del Especialista:
- ⏰ Recordatorio de consentimientos pendientes
- ✅ Estado de consentimientos firmados
- ⚠️ Alerta antes de completar cita sin consentimiento

### Próximas Features Sugeridas:
1. Vista especializada para especialistas en móvil
2. Check-in de citas desde el móvil
3. Captura de fotos antes/después
4. Firma digital de consentimientos
5. Notificaciones push para recordatorios

## 🆘 Errores Comunes

### "Network request failed"
- Verifica que estés en la misma red WiFi que tu PC
- Revisa que el backend esté corriendo
- Prueba acceder a http://192.168.0.213:3001/health desde el navegador del celular

### "EXPO_PUBLIC_API_URL is undefined"
- Reinicia el servidor de Expo después de cambiar .env
- Asegúrate de que el archivo .env.development exista
- Verifica que no haya espacios extra en las variables

### Variables de entorno no se actualizan
```bash
# Limpia cache y reinicia:
npx expo start --clear
```

## 📞 Contacto

Cuando vuelvas, podemos:
1. Verificar la configuración de red
2. Testear la app en tu dispositivo
3. Implementar la vista del especialista
4. Agregar recordatorios de consentimientos

¡Descansa bien! 💪

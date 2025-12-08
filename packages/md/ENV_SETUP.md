# Configuración de Variables de Entorno para Desarrollo

## Para Desarrolladores

Cada desarrollador debe configurar su propia IP local para que la aplicación móvil (React Native) pueda conectarse al backend en desarrollo.

## Configuración Inicial

### 1. Encuentra tu IP local

**Windows:**
```bash
ipconfig
```
Busca "Dirección IPv4" en tu adaptador de red activo (WiFi o Ethernet)

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Linux:**
```bash
hostname -I | awk '{print $1}'
```

### 2. Configura la variable de entorno

**Para la app móvil (`packages/mobile-app`):**

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp packages/mobile-app/.env.example packages/mobile-app/.env
   ```

2. Edita `packages/mobile-app/.env` y reemplaza `YOUR_IP_HERE` con tu IP:
   ```
   EXPO_PUBLIC_LOCAL_IP=192.168.1.15
   ```

**Para el paquete shared (`packages/shared`):**

1. Ya existe `.env`, solo actualiza la IP:
   ```
   EXPO_PUBLIC_LOCAL_IP=192.168.1.15
   ```

### 3. Reinicia el servidor de Expo

Después de cambiar las variables de entorno:

```bash
# Detén Expo (Ctrl+C)
# Limpia cache
npm start --clear

# O con expo
expo start -c
```

## Notas Importantes

- ⚠️ **NO comitees** tu archivo `.env` con tu IP personal
- ✅ Los archivos `.env` están en `.gitignore`
- ✅ Solo commitea cambios en `.env.example`
- 🔄 Si cambias de red WiFi, necesitarás actualizar tu IP
- 📱 Asegúrate de que tu dispositivo móvil y tu PC estén en la misma red

## Estructura de Archivos

```
packages/
  mobile-app/
    .env              # Tu configuración personal (NO commitear)
    .env.example      # Template para otros devs (SÍ commitear)
  shared/
    .env              # Configuración compartida (actualiza IP)
    .env.example      # Template (SÍ commitear)
```

## Troubleshooting

### La app móvil no se conecta al backend

1. Verifica que tu IP es correcta
2. Asegúrate de estar en la misma red WiFi
3. Reinicia Expo con cache limpio: `npm start --clear`
4. Verifica que el backend está corriendo en el puerto 3001

### Error "Network request failed"

- Verifica firewall de Windows/Mac
- Asegúrate de que el puerto 3001 esté abierto
- Prueba desde el navegador: `http://TU_IP:3001/health`

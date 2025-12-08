# Guía de Deployment - Business Control Mobile

## 📱 Configuración Inicial

### 1. Instalar EAS CLI globalmente
```bash
npm install -g eas-cli
```

### 2. Login en Expo
```bash
eas login
```

### 3. Configurar el proyecto
```bash
cd packages/business-control-mobile
eas build:configure
```

Esto creará/actualizará `eas.json` y te pedirá crear un proyecto en Expo si no existe.

**Importante:** Copia el `projectId` que te dan y pégalo en `app.json` → `expo.extra.eas.projectId`

---

## 🔨 Builds

### Development Build (Para testing interno)
```bash
# Android APK
eas build --profile development --platform android

# iOS Simulator
eas build --profile development --platform ios
```

### Preview Build (Testing con staging)
```bash
# Android APK
eas build --profile preview --platform android

# iOS Simulator
eas build --profile preview --platform ios
```

### Production Build (Para tiendas)
```bash
# Android App Bundle (Google Play)
eas build --profile production --platform android

# iOS (App Store)
eas build --profile production --platform ios

# Ambas plataformas
eas build --profile production --platform all
```

---

## 📤 Submit a Tiendas

### Android (Google Play Console)

#### Prerequisitos:
1. Crear una cuenta de desarrollador en [Google Play Console](https://play.google.com/console)
2. Crear la app en Google Play Console
3. Descargar el Service Account JSON:
   - Ve a Google Cloud Console → IAM & Admin → Service Accounts
   - Crea un Service Account
   - Descarga la clave JSON
   - Guárdala como `google-service-account.json` en la raíz del proyecto

#### Submit:
```bash
eas submit --platform android --latest
```

O especifica un build:
```bash
eas submit --platform android --id YOUR_BUILD_ID
```

### iOS (App Store Connect / TestFlight)

#### Prerequisitos:
1. Cuenta de Apple Developer ($99/año)
2. Crear el App ID en [Apple Developer Portal](https://developer.apple.com)
3. Crear la app en [App Store Connect](https://appstoreconnect.apple.com)
4. Tener tu Apple ID, Team ID y ASC App ID

#### Submit:
```bash
eas submit --platform ios --latest
```

O con credenciales específicas:
```bash
eas submit --platform ios \
  --apple-id tu-email@ejemplo.com \
  --asc-app-id TU_ASC_APP_ID \
  --apple-team-id TU_TEAM_ID
```

---

## 🧪 Testing

### Internal Testing (Android)

1. Build con perfil `preview` o `production`
2. Submit a Google Play Console en track "Internal Testing"
3. Agrega testers por email en Google Play Console
4. Los testers recibirán un link para descargar

### TestFlight (iOS)

1. Build con perfil `production`
2. Submit a App Store Connect
3. El build aparecerá en TestFlight automáticamente
4. Agrega testers internos o externos
5. Los testers recibirán notificación en la app TestFlight

---

## 🔄 Actualizar una Build

### Incrementar versión

Edita `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Versión de marketing
    "android": {
      "versionCode": 2    // Incrementa en cada build
    },
    "ios": {
      "buildNumber": "1.0.1"  // Incrementa en cada build
    }
  }
}
```

Luego haz un nuevo build:
```bash
eas build --profile production --platform all
```

---

## 🌍 Entornos

El archivo `src/config/env.js` maneja 3 entornos:

- **dev**: Desarrollo local (tu IP: `192.168.0.213`)
- **staging**: Testing con servidores en la nube
- **prod**: Producción

El entorno se selecciona automáticamente según el perfil de build:
- `development` → `dev`
- `preview` → `staging`
- `production` → `prod`

---

## 🔑 Credenciales

EAS maneja automáticamente:
- Keystores de Android
- Certificados y Provisioning Profiles de iOS

No necesitas configurarlos manualmente. EAS los crea y almacena de forma segura.

---

## 📊 Monitoreo de Builds

### Ver builds en proceso
```bash
eas build:list
```

### Ver detalles de un build
```bash
eas build:view BUILD_ID
```

### Cancelar un build
```bash
eas build:cancel BUILD_ID
```

---

## 🐛 Troubleshooting

### Build falla por dependencias nativas
```bash
# Regenera los módulos nativos
npx expo prebuild --clean
```

### Build falla por caché
```bash
# Limpia la caché de EAS
eas build --clear-cache --profile production --platform android
```

### Error de versión duplicada en Google Play
- Incrementa `android.versionCode` en `app.json`
- Haz un nuevo build

### Error de certificado en iOS
```bash
# Regenera los certificados
eas credentials
# Selecciona iOS → Manage credentials → Reset
```

---

## 📱 URLs Configuradas

### Desarrollo
- API: `http://192.168.0.213:3001`
- Web: `http://192.168.0.213:3000`

### Producción
- API: `https://bc-16wt.onrender.com`
- Web: `https://www.controldenegocios.com`

---

## ⚡ Comandos Rápidos

```bash
# Build de desarrollo para Android
eas build -p android --profile development

# Build de producción para ambas plataformas
eas build -p all --profile production

# Submit último build de Android
eas submit -p android --latest

# Submit último build de iOS
eas submit -p ios --latest

# Ver estado de builds
eas build:list --status in-progress

# Descargar un build
eas build:download BUILD_ID
```

---

## 📝 Notas Importantes

1. **Primera vez**: La primera build puede tardar 15-30 minutos
2. **Builds siguientes**: Tardan ~10-15 minutos
3. **Límite gratuito**: Expo tiene límites en el plan gratuito
4. **Cambios nativos**: Si agregas/modificas plugins o dependencias nativas, haz un nuevo build
5. **OTA Updates**: Para cambios solo en JS, usa `expo-updates` (no configurado aún)

---

## 🎯 Próximos Pasos

1. Ejecutar `eas build:configure` para obtener el projectId
2. Actualizar `app.json` con el projectId
3. Hacer tu primer build de development
4. Probar la app en tu dispositivo
5. Cuando esté listo, hacer build de production
6. Submit a las tiendas

# Business Control Mobile

Mobile client for the Business Control platform, built with Expo SDK 54 and wired to the shared monorepo authentication logic.

## Prerequisites

- Node.js 20 (Expo CLI requires at least 20.16.0 for Metro 0.83; consider using the LTS 20.18+ release)
- Expo CLI (`npm install -g expo-cli`) or `npx expo`
- Backend API running locally at `http://localhost:3001` (or update `EXPO_PUBLIC_API_URL`)
- Access to the shared workspace so the `@bc/shared` package resolves correctly

## Installation

```bash
cd packages/business-control-mobile
npm install
```

If you previously installed dependencies before this update, clear the cache to ensure Metro picks up the new symlinked package:

```bash
npx expo start --clear
```

## Running the app

1. Start the backend API (`npm run dev` in `packages/backend`).
2. From `packages/business-control-mobile`, run one of the following commands to start Expo **with bridgeless desactivado**:

   ```bash
   # Usando el script con cross-env (recomendado)
   npm run start -- --clear

   # O declarando la variable manualmente en bash
   EXPO_USE_EXPERIMENTAL_BRIDGELESS=0 npx expo start --clear

   # O declarando la variable manualmente en PowerShell
   $env:EXPO_USE_EXPERIMENTAL_BRIDGELESS = "0"
   npx expo start --clear
   ```

   - Si Expo te informa que el puerto 8081 está ocupado, acepta usar el puerto alternativo (`yes`).
   - Asegúrate de que no queden procesos viejos de Metro/Expo abiertos.

3. Antes de abrir la app, desactiva **Enable New Architecture** y **Use Turbo Modules** desde el menú de _Developer Settings_ de Expo Go o del simulador, para obligar el bridge clásico.
4. Abre Expo Go (o el emulador) y escanea el QR. En la consola deberías ver `Bridgeless mode: false`; si aparece `true`, revisa los pasos anteriores.
5. Si la consola muestra nuevamente el error `PlatformConstants`, borra `.expo` y `.expo-shared`, repite el comando con `--clear`, y confirma que el dispositivo no mantenga activa la arquitectura nueva.

## Test credentials

Use the seeded "salon-prueba" business data (see root `TEST_DATA.md`) or the quick selectors in the login screen.  Each role button pre-fills the credential pair:

| Role | Email | Password |
| --- | --- | --- |
| Business owner | `owner@salon-prueba.com` | `Owner123!` |
| Specialist | `specialist@salon-prueba.com` | `Specialist123!` |
| Receptionist | `receptionist@salon-prueba.com` | `Reception123!` |

You can toggle the "Recordar correo" switch to persist the email address securely in AsyncStorage.

## How it works

- Reuses the Redux Toolkit store from `@bc/shared/src/store/reactNativeStore.js` to dispatch the `loginUserRN` thunk and persist tokens in AsyncStorage.
- Pulls the shared permission and role definitions to render role-specific dashboards.
- Clears authentication tokens via shared storage helpers on logout.

## Troubleshooting

- **Invalid hook call / duplicate React**: make sure the Metro config continues to resolve React from `packages/business-control-mobile/node_modules` only.
- **Network errors**: confirm the backend is reachable at `http://localhost:3001` from your device/emulator, or adjust the API URL in `packages/shared/src/constants/api.js`.
- **Node engine warnings**: Expo SDK 54 bundles Metro 0.83, which expects Node 20.19+. Upgrade Node if you encounter engine mismatch messages during install.

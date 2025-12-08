#!/bin/bash
# Workaround para el problema de permisos de EAS en Windows con la carpeta assets

echo "🔧 Aplicando workaround para build..."

# Renombrar assets temporalmente
if [ -d "assets" ]; then
  echo "📦 Renombrando assets/ -> _assets_temp/"
  mv assets _assets_temp
fi

# Ejecutar el build
echo "🚀 Ejecutando build..."
eas build --platform android --profile preview

# Capturar el código de salida
BUILD_EXIT_CODE=$?

# Restaurar assets
if [ -d "_assets_temp" ]; then
  echo "📦 Restaurando _assets_temp/ -> assets/"
  mv _assets_temp assets
fi

echo "✅ Workaround completado"
exit $BUILD_EXIT_CODE

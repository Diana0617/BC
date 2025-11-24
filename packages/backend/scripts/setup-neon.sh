#!/bin/bash

# Script helper para configurar la base de datos de Neon
# Uso: bash scripts/setup-neon.sh

echo "🚀 Beauty Control - Setup de Base de Datos Neon"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada en .env"
    echo ""
    echo "💡 Por favor, descomenta la línea DATABASE_URL en tu .env"
    exit 1
fi

echo "✅ DATABASE_URL configurada"
echo ""

# Paso 1: Reset de la base de datos
echo "📋 PASO 1: Limpiando base de datos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node scripts/reset-neon-database.js
if [ $? -ne 0 ]; then
    echo "❌ Error al limpiar la base de datos"
    exit 1
fi
echo ""

# Paso 2: Crear tablas
echo "📋 PASO 2: Creando tablas..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏳ Iniciando servidor para sincronizar modelos..."
echo "💡 Presiona Ctrl+C cuando veas 'Servidor iniciado' o después de ~10 segundos"
echo ""
FORCE_SYNC_DB=true npm start &
SERVER_PID=$!

# Esperar 15 segundos para que se creen las tablas
sleep 15

# Detener el servidor
kill $SERVER_PID 2>/dev/null
echo ""
echo "✅ Tablas creadas"
echo ""

# Paso 3: Ejecutar seeders
echo "📋 PASO 3: Sembrando datos iniciales..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "scripts/seed-modules.js" ]; then
    echo "📦 Sembrando módulos..."
    node scripts/seed-modules.js
    if [ $? -ne 0 ]; then
        echo "⚠️  Advertencia: Error al sembrar módulos"
    fi
fi

if [ -f "scripts/seed-rule-templates.js" ]; then
    echo "📋 Sembrando reglas de negocio..."
    node scripts/seed-rule-templates.js
    if [ $? -ne 0 ]; then
        echo "⚠️  Advertencia: Error al sembrar reglas"
    fi
fi
echo ""

# Paso 4: Instrucciones finales
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup completado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Cambia en .env:"
echo "      DISABLE_SYNC=true"
echo "      FORCE_SYNC_DB=false"
echo ""
echo "   2. Inicia el servidor:"
echo "      npm start"
echo ""

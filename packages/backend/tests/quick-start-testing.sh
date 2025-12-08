#!/bin/bash

# WhatsApp Admin API - Quick Start Testing Script
# Este script ayuda a configurar y comenzar el testing manual

echo "🚀 WhatsApp Admin API - Testing Setup"
echo "======================================"
echo ""

# Check if backend is running
echo "📋 Paso 1: Verificando backend..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend está corriendo en http://localhost:5000"
else
    echo "❌ Backend NO está corriendo"
    echo ""
    echo "Por favor ejecuta en otra terminal:"
    echo "  cd packages/backend"
    echo "  npm run dev"
    echo ""
    read -p "Presiona ENTER cuando el backend esté listo..."
fi

echo ""
echo "📋 Paso 2: Obtener token de autenticación"
echo ""
echo "Ingresa tus credenciales:"
read -p "Email: " email
read -sp "Password: " password
echo ""

# Login request
echo ""
echo "🔐 Obteniendo token..."
response=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$email\",\"password\":\"$password\"}")

# Extract token
token=$(echo $response | grep -o '"token":"[^"]*' | sed 's/"token":"//')
businessId=$(echo $response | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$token" ]; then
    echo "❌ Error al obtener token"
    echo "Respuesta: $response"
    exit 1
fi

echo "✅ Token obtenido exitosamente"
echo ""

# Save to file for Insomnia import
cat > /tmp/whatsapp-test-config.txt << EOF
==============================================
WHATSAPP ADMIN API - CONFIGURACIÓN DE TESTING
==============================================

BASE URL: http://localhost:5000
BUSINESS ID: $businessId
AUTH TOKEN: $token

==============================================
CONFIGURACIÓN PARA INSOMNIA
==============================================

1. Importar colección:
   - Archivo: packages/backend/tests/integration/whatsapp-admin-insomnia-collection.json
   
2. Configurar variables de entorno:
   - Manage Environments → Base Environment
   - base_url: http://localhost:5000
   - business_id: $businessId
   - auth_token: $token

==============================================
TESTING RÁPIDO CON CURL
==============================================

# Test 1: Get Token Info
curl -X GET "http://localhost:5000/api/business/$businessId/admin/whatsapp/token" \\
  -H "Authorization: Bearer $token"

# Test 2: Get Health Status
curl -X GET "http://localhost:5000/api/business/$businessId/admin/whatsapp/health" \\
  -H "Authorization: Bearer $token"

# Test 3: Get Stats
curl -X GET "http://localhost:5000/api/business/$businessId/admin/whatsapp/stats" \\
  -H "Authorization: Bearer $token"

==============================================
PRÓXIMOS PASOS
==============================================

✅ 1. Importar colección en Insomnia
✅ 2. Configurar variables (ver arriba)
✅ 3. Seguir checklist en: packages/backend/tests/FASE_4_TESTING_GUIDE.md
✅ 4. Testear los 22 endpoints

EOF

echo "📄 Configuración guardada en: /tmp/whatsapp-test-config.txt"
echo ""
cat /tmp/whatsapp-test-config.txt
echo ""
echo "🎯 TODO LISTO PARA TESTEAR!"
echo ""
echo "Opciones:"
echo "  A) Abrir Insomnia y seguir los pasos de arriba"
echo "  B) Testear con cURL (comandos arriba)"
echo "  C) Ver guía completa: packages/backend/tests/FASE_4_TESTING_GUIDE.md"
echo ""

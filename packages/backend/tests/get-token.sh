#!/bin/bash

# Quick Token Generator for Insomnia Testing
# Usage: ./get-token.sh

echo "🔐 Obteniendo token de autenticación..."
echo ""

# Login y extraer token
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mercedeslobeto@gmail.com","password":"Admin*7754"}')

# Verificar si el login fue exitoso
if echo "$RESPONSE" | grep -q '"success":true'; then
  # Extraer token usando python
  TOKEN=$(echo "$RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
  BUSINESS_ID=$(echo "$RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['data']['user']['businessId'])")
  
  echo "✅ Login exitoso!"
  echo ""
  echo "📋 Copia estas variables para Insomnia:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "auth_token:"
  echo "$TOKEN"
  echo ""
  echo "business_id:"
  echo "$BUSINESS_ID"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📝 Configuración para Insomnia Environment:"
  echo ""
  echo "{"
  echo "  \"base_url\": \"http://localhost:3001\","
  echo "  \"auth_token\": \"$TOKEN\","
  echo "  \"business_id\": \"$BUSINESS_ID\""
  echo "}"
  echo ""
  
  # Guardar en archivo para fácil copy-paste
  cat > /tmp/insomnia-config.json << EOF
{
  "base_url": "http://localhost:3001",
  "auth_token": "$TOKEN",
  "business_id": "$BUSINESS_ID"
}
EOF
  
  echo "💾 Configuración guardada en: /tmp/insomnia-config.json"
  echo ""
  echo "⏰ Token válido por: 24 horas"
  
else
  echo "❌ Error al hacer login"
  echo ""
  echo "Respuesta del servidor:"
  echo "$RESPONSE" | python -m json.tool
fi

#!/bin/bash

# ====================================================
# WhatsApp Integration - Quick Setup Script
# Beauty Control Platform
# ====================================================

echo "🚀 WhatsApp Integration - Quick Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if Node.js is installed
echo -e "${BLUE}Paso 1: Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor instala Node.js desde https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) instalado${NC}"
echo ""

# Step 2: Generate ENCRYPTION_KEY
echo -e "${BLUE}Paso 2: Generando ENCRYPTION_KEY...${NC}"
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✅ ENCRYPTION_KEY generada:${NC}"
echo -e "${YELLOW}${ENCRYPTION_KEY}${NC}"
echo ""

# Step 3: Check if .env exists in backend
BACKEND_ENV="packages/backend/.env"
echo -e "${BLUE}Paso 3: Verificando archivo .env del backend...${NC}"

if [ ! -f "$BACKEND_ENV" ]; then
    echo -e "${YELLOW}⚠️  .env no existe, creando desde .env.example...${NC}"
    cp packages/backend/.env.example "$BACKEND_ENV"
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi
echo ""

# Step 4: Add WhatsApp variables to .env if not present
echo -e "${BLUE}Paso 4: Configurando variables de WhatsApp...${NC}"

# Check if WhatsApp variables exist
if grep -q "META_APP_ID" "$BACKEND_ENV"; then
    echo -e "${YELLOW}⚠️  Variables de WhatsApp ya existen en .env${NC}"
    echo -e "Si quieres actualizarlas, edita manualmente: $BACKEND_ENV"
else
    echo -e "${GREEN}Agregando variables de WhatsApp a .env...${NC}"
    
    cat >> "$BACKEND_ENV" << EOL

# ====================================================
# WhatsApp Business Platform Configuration
# ====================================================
# Obtener desde https://developers.facebook.com
META_APP_ID=1928881431390804
META_APP_SECRET=CAMBIAR_POR_TU_APP_SECRET
WHATSAPP_CONFIG_ID=884984130753544
WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_webhook_verify_2024
WHATSAPP_WEBHOOK_URL=https://tu-backend.com/api/webhooks/whatsapp

# Encryption key (GENERADO AUTOMÁTICAMENTE)
ENCRYPTION_KEY=${ENCRYPTION_KEY}
EOL
    
    echo -e "${GREEN}✅ Variables agregadas a .env${NC}"
fi
echo ""

# Step 5: Check database migrations
echo -e "${BLUE}Paso 5: Verificando migraciones de base de datos...${NC}"
MIGRATION_FILE="packages/backend/migrations/create_whatsapp_tables.sql"

if [ -f "$MIGRATION_FILE" ]; then
    echo -e "${GREEN}✅ Archivo de migración encontrado${NC}"
    echo ""
    echo -e "${YELLOW}Para aplicar las migraciones, ejecuta:${NC}"
    echo -e "psql -U tu_usuario -d tu_base_de_datos -f $MIGRATION_FILE"
else
    echo -e "${RED}❌ Archivo de migración no encontrado${NC}"
fi
echo ""

# Step 6: Install backend dependencies
echo -e "${BLUE}Paso 6: Instalando dependencias del backend...${NC}"
cd packages/backend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
fi
cd ../..
echo ""

# Step 7: Install frontend dependencies
echo -e "${BLUE}Paso 7: Instalando dependencias del frontend...${NC}"
cd packages/web-app
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
fi
cd ../..
echo ""

# Summary
echo ""
echo -e "${GREEN}======================================"
echo "✅ Setup Completado"
echo -e "======================================${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos Pasos:${NC}"
echo ""
echo "1. Edita ${BACKEND_ENV} y actualiza:"
echo "   - META_APP_SECRET (desde Meta for Developers)"
echo "   - WHATSAPP_WEBHOOK_URL (tu URL de producción)"
echo ""
echo "2. Aplica las migraciones de base de datos:"
echo "   psql -U usuario -d base_datos -f $MIGRATION_FILE"
echo ""
echo "3. Inicia el backend:"
echo "   cd packages/backend && npm start"
echo ""
echo "4. Inicia el frontend:"
echo "   cd packages/web-app && npm run dev"
echo ""
echo "5. Abre http://localhost:5173 en tu navegador"
echo ""
echo -e "${BLUE}📖 Para más información:${NC}"
echo "   - WHATSAPP_SETUP_CHECKLIST.md"
echo "   - GUIA_CONEXION_WHATSAPP_PASO_A_PASO.md"
echo ""
echo -e "${GREEN}¡Listo para conectar WhatsApp! 🎉${NC}"

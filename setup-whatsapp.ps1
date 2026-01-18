# ====================================================
# WhatsApp Integration - Quick Setup Script (Windows)
# Beauty Control Platform
# ====================================================

Write-Host "🚀 WhatsApp Integration - Quick Setup" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Check if Node.js is installed
Write-Host "Paso 1: Verificando Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 2: Generate ENCRYPTION_KEY
Write-Host "Paso 2: Generando ENCRYPTION_KEY..." -ForegroundColor Cyan
$encryptionKey = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Write-Host "✅ ENCRYPTION_KEY generada:" -ForegroundColor Green
Write-Host "$encryptionKey" -ForegroundColor Yellow
Write-Host ""

# Step 3: Check if .env exists in backend
$backendEnv = "packages\backend\.env"
Write-Host "Paso 3: Verificando archivo .env del backend..." -ForegroundColor Cyan

if (!(Test-Path $backendEnv)) {
    Write-Host "⚠️  .env no existe, creando desde .env.example..." -ForegroundColor Yellow
    Copy-Item "packages\backend\.env.example" $backendEnv
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}
Write-Host ""

# Step 4: Add WhatsApp variables to .env if not present
Write-Host "Paso 4: Configurando variables de WhatsApp..." -ForegroundColor Cyan

$envContent = Get-Content $backendEnv -Raw

if ($envContent -match "META_APP_ID") {
    Write-Host "⚠️  Variables de WhatsApp ya existen en .env" -ForegroundColor Yellow
    Write-Host "Si quieres actualizarlas, edita manualmente: $backendEnv" -ForegroundColor Yellow
} else {
    Write-Host "Agregando variables de WhatsApp a .env..." -ForegroundColor Green
    
    $whatsappVars = @"

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
ENCRYPTION_KEY=$encryptionKey
"@
    
    Add-Content -Path $backendEnv -Value $whatsappVars
    Write-Host "✅ Variables agregadas a .env" -ForegroundColor Green
}
Write-Host ""

# Step 5: Check database migrations
Write-Host "Paso 5: Verificando migraciones de base de datos..." -ForegroundColor Cyan
$migrationFile = "packages\backend\migrations\create_whatsapp_tables.sql"

if (Test-Path $migrationFile) {
    Write-Host "✅ Archivo de migración encontrado" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para aplicar las migraciones, ejecuta:" -ForegroundColor Yellow
    Write-Host "psql -U tu_usuario -d tu_base_de_datos -f $migrationFile" -ForegroundColor White
} else {
    Write-Host "❌ Archivo de migración no encontrado" -ForegroundColor Red
}
Write-Host ""

# Step 6: Install backend dependencies
Write-Host "Paso 6: Instalando dependencias del backend..." -ForegroundColor Cyan
Push-Location packages\backend
if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}
Pop-Location
Write-Host ""

# Step 7: Install frontend dependencies
Write-Host "Paso 7: Instalando dependencias del frontend..." -ForegroundColor Cyan
Push-Location packages\web-app
if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}
Pop-Location
Write-Host ""

# Summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "✅ Setup Completado" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos Pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Edita $backendEnv y actualiza:"
Write-Host "   - META_APP_SECRET (desde Meta for Developers)"
Write-Host "   - WHATSAPP_WEBHOOK_URL (tu URL de producción)"
Write-Host ""
Write-Host "2. Aplica las migraciones de base de datos:"
Write-Host "   psql -U usuario -d base_datos -f $migrationFile"
Write-Host ""
Write-Host "3. Inicia el backend:"
Write-Host "   cd packages\backend && npm start"
Write-Host ""
Write-Host "4. Inicia el frontend:"
Write-Host "   cd packages\web-app && npm run dev"
Write-Host ""
Write-Host "5. Abre http://localhost:5173 en tu navegador"
Write-Host ""
Write-Host "📖 Para más información:" -ForegroundColor Cyan
Write-Host "   - WHATSAPP_SETUP_CHECKLIST.md"
Write-Host "   - GUIA_CONEXION_WHATSAPP_PASO_A_PASO.md"
Write-Host ""
Write-Host "¡Listo para conectar WhatsApp! 🎉" -ForegroundColor Green

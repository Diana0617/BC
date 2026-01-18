# Script para aplicar migración a Azure PostgreSQL
# Ejecuta: .\apply-migration-azure.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔄 Aplicando migración a Azure PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Cadena de conexión de producción (Neon)
$DB_URL = "postgresql://neondb_owner:npg_7ugmKHXAIJ4h@ep-wandering-dream-adoipu8b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Archivo de migración
$MIGRATION_FILE = "packages\backend\migrations\fix_supplier_invoice_payments_columns.sql"

if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "❌ Error: No se encontró el archivo de migración" -ForegroundColor Red
    Write-Host "   Ruta esperada: $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Archivo de migración: $MIGRATION_FILE" -ForegroundColor Green
Write-Host "🎯 Base de datos: Neon (Azure Production)" -ForegroundColor Green
Write-Host ""

# Verificar si psql está disponible
$psqlCommand = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlCommand) {
    Write-Host "❌ Error: psql no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "1. Instalar PostgreSQL desde: https://www.postgresql.org/download/" -ForegroundColor Yellow
    Write-Host "2. Ejecutar la migración desde pgAdmin" -ForegroundColor Yellow
    Write-Host "3. Ejecutar la migración desde el portal de Neon" -ForegroundColor Yellow
    Write-Host ""
    
    # Mostrar contenido del archivo para copiar manualmente
    Write-Host "📋 Contenido de la migración (cópialo y ejecútalo manualmente):" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Get-Content $MIGRATION_FILE
    Write-Host "================================================================" -ForegroundColor Cyan
    
    exit 1
}

Write-Host "⚠️  ADVERTENCIA: Esto modificará la base de datos de PRODUCCIÓN" -ForegroundColor Yellow
Write-Host "   ¿Estás seguro de que quieres continuar? (S/N)" -ForegroundColor Yellow
$confirmacion = Read-Host

if ($confirmacion -ne "S" -and $confirmacion -ne "s") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Ejecutando migración..." -ForegroundColor Cyan

try {
    # Ejecutar migración usando psql
    $env:PGPASSWORD = ""  # No necesario con la URL completa
    psql $DB_URL -f $MIGRATION_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migración aplicada exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Cyan
        Write-Host "1. Reiniciar la aplicación en Azure para que use la nueva estructura" -ForegroundColor White
        Write-Host "2. Probar el registro de pagos de facturas" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error al ejecutar la migración" -ForegroundColor Red
        Write-Host "   Revisa los mensajes de error arriba" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error al conectar con la base de datos:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

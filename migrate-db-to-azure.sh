#!/bin/bash
# Script para migrar base de datos de Neon a Azure PostgreSQL

echo "🔄 Iniciando migración de base de datos..."
echo ""

# Variables
NEON_URL="postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
AZURE_HOST="beautycontrol-db.postgres.database.azure.com"
AZURE_USER="dbadmin"
AZURE_PASSWORD="BeautyControl2024!"
AZURE_DB="beautycontrol"
BACKUP_FILE="neon_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Paso 1: Exportando datos desde Neon..."
pg_dump "$NEON_URL" \
  --format=plain \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup completado: $BACKUP_FILE"
  echo "   Tamaño: $(du -h $BACKUP_FILE | cut -f1)"
else
  echo "❌ Error al hacer backup"
  exit 1
fi

echo ""
echo "📥 Paso 2: Importando datos a Azure PostgreSQL..."
PGPASSWORD="$AZURE_PASSWORD" psql \
  --host="$AZURE_HOST" \
  --port=5432 \
  --username="$AZURE_USER" \
  --dbname="$AZURE_DB" \
  --file="$BACKUP_FILE" \
  --quiet

if [ $? -eq 0 ]; then
  echo "✅ Migración completada exitosamente!"
else
  echo "❌ Error al importar datos"
  exit 1
fi

echo ""
echo "🔍 Paso 3: Verificando migración..."
PGPASSWORD="$AZURE_PASSWORD" psql \
  --host="$AZURE_HOST" \
  --port=5432 \
  --username="$AZURE_USER" \
  --dbname="$AZURE_DB" \
  --command="\dt" \
  --quiet

echo ""
echo "✅ Migración completada!"
echo "📝 Archivo de backup guardado en: $BACKUP_FILE"
echo ""
echo "Próximos pasos:"
echo "1. Actualizar VITE_API_URL en Vercel"
echo "2. Actualizar webhook de WhatsApp en Meta"
echo "3. Probar el sistema completo"

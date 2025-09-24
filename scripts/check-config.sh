#!/bin/bash
# Script para verificar configuración antes de deploy

echo "🔍 Verificando configuración para deploy..."

echo ""
echo "📱 Frontend Configuration:"
if [ -f "packages/web-app/.env" ]; then
    echo "VITE_API_URL: $(grep VITE_API_URL packages/web-app/.env)"
else
    echo "❌ No se encontró packages/web-app/.env"
fi

echo ""
echo "🖥️  Backend Configuration:"
if [ -f "packages/backend/.env" ]; then
    echo "DATABASE_URL: $(grep DATABASE_URL packages/backend/.env | head -1)"
    echo "NODE_ENV: $(grep NODE_ENV packages/backend/.env)"
else
    echo "❌ No se encontró packages/backend/.env"
fi

echo ""
echo "🌿 Rama actual:"
git branch --show-current

echo ""
echo "📊 Archivos modificados vs main:"
git diff --name-only main..HEAD

echo ""
echo "🚨 RECORDATORIO:"
echo "- Si estás en 'main': configuración debe apuntar a PRODUCCIÓN"
echo "- Si estás en 'development': configuración debe apuntar a LOCAL"
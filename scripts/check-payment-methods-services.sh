#!/bin/bash

echo "🔍 Verificando servicios para Métodos de Pago..."
echo ""

# Verificar Backend
echo "📡 Verificando Backend (puerto 3001)..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend corriendo en http://localhost:3001"
else
    echo "❌ Backend NO está corriendo"
    echo "   Ejecuta: cd packages/backend && npm start"
    exit 1
fi

echo ""
echo "✅ Todos los servicios están corriendo correctamente"
echo ""
echo "🌐 Accede a la web-app en:"
echo "   http://localhost:5173/business/profile"
echo ""
echo "📝 Ruta de navegación:"
echo "   1. Login como BUSINESS/OWNER"
echo "   2. Business Profile"
echo "   3. Sidebar → 'Métodos de Pago'"
echo ""

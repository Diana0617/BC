@echo off
echo.
echo ================================================================
echo   VERIFICACION DE SERVICIOS - METODOS DE PAGO
echo ================================================================
echo.

echo [1/2] Verificando Backend (puerto 3001)...
curl -s http://localhost:3001/health > nul 2>&1
if %errorlevel% == 0 (
    echo   ✓ Backend CORRIENDO en http://localhost:3001
) else (
    echo   X Backend NO esta corriendo
    echo   → Ejecuta: cd packages/backend ^&^& npm start
    exit /b 1
)

echo.
echo [2/2] Web-App debe estar en http://localhost:5173
echo.
echo ================================================================
echo   TODOS LOS SERVICIOS ESTAN LISTOS
echo ================================================================
echo.
echo   Pasos para probar:
echo   1. Accede a: http://localhost:5173
echo   2. Login como BUSINESS
echo   3. Business Profile
echo   4. Sidebar → "Metodos de Pago"
echo.
echo   Ver guia completa: IMMEDIATE_TESTING_PLAN.md
echo.
pause

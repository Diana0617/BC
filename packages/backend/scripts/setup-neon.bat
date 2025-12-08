@echo off
REM Script helper para configurar la base de datos de Neon en Windows
REM Uso: scripts\setup-neon.bat

echo.
echo ================================================
echo Beauty Control - Setup de Base de Datos Neon
echo ================================================
echo.

REM Verificar que DATABASE_URL este configurada
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL no esta configurada en .env
    echo.
    echo Por favor, descomenta la linea DATABASE_URL en tu .env
    pause
    exit /b 1
)

echo DATABASE_URL configurada
echo.

REM Paso 1: Reset de la base de datos
echo ================================================
echo PASO 1: Limpiando base de datos...
echo ================================================
node scripts/reset-neon-database.js
if errorlevel 1 (
    echo Error al limpiar la base de datos
    pause
    exit /b 1
)
echo.

REM Paso 2: Instrucciones para crear tablas
echo ================================================
echo PASO 2: Crear tablas
echo ================================================
echo.
echo Ahora ejecuta manualmente:
echo   1. npm start
echo   2. Espera unos 10 segundos hasta que veas las tablas crearse
echo   3. Presiona Ctrl+C para detener
echo   4. Ejecuta: node scripts/seed-modules.js
echo   5. Ejecuta: node scripts/seed-rule-templates.js
echo   6. Cambia en .env: DISABLE_SYNC=true y FORCE_SYNC_DB=false
echo   7. Ejecuta: npm start
echo.
pause

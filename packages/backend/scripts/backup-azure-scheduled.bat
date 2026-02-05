@echo off
REM ==============================================
REM Script para ejecutar backup de Azure PostgreSQL
REM Configurar en Windows Task Scheduler
REM ==============================================

echo [%date% %time%] Iniciando backup automatico de Azure...

REM Cambiar al directorio del proyecto
cd /d "C:\Users\merce\Desktop\desarrollo\BC\packages\backend"

REM Ejecutar el script de backup
node scripts/backup-database-azure.js

REM Verificar resultado
if %ERRORLEVEL% EQU 0 (
    echo [%date% %time%] Backup completado exitosamente
) else (
    echo [%date% %time%] ERROR: El backup fallo con codigo %ERRORLEVEL%
)

REM Opcional: Escribir log
echo [%date% %time%] Backup ejecutado >> scripts/backup-log.txt

exit /b %ERRORLEVEL%

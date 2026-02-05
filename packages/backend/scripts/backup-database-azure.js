/**
 * Script de Backup Automático para Azure PostgreSQL
 * Ejecutar diariamente vía cron job o Azure Functions
 * 
 * Uso:
 * node scripts/backup-database-azure.js
 * 
 * Configurar cron (Linux/Mac):
 * 0 2 * * * cd /path/to/BC && node scripts/backup-database-azure.js
 * 
 * Windows Task Scheduler:
 * - Ejecutar a las 2:00 AM todos los días
 * - Programa: node.exe
 * - Argumentos: C:\Users\merce\Desktop\desarrollo\BC\scripts\backup-database-azure.js
 * 
 * Azure Functions (recomendado para producción):
 * - Crear Timer Trigger con CRON: 0 0 2 * * * (2 AM diario)
 */

require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ====== CONFIGURACIÓN ======
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
const BACKUP_TO_CLOUD = process.env.BACKUP_TO_CLOUD === 'true';

// Azure PostgreSQL Configuration
// Usar variables específicas de Azure (AZURE_*) o fallback a las de producción
const DB_CONFIG = {
  host: process.env.AZURE_DB_HOST || 'beautycontrol-db.postgres.database.azure.com',
  port: process.env.AZURE_DB_PORT || '5432',
  database: process.env.AZURE_DB_NAME || 'beautycontrol',
  user: process.env.AZURE_DB_USER || 'dbadmin',
  password: process.env.AZURE_DB_PASSWORD || 'BeautyControl2024!'
};

// Azure Blob Storage Configuration (opcional)
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME || 'backups';

// Crear directorio de backups si no existe
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Directorio de backups creado: ${BACKUP_DIR}`);
}

/**
 * Ejecutar backup de Azure PostgreSQL
 */
async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dateStr = timestamp.split('T')[0];
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
  const backupGzFile = `${backupFile}.gz`;

  console.log('\n==============================================');
  console.log('🔄 INICIANDO BACKUP DE BASE DE DATOS');
  console.log('==============================================');
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-CO')}`);
  console.log(`🗄️ Base de datos: ${DB_CONFIG.database}`);
  console.log(`🖥️ Servidor: ${DB_CONFIG.host}`);
  console.log(`📁 Archivo: ${backupFile}`);
  console.log('==============================================\n');

  try {
    // 1. Ejecutar pg_dump
    console.log('⏳ Paso 1/5: Ejecutando pg_dump...');
    
    // Git Bash en Windows soporta sintaxis Unix
    const pgDumpCommand = `PGPASSWORD="${DB_CONFIG.password}" pg_dump -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} --no-owner --no-acl --verbose -F p -f "${backupFile}"`;
    
    await executeCommand(pgDumpCommand, 'pg_dump');
    console.log('✅ Backup SQL creado exitosamente\n');

    // 2. Verificar tamaño del archivo
    const sqlStats = fs.statSync(backupFile);
    const sqlSizeMB = (sqlStats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Tamaño SQL: ${sqlSizeMB} MB`);

    // 3. Comprimir backup con gzip
    console.log('\n⏳ Paso 2/5: Comprimiendo backup...');
    await executeCommand(`gzip "${backupFile}"`, 'gzip');
    
    const gzStats = fs.statSync(backupGzFile);
    const gzSizeMB = (gzStats.size / (1024 * 1024)).toFixed(2);
    const compressionRatio = ((1 - (gzStats.size / sqlStats.size)) * 100).toFixed(1);
    console.log(`✅ Backup comprimido: ${gzSizeMB} MB (${compressionRatio}% compresión)\n`);

    // 4. Subir a Azure Blob Storage (opcional)
    if (BACKUP_TO_CLOUD && AZURE_STORAGE_CONNECTION_STRING) {
      console.log('⏳ Paso 3/5: Subiendo a Azure Blob Storage...');
      await uploadToAzureBlob(backupGzFile);
    } else {
      console.log('⏳ Paso 3/5: Skip upload (no configurado)\n');
    }

    // 5. Limpiar backups antiguos
    console.log('⏳ Paso 4/5: Limpiando backups antiguos...');
    await cleanOldBackups();

    // 6. Resumen final
    console.log('\n==============================================');
    console.log('✅ BACKUP COMPLETADO EXITOSAMENTE');
    console.log('==============================================');
    console.log(`📁 Archivo: ${path.basename(backupGzFile)}`);
    console.log(`📊 Tamaño: ${gzSizeMB} MB`);
    console.log(`💾 Ubicación: ${BACKUP_DIR}`);
    console.log('==============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR AL CREAR BACKUP:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

/**
 * Ejecutar comando shell con mejor manejo de errores
 */
function executeCommand(command, stepName = 'command') {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error en ${stepName}:`, error.message);
        if (stderr) console.error('STDERR:', stderr);
        reject(error);
      } else {
        if (stderr && stepName === 'pg_dump') {
          // pg_dump escribe info en stderr, no es necesariamente error
          console.log('ℹ️ Información de pg_dump:', stderr.substring(0, 500));
        }
        resolve(stdout);
      }
    });
  });
}

/**
 * Subir backup a Azure Blob Storage
 */
async function uploadToAzureBlob(filePath) {
  try {
    const { BlobServiceClient } = require('@azure/storage-blob');
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
    
    // Crear contenedor si no existe
    await containerClient.createIfNotExists({
      access: 'private'
    });
    
    const blobName = path.basename(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Subir archivo
    await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: {
        blobContentType: 'application/gzip'
      },
      metadata: {
        database: DB_CONFIG.database,
        timestamp: new Date().toISOString(),
        host: DB_CONFIG.host
      }
    });
    
    console.log(`✅ Backup subido a Azure Blob: ${blobName}\n`);
  } catch (error) {
    console.error('⚠️ Error al subir a Azure Blob Storage:', error.message);
    console.log('   Continuando sin upload a cloud...\n');
  }
}

/**
 * Limpiar backups locales antiguos
 */
async function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    let keptCount = 0;

    for (const file of files) {
      if (!file.startsWith('backup-') || !file.endsWith('.gz')) {
        continue;
      }

      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      const ageMs = now - stats.mtimeMs;

      if (ageMs > retentionMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`  🗑️ Eliminado: ${file} (${Math.floor(ageMs / (24 * 60 * 60 * 1000))} días)`);
      } else {
        keptCount++;
      }
    }

    console.log(`✅ Limpieza completada: ${deletedCount} eliminados, ${keptCount} conservados\n`);
  } catch (error) {
    console.error('⚠️ Error al limpiar backups antiguos:', error.message);
  }
}

/**
 * Validar configuración antes de ejecutar
 */
function validateConfig() {
  const errors = [];

  if (!DB_CONFIG.host) errors.push('DB_HOST no configurado');
  if (!DB_CONFIG.database) errors.push('DB_NAME no configurado');
  if (!DB_CONFIG.user) errors.push('DB_USER no configurado');
  if (!DB_CONFIG.password) errors.push('DB_PASSWORD no configurado');

  if (errors.length > 0) {
    console.error('❌ ERRORES DE CONFIGURACIÓN:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\n💡 Configura las variables de entorno en .env o en las variables del sistema\n');
    process.exit(1);
  }

  console.log('✅ Configuración validada\n');
}

// ====== EJECUTAR BACKUP ======
console.log('\n🚀 Beauty Control - Backup Automático v2.0\n');
validateConfig();
backupDatabase();

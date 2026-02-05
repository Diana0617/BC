/**
 * Script de Backup Automático de Base de Datos
 * Ejecutar diariamente vía cron job
 * 
 * Uso:
 * node scripts/backup-database.js
 * 
 * Configurar cron (Linux/Mac):
 * 0 2 * * * cd /path/to/BC && node scripts/backup-database.js
 * 
 * Windows Task Scheduler:
 * - Ejecutar a las 2:00 AM todos los días
 * - Programa: node.exe
 * - Argumentos: C:\Users\merce\Desktop\desarrollo\BC\scripts\backup-database.js
 */

require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
const DATABASE_URL = process.env.DATABASE_URL;
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
const BACKUP_TO_CLOUD = process.env.BACKUP_TO_CLOUD === 'true';

// Crear directorio de backups si no existe
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Ejecutar backup de PostgreSQL
 */
async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
  const backupGzFile = `${backupFile}.gz`;

  console.log('🔄 Iniciando backup de base de datos...');
  console.log(`📁 Archivo: ${backupFile}`);

  try {
    // Extraer info de la URL de conexión
    const dbUrl = new URL(DATABASE_URL);
    const dbName = dbUrl.pathname.slice(1); // Remover '/'
    const dbUser = dbUrl.username;
    const dbPassword = dbUrl.password;
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || 5432;

    // Comando pg_dump
    const pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f "${backupFile}"`;

    // Ejecutar backup
    await executeCommand(pgDumpCommand);
    console.log('✅ Backup SQL creado exitosamente');

    // Comprimir backup
    await executeCommand(`gzip "${backupFile}"`);
    console.log('✅ Backup comprimido exitosamente');

    // Verificar tamaño
    const stats = fs.statSync(backupGzFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Tamaño del backup: ${sizeMB} MB`);

    // Subir a cloud si está configurado
    if (BACKUP_TO_CLOUD) {
      await uploadToCloud(backupGzFile);
    }

    // Limpiar backups antiguos
    await cleanOldBackups();

    console.log('✅ Backup completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear backup:', error);
    process.exit(1);
  }
}

/**
 * Ejecutar comando shell
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Subir backup a almacenamiento en la nube
 */
async function uploadToCloud(filePath) {
  console.log('☁️ Subiendo backup a la nube...');
  
  // TODO: Implementar según proveedor
  // Azure Blob Storage
  // AWS S3
  // Google Cloud Storage
  
  // Ejemplo con Azure (comentado):
  /*
  const { BlobServiceClient } = require('@azure/storage-blob');
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient('backups');
  const blockBlobClient = containerClient.getBlockBlobClient(path.basename(filePath));
  
  await blockBlobClient.uploadFile(filePath);
  console.log('✅ Backup subido a Azure Blob Storage');
  */
  
  console.log('⚠️ Upload a cloud no configurado (implementar según proveedor)');
}

/**
 * Limpiar backups antiguos
 */
async function cleanOldBackups() {
  console.log(`🧹 Limpiando backups mayores a ${RETENTION_DAYS} días...`);

  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  let deletedCount = 0;

  for (const file of files) {
    if (!file.startsWith('backup-')) continue;

    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

    if (ageInDays > RETENTION_DAYS) {
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`  🗑️ Eliminado: ${file}`);
    }
  }

  console.log(`✅ ${deletedCount} backup(s) antiguos eliminados`);
}

// Ejecutar backup
backupDatabase();

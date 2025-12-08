require('dotenv').config();

/**
 * Script de verificación del entorno
 * Comprueba que todas las configuraciones necesarias estén en su lugar
 */

console.log('🔍 Beauty Control - Verificación del Entorno\n');

// 1. Verificar variables de entorno críticas
const requiredEnvVars = {
  'NODE_ENV': process.env.NODE_ENV || 'development',
  'PORT': process.env.PORT || '5000',
  'JWT_SECRET': process.env.JWT_SECRET ? '✅ Configurado' : '❌ Faltante',
  'DB_HOST': process.env.DB_HOST || 'localhost',
  'DB_NAME': process.env.DB_NAME || 'beauty_control_dev'
};

console.log('📋 Variables de Entorno:');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

// 2. Verificar dependencias críticas
console.log('\n📦 Verificando dependencias...');
try {
  require('express');
  console.log('   ✅ Express.js');
  
  require('sequelize');
  console.log('   ✅ Sequelize ORM');
  
  require('jsonwebtoken');
  console.log('   ✅ JWT');
  
  require('bcryptjs');
  console.log('   ✅ bcryptjs');
  
  require('helmet');
  console.log('   ✅ Helmet');
  
  require('cloudinary');
  console.log('   ✅ Cloudinary');
  
  require('sharp');
  console.log('   ✅ Sharp');
  
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 3. Verificar estructura de archivos críticos
console.log('\n📁 Verificando estructura de archivos...');
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/app.js',
  'src/models/index.js',
  'src/controllers/AuthController.js',
  'src/middleware/auth.js',
  'src/middleware/tenancy.js',
  'src/config/database.js',
  'src/config/cloudinary.js'
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 4. Intentar cargar configuraciones
console.log('\n⚙️  Verificando configuraciones...');
try {
  const { sequelize } = require('../src/config/database');
  console.log('   ✅ Configuración de base de datos cargada');
} catch (error) {
  console.log(`   ❌ Error en configuración de DB: ${error.message}`);
}

try {
  const app = require('../src/app');
  console.log('   ✅ Aplicación Express cargada');
} catch (error) {
  console.log(`   ❌ Error cargando aplicación: ${error.message}`);
}

console.log('\n🎯 Próximos pasos:');
console.log('   1. Configurar PostgreSQL si no está instalado');
console.log('   2. Actualizar variables en .env');
console.log('   3. Ejecutar: npm run db:init');
console.log('   4. Ejecutar: npm run dev');

console.log('\n📖 Para más información, ver README.md');
console.log('🚀 ¡Beauty Control Backend listo para desarrollo!');
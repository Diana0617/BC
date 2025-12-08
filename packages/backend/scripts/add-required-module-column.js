#!/usr/bin/env node

/**
 * Script para agregar la columna requiredModule a rule_templates
 * Uso: node scripts/add-required-module-column.js
 */

require('dotenv').config();
const { RuleTemplate, sequelize } = require('../src/models');

async function addRequiredModuleColumn() {
  try {
    console.log('🔧 Agregando columna requiredModule a rule_templates...');
    
    await sequelize.getQueryInterface().addColumn(
      'rule_templates',
      'required_module',
      {
        type: sequelize.Sequelize.DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nombre del módulo requerido para usar esta regla'
      }
    );
    
    console.log('✅ Columna agregada exitosamente');
    
    console.log('🔄 Actualizando reglas existentes...');
    
    // Reglas de facturación
    await sequelize.query(
      `UPDATE rule_templates SET required_module = 'facturacion_electronica' 
       WHERE key IN (
         'FACTURA_GENERACION_AUTOMATICA',
         'FACTURA_PLAZO_PAGO_DIAS',
         'FACTURA_INCLUIR_IVA',
         'FACTURA_PORCENTAJE_IVA',
         'FACTURA_RECARGO_MORA',
         'FACTURA_ENVIAR_EMAIL',
         'FACTURA_REQUIERE_FIRMA',
         'FACTURA_FORMATO_NUMERACION'
       )`
    );
    
    // Reglas de citas
    await sequelize.query(
      `UPDATE rule_templates SET required_module = 'gestion_de_turnos' 
       WHERE key IN (
         'CITAS_DIAS_ANTICIPACION_MAXIMA',
         'CITAS_HORAS_ANTICIPACION_MINIMA',
         'CITAS_HORAS_CANCELACION',
         'CITAS_MAXIMAS_POR_DIA',
         'CITAS_RECORDATORIOS_ACTIVADOS',
         'CITAS_HORAS_RECORDATORIO',
         'CITAS_PERMITIR_SIMULTANEAS',
         'CITAS_TIEMPO_LIBRE_ENTRE_CITAS'
       )`
    );
    
    console.log('✅ Reglas actualizadas exitosamente');
    
    // Mostrar resultado
    const [rules] = await sequelize.query(
      `SELECT key, description, required_module as "requiredModule", category 
       FROM rule_templates 
       ORDER BY category, required_module, key`
    );
    
    console.log('\n📋 Reglas configuradas:');
    console.table(rules.map(r => ({
      Clave: r.key,
      Categoría: r.category,
      'Módulo Requerido': r.requiredModule || '(ninguno)'
    })));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addRequiredModuleColumn();

const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  /**
   * Migración para agregar el rol BUSINESS_SPECIALIST y el campo maxServices
   * 
   * BUSINESS_SPECIALIST: Rol para usuarios del plan Básico gratuito que son
   * profesionales independientes. Combinan funcionalidades de BUSINESS y SPECIALIST.
   * 
   * maxServices: Límite de servicios/procedimientos por plan de suscripción
   */
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Iniciando migración: Agregar BUSINESS_SPECIALIST y maxServices');

      // 1. Agregar el nuevo rol BUSINESS_SPECIALIST al ENUM de Users
      console.log('📝 Paso 1: Agregando rol BUSINESS_SPECIALIST...');
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'BUSINESS_SPECIALIST';
      `, { transaction });

      // 2. Agregar campo maxServices a subscription_plans
      console.log('📝 Paso 2: Agregando campo maxServices a subscription_plans...');
      await queryInterface.addColumn('subscription_plans', 'maxServices', {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Máximo número de servicios/procedimientos permitidos'
      }, { transaction });

      // 3. Actualizar el plan Básico existente con los nuevos valores
      console.log('📝 Paso 3: Actualizando plan Básico con nuevas características...');
      await queryInterface.sequelize.query(`
        UPDATE subscription_plans 
        SET 
          "maxUsers" = 1,
          "maxServices" = 10,
          description = '¡Gratis para siempre! Plan ideal para negocios unipersonales y emprendedores que trabajan solos. Agenda tus citas y gestiona hasta 10 procedimientos de forma simple.',
          features = jsonb_set(
            jsonb_set(
              COALESCE(features, '{}'::jsonb),
              '{unipersonal}',
              '"Ideal para trabajadores independientes"'
            ),
            '{services}',
            '"Hasta 10 procedimientos/servicios"'
          ),
          limitations = jsonb_set(
            jsonb_set(
              COALESCE(limitations, '{}'::jsonb),
              '{unipersonal}',
              '"Solo para 1 persona (tú mismo)"'
            ),
            '{limited_services}',
            '"Máximo 10 procedimientos"'
          ),
          "updatedAt" = NOW()
        WHERE name = 'Básico' AND price = 0;
      `, { transaction });

      await transaction.commit();
      console.log('✅ Migración completada exitosamente');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en la migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Iniciando rollback: Revertir BUSINESS_SPECIALIST y maxServices');

      // 1. Remover campo maxServices
      console.log('📝 Paso 1: Removiendo campo maxServices...');
      await queryInterface.removeColumn('subscription_plans', 'maxServices', { transaction });

      // 2. Actualizar usuarios con rol BUSINESS_SPECIALIST a BUSINESS
      console.log('📝 Paso 2: Actualizando usuarios BUSINESS_SPECIALIST a BUSINESS...');
      await queryInterface.sequelize.query(`
        UPDATE users 
        SET role = 'BUSINESS' 
        WHERE role = 'BUSINESS_SPECIALIST';
      `, { transaction });

      // NOTA: No podemos remover un valor de un ENUM en PostgreSQL fácilmente
      // Requeriría recrear el tipo ENUM completo, lo cual es complejo y arriesgado
      console.log('⚠️  Advertencia: El valor BUSINESS_SPECIALIST permanecerá en el enum_users_role');
      console.log('    pero no se usará. Para removerlo completamente, se requiere recrear el ENUM.');

      // 3. Revertir cambios en el plan Básico
      console.log('📝 Paso 3: Revirtiendo cambios en plan Básico...');
      await queryInterface.sequelize.query(`
        UPDATE subscription_plans 
        SET 
          "maxUsers" = 2,
          description = '¡Gratis para siempre! Plan ideal para emprendedores y salones pequeños que están comenzando. Incluye funcionalidades esenciales para gestionar citas y clientes.',
          features = features - 'unipersonal' - 'services',
          limitations = limitations - 'unipersonal' - 'limited_services',
          "updatedAt" = NOW()
        WHERE name = 'Básico' AND price = 0;
      `, { transaction });

      await transaction.commit();
      console.log('✅ Rollback completado');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en el rollback:', error);
      throw error;
    }
  }
};

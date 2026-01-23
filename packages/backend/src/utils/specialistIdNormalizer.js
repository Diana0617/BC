/**
 * 🔧 SPECIALIST ID NORMALIZER
 * 
 * Utilidad para normalizar IDs de especialistas en todo el sistema.
 * Maneja la inconsistencia entre userId y specialistProfileId.
 * 
 * PROBLEMA: 
 * - specialist_services usa userId como specialistId
 * - specialist_branch_schedules usa specialistProfileId
 * - appointments usa userId como specialistId
 * 
 * SOLUCIÓN:
 * - Normalizar en un solo lugar
 * - Retornar ambos IDs cuando sea necesario
 * - Mantener backward compatibility
 */

const { SpecialistProfile, User, Op } = require('../models');

class SpecialistIdNormalizer {
  /**
   * Normalizar specialistId a ambos formatos (userId y specialistProfileId)
   * @param {UUID} specialistId - Puede ser userId o specialistProfileId
   * @param {UUID} businessId - ID del negocio para validar
   * @returns {Object} { userId, specialistProfileId, user, specialistProfile }
   */
  static async normalize(specialistId, businessId) {
    if (!specialistId) {
      throw new Error('specialistId es requerido');
    }

    let user = null;
    let specialistProfile = null;

    // 1. Intentar buscar como SpecialistProfile primero
    specialistProfile = await SpecialistProfile.findOne({
      where: {
        id: specialistId,
        businessId
      },
      include: [{
        model: User,
        as: 'user',
        where: { status: 'ACTIVE' },
        required: true
      }]
    });

    if (specialistProfile) {
      user = specialistProfile.user;
      console.log('✅ [Normalizer] Encontrado por specialistProfileId:', {
        specialistProfileId: specialistProfile.id,
        userId: user.id
      });
      
      return {
        userId: user.id,
        specialistProfileId: specialistProfile.id,
        user,
        specialistProfile,
        source: 'specialistProfile'
      };
    }

    // 2. Intentar buscar como userId y obtener/crear SpecialistProfile
    user = await User.findOne({
      where: {
        id: specialistId,
        businessId,
        status: 'ACTIVE',
        role: { 
          [Op.in]: ['BUSINESS', 'BUSINESS_SPECIALIST', 'SPECIALIST', 'RECEPTIONIST_SPECIALIST'] 
        }
      }
    });

    if (user) {
      // Buscar si tiene SpecialistProfile
      specialistProfile = await SpecialistProfile.findOne({
        where: {
          userId: user.id,
          businessId
        }
      });

      // Si no tiene SpecialistProfile, crearlo automáticamente
      if (!specialistProfile) {
        console.log('⚠️ [Normalizer] Usuario sin SpecialistProfile, creando...');
        specialistProfile = await SpecialistProfile.create({
          userId: user.id,
          businessId,
          specialization: user.role === 'SPECIALIST' ? 'Especialista' : 'Propietario/Especialista',
          status: 'ACTIVE',
          isActive: true
        });
        console.log('✅ [Normalizer] SpecialistProfile creado:', specialistProfile.id);
      }

      console.log('✅ [Normalizer] Encontrado por userId:', {
        userId: user.id,
        specialistProfileId: specialistProfile.id
      });

      return {
        userId: user.id,
        specialistProfileId: specialistProfile.id,
        user,
        specialistProfile,
        source: 'userId'
      };
    }

    // 3. No encontrado
    throw new Error(`Especialista no encontrado: ${specialistId}`);
  }

  /**
   * Obtener solo el userId (para appointments y specialist_services)
   * @param {UUID} specialistId 
   * @param {UUID} businessId 
   * @returns {UUID} userId
   */
  static async getUserId(specialistId, businessId) {
    const normalized = await this.normalize(specialistId, businessId);
    return normalized.userId;
  }

  /**
   * Obtener solo el specialistProfileId (para specialist_branch_schedules)
   * @param {UUID} specialistId 
   * @param {UUID} businessId 
   * @returns {UUID} specialistProfileId
   */
  static async getSpecialistProfileId(specialistId, businessId) {
    const normalized = await this.normalize(specialistId, businessId);
    return normalized.specialistProfileId;
  }

  /**
   * Obtener array con ambos IDs para queries con Op.or
   * @param {UUID} specialistId 
   * @param {UUID} businessId 
   * @returns {Array} [userId, specialistProfileId]
   */
  static async getBothIds(specialistId, businessId) {
    const normalized = await this.normalize(specialistId, businessId);
    return [normalized.userId, normalized.specialistProfileId];
  }
}

module.exports = SpecialistIdNormalizer;

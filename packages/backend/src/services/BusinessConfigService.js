// TEMPORARILY SIMPLIFIED - BusinessConfigService under refactoring
// Full functionality temporarily unavailable while BusinessRules system is being refactored

const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const Business = require('../models/Business');
const SpecialistProfile = require('../models/SpecialistProfile');
const Schedule = require('../models/Schedule');
const TimeSlot = require('../models/TimeSlot');
const BusinessPaymentConfig = require('../models/BusinessPaymentConfig');
const User = require('../models/User');
const Service = require('../models/Service');
const Branch = require('../models/Branch');
const UserBranch = require('../models/UserBranch');

class BusinessConfigService {
  
  // TEMPORARILY DISABLED METHODS - Return error messages
  
  async getBusinessRules(businessId) {
    throw new Error('BusinessRules functionality temporarily unavailable - system under refactoring');
  }

  async updateBusinessRules(businessId, rulesData) {
    throw new Error('BusinessRules functionality temporarily unavailable - system under refactoring');
  }

  async createDefaultScheduleForSpecialist(businessId, specialistId) {
    throw new Error('createDefaultScheduleForSpecialist temporarily unavailable - BusinessRules system under refactoring');
  }

  // Add minimal methods that might be needed
  async deactivateOtherDefaultSchedules(businessId, specialistId) {
    // Temporary stub - might be called by other services
    return true;
  }

  async generateTimeSlotsForSchedule(schedule) {
    // Temporary stub - might be called by other services
    return true;
  }

  generateSlotsForShift(date, shift, slotDuration, bufferTime, schedule) {
    // Temporary stub
    return [];
  }

  getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  async hasActiveAppointments(specialistId) {
    // Temporary stub
    return false;
  }

  // ==================== BUSINESS BASIC OPERATIONS ====================

  /**
   * Get business by ID
   */
  async getBusiness(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      return business;
    } catch (error) {
      console.error('Error getting business:', error);
      throw error;
    }
  }

  /**
   * Update business basic info
   */
  async updateBusiness(businessId, data) {
    try {
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error('Negocio no encontrado');
      }
      
      await business.update(data);
      return business;
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  }

  /**
   * Update business settings (JSONB field)
   */
  async updateBusinessSettings(businessId, settings) {
    try {
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error('Negocio no encontrado');
      }
      
      await business.update({ settings });
      return business;
    } catch (error) {
      console.error('Error updating business settings:', error);
      throw error;
    }
  }

  async deleteSpecialistSchedulesAndSlots(specialistId) {
    // Temporary stub
    return true;
  }

  async regenerateTimeSlotsForSchedule(schedule) {
    // Temporary stub
    return true;
  }

  async testWompiConfig(config) {
    throw new Error('Payment config testing temporarily unavailable - system under refactoring');
  }

  async testStripeConfig(config) {
    throw new Error('Payment config testing temporarily unavailable - system under refactoring');
  }

  // Service methods - these might still work without BusinessRules
  async getSpecialists(businessId, filters = {}) {
    try {
      const whereClause = { businessId };

      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      if (filters.specialization) {
        whereClause.specialization = filters.specialization;
      }

      // Filtro por userId específico
      if (filters.userId) {
        whereClause.userId = filters.userId;
      }

      // Incluir usuario y sus sucursales asignadas
      const specialists = await SpecialistProfile.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role'],
            include: [{
              model: Branch,
              as: 'branches',
              through: { 
                attributes: ['isDefault', 'canManageSchedule', 'canCreateAppointments'] 
              },
              attributes: ['id', 'name', 'address', 'city', 'isMain']
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Transformar la respuesta para aplanar los datos del usuario
      return specialists.map(specialist => {
        const branches = specialist.user?.branches || [];
        const defaultBranch = branches.find(b => b.UserBranch?.isDefault);
        
        return {
          id: specialist.id,
          userId: specialist.userId,
          firstName: specialist.user?.firstName || '',
          lastName: specialist.user?.lastName || '',
          email: specialist.user?.email || '',
          phone: specialist.user?.phone || '',
          role: specialist.user?.role || 'SPECIALIST',
          specialization: specialist.specialization,
          biography: specialist.biography,
          bio: specialist.biography,
          experience: specialist.experience,
          yearsOfExperience: specialist.experience,
          certifications: specialist.certifications,
          profileImage: specialist.profileImage,
          isActive: specialist.isActive,
          commissionRate: specialist.commissionRate,
          commissionPercentage: specialist.commissionRate,
          commissionType: specialist.commissionType,
          hourlyRate: specialist.fixedCommissionAmount,
          status: specialist.status,
          branchId: defaultBranch?.id || null,
          branches: branches.map(b => ({
            id: b.id,
            name: b.name,
            address: b.address,
            city: b.city,
            isMain: b.isMain,
            isDefault: b.UserBranch?.isDefault || false
          })),
          additionalBranches: branches.filter(b => !b.UserBranch?.isDefault).map(b => b.id),
          createdAt: specialist.createdAt,
          updatedAt: specialist.updatedAt
        };
      });
    } catch (error) {
      throw new Error(`Error al obtener especialistas: ${error.message}`);
    }
  }

  async getServices(businessId, filters = {}) {
    try {
      const whereClause = { businessId };
      
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      
      if (filters.category) {
        whereClause.category = filters.category;
      }

      const services = await Service.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
      });

      return services;
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  }

  async getService(serviceId, businessId = null) {
    try {
      const whereClause = { id: serviceId };
      if (businessId) {
        whereClause.businessId = businessId;
      }

      const service = await Service.findOne({
        where: whereClause
      });

      return service;
    } catch (error) {
      throw new Error(`Error al obtener servicio: ${error.message}`);
    }
  }

  async createService(businessId, serviceData) {
    try {
      const service = await Service.create({
        ...serviceData,
        businessId,
        isActive: serviceData.isActive !== undefined ? serviceData.isActive : true
      });

      return service;
    } catch (error) {
      throw new Error(`Error al crear servicio: ${error.message}`);
    }
  }

  async updateService(serviceId, serviceData, businessId) {
    try {
      const service = await Service.findOne({
        where: { id: serviceId, businessId }
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      await service.update(serviceData);
      return service;
    } catch (error) {
      throw new Error(`Error al actualizar servicio: ${error.message}`);
    }
  }

  async deleteService(serviceId, businessId) {
    try {
      const service = await Service.findOne({
        where: { id: serviceId, businessId }
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      await service.destroy();
      return { success: true };
    } catch (error) {
      throw new Error(`Error al eliminar servicio: ${error.message}`);
    }
  }

  async toggleServiceStatus(serviceId, businessId, isActive) {
    try {
      const service = await Service.findOne({
        where: { id: serviceId, businessId }
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      await service.update({ isActive });
      return service;
    } catch (error) {
      throw new Error(`Error al cambiar estado del servicio: ${error.message}`);
    }
  }

  // ==================== SPECIALIST CRUD ====================

  async createSpecialist(businessId, userData, profileData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Verificar que el negocio existe
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      // Verificar que el email no esté en uso (comparación case-insensitive)
      const existingUser = await User.findOne({ where: { email: userData.email.toLowerCase() } });
      if (existingUser) {
        throw new Error('El correo electrónico ya está registrado');
      }

      // Hashear la contraseña antes de crear el usuario
      let hashedPassword = userData.password;
      if (userData.password) {
        const salt = await bcrypt.genSalt(12);
        hashedPassword = await bcrypt.hash(userData.password, salt);
      }

      // Manejar la sucursal principal
      let mainBranchId = profileData.branchId;
      
      // Si no se especificó sucursal, buscar o crear la sucursal principal del negocio
      if (!mainBranchId) {
        // Buscar si existe una sucursal principal
        let mainBranch = await Branch.findOne({
          where: { 
            businessId: businessId,
            isMain: true
          }
        });
        
        // Si no existe, crear la sucursal principal con los datos del negocio
        if (!mainBranch) {
          // Generar un código único para la sucursal basado en el nombre del negocio
          const branchCode = business.name
            .substring(0, 10) // Tomar primeros 10 caracteres
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '') // Eliminar caracteres especiales
            .padEnd(3, '0') // Asegurar mínimo 3 caracteres
            + '-MAIN';
          
          mainBranch = await Branch.create({
            businessId: businessId,
            name: `${business.name} - Principal`,
            code: branchCode, // ✅ Agregar código obligatorio
            address: business.address || 'Dirección no especificada',
            city: business.city || 'Ciudad no especificada',
            country: business.country || 'Colombia',
            phone: business.phone || null,
            email: business.email || null,
            isMain: true,
            isActive: true
          }, { transaction });
          
          console.log(`✅ Sucursal principal creada automáticamente: ${mainBranch.id} (código: ${branchCode})`);
        }
        
        mainBranchId = mainBranch.id;
      } else {
        // Verificar que la sucursal especificada existe
        const specifiedBranch = await Branch.findByPk(mainBranchId);
        if (!specifiedBranch || specifiedBranch.businessId !== businessId) {
          throw new Error('Sucursal especificada no encontrada o no pertenece al negocio');
        }
      }

      // Crear el usuario con los datos enviados desde el frontend
      const user = await User.create({
        firstName: userData.firstName?.trim() || 'Sin',
        lastName: userData.lastName?.trim() || 'Apellido',
        email: userData.email.toLowerCase(), // Normalizar email a minúsculas
        password: hashedPassword, // Usar la contraseña hasheada
        phone: userData.phone || null,
        role: userData.role || 'SPECIALIST', // Respetar el rol enviado
        businessId: businessId,
        status: 'ACTIVE'
      }, { transaction });

      // Solo crear perfil de especialista si NO es RECEPTIONIST puro
      let profile = null;
      
      if (userData.role !== 'RECEPTIONIST') {
        // Crear el perfil de especialista con todos los campos del formulario
        profile = await SpecialistProfile.create({
          userId: user.id,
          businessId: businessId,
          specialization: profileData.specialization || null,
          biography: profileData.biography || profileData.bio || null,
          experience: profileData.experience ? parseInt(profileData.experience) : 
                     (profileData.yearsOfExperience ? parseInt(profileData.yearsOfExperience) : null),
          certifications: Array.isArray(profileData.certifications) 
            ? profileData.certifications 
            : (profileData.certifications ? [profileData.certifications] : []),
          isActive: profileData.isActive !== undefined ? profileData.isActive : true,
          commissionRate: profileData.commissionRate ? parseFloat(profileData.commissionRate) :
                         (profileData.commissionPercentage ? parseFloat(profileData.commissionPercentage) : 50.00),
          commissionType: profileData.hourlyRate ? 'FIXED_AMOUNT' : 'PERCENTAGE',
          fixedCommissionAmount: profileData.hourlyRate ? parseFloat(profileData.hourlyRate) : null,
          status: 'ACTIVE'
        }, { transaction });
      }

      // Asignar sucursal principal a través de UserBranch
      await UserBranch.create({
        userId: user.id,
        branchId: mainBranchId, // Usar la sucursal principal (automática o especificada)
        isDefault: true,
        canManageSchedule: true,
        canCreateAppointments: true
      }, { transaction });

      // Si hay sucursales adicionales, asignarlas
      if (profileData.additionalBranches && Array.isArray(profileData.additionalBranches) && profileData.additionalBranches.length > 0) {
        const additionalBranchAssignments = profileData.additionalBranches.map(branchId => ({
          userId: user.id,
          branchId: branchId,
          isDefault: false,
          canManageSchedule: true,
          canCreateAppointments: true
        }));
        
        await UserBranch.bulkCreate(additionalBranchAssignments, { transaction });
      }

      // ==================== ASIGNAR SERVICIOS AL ESPECIALISTA ====================
      // Solo asignar servicios si se creó un perfil de especialista
      if (profile && profileData.serviceIds && Array.isArray(profileData.serviceIds) && profileData.serviceIds.length > 0) {
        const SpecialistService = require('../models/SpecialistService');
        
        const serviceAssignments = profileData.serviceIds.map(serviceId => ({
          specialistId: profile.id,
          serviceId: serviceId,
          businessId: businessId,
          isActive: true
          // customPrice se puede agregar después si se necesita
        }));
        
        await SpecialistService.bulkCreate(serviceAssignments, { transaction });
        console.log(`✅ ${serviceAssignments.length} servicios asignados al especialista ${profile.id}`);
      }

      await transaction.commit();

      // Si es RECEPTIONIST (sin perfil), retornar datos del usuario solamente
      if (!profile) {
        // Cargar el usuario completo con sus sucursales (sin transaction ya que está commiteada)
        await user.reload({
          include: [{
            model: Branch,
            as: 'branches',
            through: { attributes: ['isDefault'] },
            attributes: ['id', 'name', 'address', 'city', 'isMain']
          }]
        });

        const branches = user.branches || [];
        const defaultBranch = branches.find(b => b.UserBranch?.isDefault);

        return {
          id: user.id,
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: true,
          status: 'ACTIVE',
          branchId: defaultBranch?.id || null,
          branches: branches.map(b => ({
            id: b.id,
            name: b.name,
            address: b.address,
            city: b.city,
            isMain: b.isMain,
            isDefault: b.UserBranch?.isDefault || false
          })),
          additionalBranches: branches.filter(b => !b.UserBranch?.isDefault).map(b => b.id),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      }

      // Si tiene perfil de especialista, cargar el perfil completo con relaciones (sin transaction ya que está commiteada)
      await profile.reload({ 
        include: [
          { 
            model: User, 
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role'],
            include: [{
              model: Branch,
              as: 'branches',
              through: { attributes: ['isDefault'] },
              attributes: ['id', 'name', 'address', 'city', 'isMain']
            }]
          }
        ]
      });

      const branches = profile.user?.branches || [];
      const defaultBranch = branches.find(b => b.UserBranch?.isDefault);
      
      // Retornar en formato aplanado que espera el frontend
      return {
        id: profile.id,
        userId: profile.userId,
        firstName: profile.user?.firstName || '',
        lastName: profile.user?.lastName || '',
        email: profile.user?.email || '',
        phone: profile.user?.phone || '',
        role: profile.user?.role || 'SPECIALIST',
        specialization: profile.specialization,
        biography: profile.biography,
        bio: profile.biography,
        experience: profile.experience,
        yearsOfExperience: profile.experience,
        certifications: profile.certifications,
        profileImage: profile.profileImage,
        isActive: profile.isActive,
        commissionRate: profile.commissionRate,
        commissionPercentage: profile.commissionRate,
        commissionType: profile.commissionType,
        hourlyRate: profile.fixedCommissionAmount,
        status: profile.status,
        branchId: defaultBranch?.id || null,
        branches: branches.map(b => ({
          id: b.id,
          name: b.name,
          address: b.address,
          city: b.city,
          isMain: b.isMain,
          isDefault: b.UserBranch?.isDefault || false
        })),
        additionalBranches: branches.filter(b => !b.UserBranch?.isDefault).map(b => b.id),
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al crear especialista: ${error.message}`);
    }
  }

  async updateSpecialistProfile(profileId, profileData) {
    const transaction = await sequelize.transaction();
    
    try {
      const profile = await SpecialistProfile.findByPk(profileId, {
        include: [{ model: User, as: 'user' }],
        transaction
      });
      
      if (!profile) {
        throw new Error('Perfil de especialista no encontrado');
      }

      // Separar datos de usuario vs datos de perfil
      const userData = {};
      const specialistData = {};
      
      // Campos que van a la tabla users
      if (profileData.firstName !== undefined) userData.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) userData.lastName = profileData.lastName;
      if (profileData.email !== undefined) userData.email = profileData.email.toLowerCase(); // Normalizar email a minúsculas
      if (profileData.phone !== undefined) userData.phone = profileData.phone;
      if (profileData.role !== undefined) userData.role = profileData.role;
      if (profileData.password !== undefined) {
        const bcrypt = require('bcryptjs');
        userData.password = await bcrypt.hash(profileData.password, 10);
      }
      
      // Campos que van a la tabla specialist_profiles
      if (profileData.specialization !== undefined) specialistData.specialization = profileData.specialization;
      if (profileData.biography !== undefined) specialistData.biography = profileData.biography;
      if (profileData.experience !== undefined) specialistData.experience = profileData.experience;
      if (profileData.certifications !== undefined) specialistData.certifications = profileData.certifications;
      if (profileData.commissionRate !== undefined) specialistData.commissionRate = profileData.commissionRate;
      if (profileData.isActive !== undefined) specialistData.isActive = profileData.isActive;
      
      // Actualizar usuario si hay cambios
      if (Object.keys(userData).length > 0 && profile.user) {
        await profile.user.update(userData, { transaction });
      }
      
      // Actualizar perfil si hay cambios
      if (Object.keys(specialistData).length > 0) {
        await profile.update(specialistData, { transaction });
      }
      
      await transaction.commit();
      
      // Recargar con relaciones
      await profile.reload({ 
        include: [{ 
          model: User, 
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role']
        }] 
      });
      
      return profile;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar especialista: ${error.message}`);
    }
  }

  async deleteSpecialist(profileId) {
    try {
      // Primero intentar encontrar el perfil de especialista
      const profile = await SpecialistProfile.findByPk(profileId);
      
      if (profile) {
        // Si tiene perfil, desactivar el perfil y el usuario
        await profile.update({ isActive: false, status: 'INACTIVE' });
        
        // También desactivar el usuario asociado
        const user = await User.findByPk(profile.userId);
        if (user) {
          await user.update({ status: 'INACTIVE' });
        }
        
        return { deleted: false, deactivated: true, message: 'Miembro del equipo desactivado correctamente' };
      } else {
        // Si no tiene perfil (RECEPTIONIST), buscar por userId
        // El profileId en este caso es el userId
        const user = await User.findByPk(profileId);
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        
        // Soft delete - solo desactivar el usuario
        await user.update({ status: 'INACTIVE' });
        
        return { deleted: false, deactivated: true, message: 'Recepcionista desactivado correctamente' };
      }
    } catch (error) {
      throw new Error(`Error al eliminar miembro del equipo: ${error.message}`);
    }
  }

  async toggleSpecialistStatus(profileId, isActive) {
    try {
      // Primero intentar encontrar el perfil de especialista
      const profile = await SpecialistProfile.findByPk(profileId, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'status']
        }]
      });

      if (profile) {
        // Si tiene perfil, actualizar el perfil y el usuario
        await profile.update({ 
          isActive: isActive,
          status: isActive ? 'ACTIVE' : 'INACTIVE'
        });

        // También actualizar el estado del usuario
        if (profile.user) {
          await profile.user.update({
            status: isActive ? 'ACTIVE' : 'INACTIVE'
          });
        }

        // Recargar el perfil con todos los datos
        await profile.reload({
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role'],
            include: [{
              model: Branch,
              as: 'branches',
              through: { attributes: ['isDefault'] },
              attributes: ['id', 'name', 'address', 'city', 'isMain']
            }]
          }]
        });

        // Retornar el perfil actualizado en formato aplanado
        const branches = profile.user?.branches || [];
        const defaultBranch = branches.find(b => b.UserBranch?.isDefault);

        return {
          id: profile.id,
          userId: profile.userId,
          firstName: profile.user?.firstName || '',
          lastName: profile.user?.lastName || '',
          email: profile.user?.email || '',
          phone: profile.user?.phone || '',
          role: profile.user?.role || 'SPECIALIST',
          specialization: profile.specialization,
          biography: profile.biography,
          isActive: profile.isActive,
          status: profile.status,
          branchId: defaultBranch?.id || null,
          branches: branches.map(b => ({
            id: b.id,
            name: b.name,
            isDefault: b.UserBranch?.isDefault || false
          })),
          additionalBranches: branches.filter(b => !b.UserBranch?.isDefault).map(b => b.id)
        };
      } else {
        // Si no tiene perfil (RECEPTIONIST), buscar por userId
        const user = await User.findByPk(profileId, {
          include: [{
            model: Branch,
            as: 'branches',
            through: { attributes: ['isDefault'] },
            attributes: ['id', 'name', 'address', 'city', 'isMain']
          }]
        });

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        // Actualizar estado del usuario
        await user.update({
          status: isActive ? 'ACTIVE' : 'INACTIVE'
        });

        // Recargar con relaciones
        await user.reload({
          include: [{
            model: Branch,
            as: 'branches',
            through: { attributes: ['isDefault'] },
            attributes: ['id', 'name', 'address', 'city', 'isMain']
          }]
        });

        const branches = user.branches || [];
        const defaultBranch = branches.find(b => b.UserBranch?.isDefault);

        return {
          id: user.id,
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: isActive,
          status: user.status,
          branchId: defaultBranch?.id || null,
          branches: branches.map(b => ({
            id: b.id,
            name: b.name,
            isDefault: b.UserBranch?.isDefault || false
          })),
          additionalBranches: branches.filter(b => !b.UserBranch?.isDefault).map(b => b.id)
        };
      }
    } catch (error) {
      throw new Error(`Error al cambiar estado del especialista: ${error.message}`);
    }
  }
}

module.exports = new BusinessConfigService();

/**
 * Script de testing para funcionalidades del OWNER
 * 
 * Este script permite probar las funcionalidades específicas del rol OWNER
 * incluyendo estadísticas, gestión de negocios y suscripciones.
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Configuración de usuario OWNER para testing
const OWNER_CREDENTIALS = {
  email: 'admin@beautycontrol.com',
  password: 'AdminPassword123!'
};

// Configuración de un negocio de prueba
const TEST_BUSINESS = {
  businessName: 'Spa Belleza Total',
  businessEmail: 'info@bellezatotal.com',
  businessPhone: '+57320777888',
  address: 'Calle 123 #45-67',
  city: 'Bogotá',
  country: 'Colombia',
  ownerEmail: 'propietario@bellezatotal.com',
  ownerFirstName: 'Ana',
  ownerLastName: 'Rodríguez',
  ownerPhone: '+57320888999'
};

class OwnerTester {
  constructor() {
    this.authToken = null;
    this.createdBusinessId = null;
    this.createdSubscriptionId = null;
  }

  // Registrar usuario OWNER
  async registerOwner() {
    try {
      console.log('🔐 Registrando usuario OWNER...');
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email: OWNER_CREDENTIALS.email,
        password: OWNER_CREDENTIALS.password,
        firstName: 'Administrador',
        lastName: 'Beauty Control',
        phone: '+57300000000',
        role: 'OWNER'
      });

      console.log('✅ Usuario OWNER registrado exitosamente');
      return response.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('ya existe')) {
        console.log('ℹ️ Usuario OWNER ya existe');
        return { success: true };
      }
      console.error('❌ Error registrando OWNER:', error.response?.data || error.message);
      throw error;
    }
  }

  // Login y obtener token
  async login() {
    try {
      console.log('🔑 Iniciando sesión como OWNER...');
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, OWNER_CREDENTIALS);
      
      this.authToken = response.data.data.token;
      console.log('✅ Login exitoso');
      console.log(`📋 Token: ${this.authToken.substring(0, 50)}...`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      throw error;
    }
  }

  // Obtener headers con autenticación
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Probar estadísticas de la plataforma
  async testPlatformStats() {
    try {
      console.log('\\n📊 Probando estadísticas de la plataforma...');
      
      const response = await axios.get(`${API_BASE_URL}/api/owner/stats/platform`, {
        headers: this.getAuthHeaders()
      });

      console.log('✅ Estadísticas obtenidas:');
      console.log(JSON.stringify(response.data.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Probar listado de negocios
  async testBusinessList() {
    try {
      console.log('\\n🏢 Probando listado de negocios...');
      
      const response = await axios.get(`${API_BASE_URL}/api/owner/businesses?page=1&limit=10`, {
        headers: this.getAuthHeaders()
      });

      console.log('✅ Negocios listados:');
      console.log(`📋 Total: ${response.data.data.pagination.total}`);
      console.log(`📄 Página: ${response.data.data.pagination.page} de ${response.data.data.pagination.totalPages}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error listando negocios:', error.response?.data || error.message);
      throw error;
    }
  }

  // Probar creación manual de negocio
  async testCreateBusiness(planId) {
    try {
      console.log('\\n🏗️ Probando creación manual de negocio...');
      
      const businessData = {
        ...TEST_BUSINESS,
        subscriptionPlanId: planId
      };

      const response = await axios.post(`${API_BASE_URL}/api/owner/businesses`, businessData, {
        headers: this.getAuthHeaders()
      });

      this.createdBusinessId = response.data.data.business.id;
      console.log('✅ Negocio creado exitosamente:');
      console.log(`🆔 ID: ${this.createdBusinessId}`);
      console.log(`🏢 Nombre: ${response.data.data.business.name}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creando negocio:', error.response?.data || error.message);
      throw error;
    }
  }

  // Probar cambio de estado de negocio
  async testBusinessStatusChange() {
    if (!this.createdBusinessId) {
      console.log('⚠️ No hay negocio creado para cambiar estado');
      return;
    }

    try {
      console.log('\\n⚡ Probando cambio de estado de negocio...');
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/owner/businesses/${this.createdBusinessId}/status`,
        {
          status: 'SUSPENDED',
          reason: 'Testing de funcionalidad OWNER'
        },
        { headers: this.getAuthHeaders() }
      );

      console.log('✅ Estado cambiado exitosamente:');
      console.log(`📊 Nuevo estado: ${response.data.data.status}`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error cambiando estado:', error.response?.data || error.message);
      throw error;
    }
  }

  // Probar creación de suscripción
  async testCreateSubscription(planId) {
    if (!this.createdBusinessId) {
      console.log('⚠️ No hay negocio creado para crear suscripción');
      return;
    }

    try {
      console.log('\\n📝 Probando creación de suscripción...');
      
      const response = await axios.post(`${API_BASE_URL}/api/owner/subscriptions`, {
        businessId: this.createdBusinessId,
        subscriptionPlanId: planId,
        duration: 3
      }, {
        headers: this.getAuthHeaders()
      });

      this.createdSubscriptionId = response.data.data.id;
      console.log('✅ Suscripción creada exitosamente:');
      console.log(`🆔 ID: ${this.createdSubscriptionId}`);
      console.log(`⏰ Duración: 3 meses`);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creando suscripción:', error.response?.data || error.message);
      throw error;
    }
  }

  // Ejecutar todas las pruebas
  async runAllTests() {
    try {
      console.log('🚀 Iniciando pruebas del rol OWNER\\n');
      
      // 1. Registrar OWNER
      await this.registerOwner();
      
      // 2. Login
      await this.login();
      
      // 3. Probar estadísticas
      await this.testPlatformStats();
      
      // 4. Probar listado de negocios
      await this.testBusinessList();
      
      // 5. Crear negocio (usar un plan que exista)
      const basicPlanId = '9350ddb1-e6ed-4275-bbe2-181eab538bca'; // Puedes cambiar este ID
      await this.testCreateBusiness(basicPlanId);
      
      // 6. Cambiar estado del negocio
      await this.testBusinessStatusChange();
      
      // 7. Crear suscripción adicional
      const premiumPlanId = 'f7a6545b-1ceb-4bfd-9a7b-72d14add5d49'; // Puedes cambiar este ID
      await this.testCreateSubscription(premiumPlanId);
      
      console.log('\\n🎉 ¡Todas las pruebas del OWNER completadas exitosamente!');
      
    } catch (error) {
      console.error('\\n💥 Error en las pruebas:', error.message);
      process.exit(1);
    }
  }
}

// Ejecutar las pruebas si el script se ejecuta directamente
if (require.main === module) {
  const tester = new OwnerTester();
  tester.runAllTests();
}

module.exports = OwnerTester;
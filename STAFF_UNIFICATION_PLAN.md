# 📋 PLAN: Unificar Creación de Staff (Todos los Roles)

## 🎯 OBJETIVO
Crear un único modal/formulario que permita crear **TODO el staff** desde un mismo lugar:
- ✅ Especialistas (con todos los campos)
- ✅ Recepcionistas-Especialistas (híbrido)
- ✅ Recepcionistas puros (solo lo mínimo para login)

---

## 📊 ESTADO ACTUAL

### ✅ Lo que YA EXISTE:

1. **SpecialistsSection.jsx** (1339 líneas)
   - ✅ Formulario completo para especialistas
   - ✅ Sistema de roles (SPECIALIST, RECEPTIONIST_SPECIALIST)
   - ✅ Wizard multi-paso (3 pasos)
   - ✅ Gestión de servicios personalizados
   - ✅ Multi-branch support
   - ⚠️ **PROBLEMA**: No permite crear RECEPTIONIST puro

2. **ServiceFormModal.jsx** (192 líneas)
   - ✅ Modal completo y funcional
   - ✅ Crear/editar servicios
   - ✅ Categorías, duración, precio
   - ✅ Ya en uso en ServicesSection

### ❌ Lo que FALTA:

1. **Rol RECEPTIONIST** no está en el selector
2. **CommissionConfigModal.jsx** - NO EXISTE
3. **ConsentTemplateModal.jsx** - NO EXISTE

---

## 🏗️ ARQUITECTURA PROPUESTA

### Opción 1: Expandir SpecialistsSection → StaffSection ✅ **RECOMENDADA**

**Cambios**:
```javascript
// Renombrar archivo
SpecialistsSection.jsx → StaffSection.jsx

// Actualizar roleOptions
const roleOptions = [
  { 
    value: 'SPECIALIST', 
    label: 'Especialista', 
    description: 'Solo realiza servicios y procedimientos',
    requiresFields: ['specialization', 'commissionRate', 'services']
  },
  { 
    value: 'RECEPTIONIST_SPECIALIST', 
    label: 'Recepcionista-Especialista', 
    description: 'Gestiona citas Y realiza servicios',
    requiresFields: ['specialization', 'commissionRate', 'services']
  },
  { 
    value: 'RECEPTIONIST', 
    label: 'Recepcionista', 
    description: 'Solo gestiona citas y agenda',
    requiresFields: [] // Solo datos básicos
  }
]

// Lógica condicional en formulario
{formData.role !== 'RECEPTIONIST' && (
  /* Campos de especialista */
)}
```

**Pros**:
- ✅ Aprovecha todo el código existente
- ✅ Un solo lugar para gestionar staff
- ✅ Consistencia en UX
- ✅ Menos duplicación de código

**Contras**:
- ⚠️ Archivo más grande (1400+ líneas)
- ⚠️ Más lógica condicional

---

### Opción 2: Crear StaffSection nuevo + Modales separados

**Estructura**:
```
components/staff/
  ├── StaffFormModal.jsx       // Modal principal
  ├── SpecialistFields.jsx     // Campos solo para especialistas
  ├── ServicesAssignmentTab.jsx
  └── CalendarConfigTab.jsx

pages/business/profile/sections/
  └── StaffSection.jsx          // Nueva sección unificada
```

**Pros**:
- ✅ Código más modular
- ✅ Fácil de testear
- ✅ Componentes reutilizables

**Contras**:
- ❌ Más archivos que mantener
- ❌ Requiere refactor del código existente
- ❌ Más tiempo de implementación

---

## 🎯 DECISIÓN: Opción 1 (Expandir SpecialistsSection)

### Implementación en 5 pasos:

---

## 📝 PASO 1: Agregar rol RECEPTIONIST (30 min)

### Archivo: `SpecialistsSection.jsx`

**Cambio 1**: Actualizar `roleOptions`
```javascript
const roleOptions = [
  { 
    value: 'SPECIALIST', 
    label: 'Especialista', 
    description: 'Solo realiza servicios y procedimientos',
    icon: StarIcon,
    requiresProfile: true,  // ← Requiere campos de especialista
    requiresServices: true
  },
  { 
    value: 'RECEPTIONIST_SPECIALIST', 
    label: 'Recepcionista-Especialista', 
    description: 'Puede gestionar citas y realizar servicios',
    icon: UsersIcon,
    requiresProfile: true,
    requiresServices: true
  },
  { 
    value: 'RECEPTIONIST', 
    label: 'Recepcionista', 
    description: 'Solo gestiona agenda y citas (no realiza servicios)',
    icon: BuildingOfficeIcon,
    requiresProfile: false,  // ← Solo datos básicos
    requiresServices: false
  }
];
```

**Cambio 2**: Lógica condicional en renderStepContent()
```javascript
const renderStepContent = () => {
  const selectedRole = roleOptions.find(r => r.value === formData.role);
  const showProfileFields = selectedRole?.requiresProfile ?? true;
  const showServicesTab = selectedRole?.requiresServices ?? true;

  switch (currentStep) {
    case 1:
      return renderBasicInfoStep();
    
    case 2:
      // Solo mostrar si el rol requiere perfil de especialista
      if (!showProfileFields) {
        setCurrentStep(3); // Saltar al paso 3
        return null;
      }
      return renderProfileStep();
    
    case 3:
      if (!showServicesTab) {
        // Para recepcionistas, mostrar solo confirmación
        return renderReceptionistConfirmation();
      }
      return renderServicesStep();
    
    default:
      return null;
  }
};
```

**Cambio 3**: Nuevo componente de confirmación
```javascript
const renderReceptionistConfirmation = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="text-center">
      <UsersIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Recepcionista</h3>
      <p className="text-gray-600 mb-6">
        Este usuario tendrá acceso a:
      </p>
      
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <div className="bg-green-50 p-4 rounded-lg">
          <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium">Gestión de Agenda</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium">Crear Citas</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium">Ver Clientes</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium">Registrar Pagos</p>
        </div>
      </div>

      <div className="mt-6 bg-red-50 p-4 rounded-lg">
        <p className="text-sm text-red-800">
          <strong>No tendrá acceso a:</strong> Realizar servicios, ver comisiones, configuración del negocio
        </p>
      </div>
    </div>
  </div>
);
```

**Cambio 4**: Actualizar validación en handleSubmit
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    setError(null);

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role
    };

    if (!editingSpecialist && formData.password) {
      userData.password = formData.password;
    }

    // Solo crear profileData si el rol lo requiere
    const selectedRole = roleOptions.find(r => r.value === formData.role);
    let profileData = null;
    
    if (selectedRole?.requiresProfile) {
      // Campos de especialista
      profileData = {
        specialization: formData.specialization,
        experience: formData.experience ? parseInt(formData.experience) : null,
        certifications: parseCertifications(formData.certifications),
        biography: formData.biography,
        isActive: formData.isActive
      };

      if (useCommissionSystem) {
        profileData.commissionRate = formData.commissionRate ? 
          parseFloat(formData.commissionRate) : defaultCommissionRate;
      }

      if (formData.branchId) {
        profileData.branchId = formData.branchId;
      }

      if (formData.additionalBranches?.length > 0) {
        profileData.additionalBranches = formData.additionalBranches;
      }
    }

    // Endpoint según si requiere perfil o no
    if (editingSpecialist) {
      await businessSpecialistsApi.updateSpecialistProfile(
        activeBusiness.id, 
        editingSpecialist.id, 
        profileData ? { ...userData, ...profileData } : userData
      );
    } else {
      if (profileData) {
        // Especialista completo
        await businessSpecialistsApi.createSpecialist(activeBusiness.id, {
          userData,
          profileData
        });
      } else {
        // Solo recepcionista (sin perfil)
        await businessSpecialistsApi.createStaffMember(activeBusiness.id, userData);
      }
    }
    
    await loadSpecialists();
    setSuccess(editingSpecialist ? '✅ Usuario actualizado' : '✅ Usuario creado');
    
    setTimeout(() => resetForm(), 1500);
  } catch (err) {
    setError(err.response?.data?.message || 'Error al guardar');
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 PASO 2: Crear CommissionConfigModal (1 hora)

### Archivo: `packages/web-app/src/components/services/CommissionConfigModal.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { commissionApi } from '@shared/api';

const CommissionConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  service, 
  businessId,
  globalCommission 
}) => {
  const [useCustom, setUseCustom] = useState(false);
  const [formData, setFormData] = useState({
    specialistPercentage: 60,
    businessPercentage: 40
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (service?.ServiceCommission) {
      setUseCustom(true);
      setFormData({
        specialistPercentage: service.ServiceCommission.specialistPercentage,
        businessPercentage: service.ServiceCommission.businessPercentage
      });
    } else if (globalCommission) {
      setFormData({
        specialistPercentage: globalCommission.defaultSpecialistPercentage || 60,
        businessPercentage: globalCommission.defaultBusinessPercentage || 40
      });
    }
  }, [service, globalCommission]);

  const handlePercentageChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    
    if (field === 'specialistPercentage') {
      setFormData({
        specialistPercentage: numValue,
        businessPercentage: 100 - numValue
      });
    } else {
      setFormData({
        specialistPercentage: 100 - numValue,
        businessPercentage: numValue
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.specialistPercentage + formData.businessPercentage !== 100) {
      setError('Los porcentajes deben sumar 100%');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (useCustom) {
        // Crear/actualizar comisión personalizada
        await commissionApi.setServiceCommission(businessId, service.id, {
          specialistPercentage: formData.specialistPercentage,
          businessPercentage: formData.businessPercentage,
          calculationType: 'PERCENTAGE'
        });
      } else {
        // Eliminar comisión personalizada (usar global)
        if (service.ServiceCommission) {
          await commissionApi.deleteServiceCommission(businessId, service.ServiceCommission.id);
        }
      }
      
      onSave();
    } catch (err) {
      console.error('Error saving commission:', err);
      setError(err.message || 'Error al guardar comisión');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const previewAmount = service?.price 
    ? (service.price * formData.specialistPercentage / 100).toLocaleString('es-CO')
    : '0';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Configurar Comisión
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle: Usar global o personalizada */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded"
                />
                <div className="ml-3">
                  <label className="font-medium text-gray-900">
                    Usar comisión personalizada
                  </label>
                  <p className="text-sm text-gray-600">
                    {useCustom 
                      ? 'Configuración específica para este servicio'
                      : `Usando config global: ${globalCommission?.defaultSpecialistPercentage || 60}% especialista`
                    }
                  </p>
                </div>
              </div>
            </div>

            {useCustom && (
              <>
                {/* Porcentaje Especialista */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión del Especialista (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.specialistPercentage}
                    onChange={(e) => handlePercentageChange('specialistPercentage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Porcentaje Negocio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión del Negocio (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.businessPercentage}
                    onChange={(e) => handlePercentageChange('businessPercentage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Preview del cálculo */}
                {service?.price && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <InformationCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-900">
                          Vista Previa del Cálculo
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Precio del servicio: ${service.price.toLocaleString('es-CO')}
                        </p>
                        <p className="text-sm text-green-700">
                          Comisión especialista ({formData.specialistPercentage}%): ${previewAmount}
                        </p>
                        <p className="text-sm text-green-700">
                          Para el negocio ({formData.businessPercentage}%): $
                          {(service.price * formData.businessPercentage / 100).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommissionConfigModal;
```

---

## 📝 PASO 3: Crear ConsentTemplateModal (1 hora)

### Archivo: `packages/web-app/src/components/services/ConsentTemplateModal.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { consentApi } from '@shared/api';

const ConsentTemplateModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  service, 
  businessId 
}) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (service?.consentTemplateId) {
      setSelectedTemplate(service.consentTemplateId);
    }
  }, [service]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await consentApi.getTemplates(businessId, {
        isActive: true
      });
      setTemplates(response.data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Error al cargar plantillas');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async (templateId) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Reemplazar placeholders con datos de ejemplo
        let html = template.content;
        html = html.replace(/{{negocio_nombre}}/g, 'Mi Negocio');
        html = html.replace(/{{cliente_nombre}}/g, 'María García');
        html = html.replace(/{{servicio_nombre}}/g, service?.name || 'Servicio');
        html = html.replace(/{{fecha_firma}}/g, new Date().toLocaleDateString('es-CO'));
        
        setPreviewHtml(html);
      }
    } catch (err) {
      console.error('Error previewing template:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Actualizar servicio con el template seleccionado
      await consentApi.assignTemplateToService(businessId, service.id, {
        consentTemplateId: selectedTemplate
      });
      
      onSave();
    } catch (err) {
      console.error('Error assigning template:', err);
      setError(err.message || 'Error al asignar plantilla');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Asignar Consentimiento Informado
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Lista de plantillas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Plantillas Disponibles</h3>
              
              {isLoading ? (
                <p className="text-gray-500">Cargando plantillas...</p>
              ) : templates.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    No hay plantillas disponibles. Crea una primero en la sección de Consentimientos.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        handlePreview(template.id);
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {template.name}
                            </h4>
                            {selectedTemplate === template.id && (
                              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {template.category} - v{template.version}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vista previa */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
              
              {previewHtml ? (
                <div 
                  className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    Selecciona una plantilla para ver la vista previa
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedTemplate || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Asignar Plantilla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentTemplateModal;
```

---

## 📝 PASO 4: Renombrar Sección (15 min)

### Cambios de nombres:

1. **Renombrar archivo**:
   ```
   SpecialistsSection.jsx → StaffSection.jsx
   ```

2. **Actualizar títulos en el componente**:
   ```javascript
   // Título principal
   <h2>Equipo de Trabajo</h2>
   
   // Subtítulo
   <p>Gestiona especialistas, recepcionistas y todo tu staff</p>
   
   // Botón crear
   <button>Agregar Miembro del Equipo</button>
   
   // Tabla
   <th>Nombre</th>
   <th>Rol</th>
   <th>Email</th>
   <th>Especialización</th> {/* Solo si es especialista */}
   <th>Estado</th>
   ```

3. **Actualizar import en BusinessProfile.jsx**:
   ```javascript
   import StaffSection from './sections/StaffSection'
   
   // En el render
   <StaffSection />
   ```

---

## 📝 PASO 5: Actualizar Backend API (si es necesario)

### Verificar endpoint para recepcionistas puros:

```javascript
// Archivo: packages/backend/src/routes/businessSpecialists.js

// Si NO existe, agregar:
router.post('/:businessId/staff', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { userData } = req.body;
    
    // Crear usuario sin perfil de especialista
    const user = await User.create({
      ...userData,
      businessId,
      role: userData.role || 'RECEPTIONIST'
    });
    
    res.json({
      success: true,
      data: user,
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend
- [ ] PASO 1: Agregar rol RECEPTIONIST a roleOptions (30min)
- [ ] PASO 2: Crear CommissionConfigModal.jsx (1h)
- [ ] PASO 3: Crear ConsentTemplateModal.jsx (1h)
- [ ] PASO 4: Renombrar SpecialistsSection → StaffSection (15min)
- [ ] PASO 5: Integrar modales en StaffSection (30min)

### Backend
- [ ] Verificar endpoint POST /api/business/:id/staff existe
- [ ] Verificar endpoint PUT /api/business/:id/services/:serviceId/commission
- [ ] Verificar endpoint POST /api/consent/assign-template

---

## ⏱️ ESTIMACIÓN TOTAL

| Tarea | Tiempo |
|-------|--------|
| PASO 1: Agregar RECEPTIONIST | 30 min |
| PASO 2: CommissionConfigModal | 1 hora |
| PASO 3: ConsentTemplateModal | 1 hora |
| PASO 4: Renombrar sección | 15 min |
| PASO 5: Testing | 30 min |
| **TOTAL** | **3 horas 15 min** |

---

## 🚀 RESULTADO FINAL

Después de implementar todo:

✅ **Un solo lugar para crear TODO el staff**:
- Especialistas (formulario completo)
- Recepcionistas-Especialistas (formulario completo)
- Recepcionistas puros (solo datos básicos)

✅ **Modales funcionales**:
- ServiceFormModal ✅ (ya existe)
- CommissionConfigModal ✅ (nuevo)
- ConsentTemplateModal ✅ (nuevo)

✅ **UX mejorada**:
- Wizard condicional según rol
- Vista previa de configuraciones
- Validaciones claras
- Mensajes de ayuda contextuales

---

## 🎯 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Primero**: PASO 2 y 3 (modales) - Son independientes ✅
2. **Segundo**: PASO 1 (rol RECEPTIONIST) - Requiere backend ⚠️
3. **Tercero**: PASO 4 (renombrar) - Simple refactor ✅
4. **Cuarto**: Testing completo ✅

---

¿Empezamos con el PASO 2 (CommissionConfigModal)?

# 🏗️ **Redux Implementation - Business Rules System**

## ✅ **Estado Actual - COMPLETAMENTE IMPLEMENTADO**

El sistema de reglas de negocio está **100% integrado** entre Backend + Redux + APIs.

## 📁 **Estructura Implementada**

### **APIs - `packages/shared/src/api/`**
- ✅ **`ruleTemplateApi.js`** - CRUD completo para Owner templates
- ✅ **`businessRuleApi.js`** - Gestión de reglas para businesses (actualizado)

### **Redux Slices - `packages/shared/src/store/slices/`**
- ✅ **`ruleTemplateSlice.js`** - Estado de templates con selectors avanzados
- ✅ **`businessRuleSlice.js`** - Estado de reglas del negocio

### **Endpoints Integrados**
```javascript
// OWNER ENDPOINTS
POST   /api/rule-templates/owner/templates           ✅ Crear template
GET    /api/rule-templates/owner/templates           ✅ Listar templates
PUT    /api/rule-templates/owner/templates/:id       ✅ Actualizar template  
DELETE /api/rule-templates/owner/templates/:id       ✅ Eliminar template

// PUBLIC/BUSINESS ENDPOINTS  
GET    /api/rule-templates/                          ✅ Templates públicos
GET    /api/rule-templates/business/templates/available ✅ Disponibles para negocio
GET    /api/business-rules/business/rules            ✅ Reglas del negocio
PUT    /api/business-rules/business/rules/:key       ✅ Personalizar regla
POST   /api/business-rules/business/rules/setup      ✅ Configurar reglas iniciales
```

## 🚀 **Cómo Usar Redux**

### **1. Owner - Gestión de Templates**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  createOwnerRuleTemplate, 
  getOwnerRuleTemplates,
  selectOwnerTemplates,
  selectOwnerTemplatesLoading
} from '@shared/store/slices/ruleTemplateSlice';

const OwnerRulesComponent = () => {
  const dispatch = useDispatch();
  const templates = useSelector(selectOwnerTemplates);
  const loading = useSelector(selectOwnerTemplatesLoading);

  // Crear nuevo template
  const handleCreateTemplate = async () => {
    const newTemplate = {
      key: "NEW_POLICY_RULE",
      name: "Nueva Política",
      description: "Descripción de la regla",
      type: "CONFIGURATION",
      category: "SERVICE_POLICY",
      defaultValue: { enabled: true, maxValue: 100 },
      allowCustomization: true
    };
    
    await dispatch(createOwnerRuleTemplate(newTemplate));
  };

  // Listar templates
  useEffect(() => {
    dispatch(getOwnerRuleTemplates({ category: 'PAYMENT_POLICY' }));
  }, []);

  return (
    <div>
      {loading ? 'Cargando...' : templates.map(template => 
        <div key={template.id}>{template.name}</div>
      )}
    </div>
  );
};
```

### **2. Business - Gestión de Reglas**  
```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  getAvailableTemplates,
  getBusinessAssignedRules,
  customizeBusinessRule
} from '@shared/store/slices/businessRuleSlice';

const BusinessRulesComponent = () => {
  const dispatch = useDispatch();
  const availableTemplates = useSelector(state => state.businessRule.availableTemplates);
  const businessRules = useSelector(state => state.businessRule.assignedRules);

  // Obtener templates disponibles
  useEffect(() => {
    dispatch(getAvailableTemplates());
    dispatch(getBusinessAssignedRules());
  }, []);

  // Personalizar regla
  const handleCustomizeRule = async (ruleKey, newValue) => {
    await dispatch(customizeBusinessRule({ 
      ruleKey, 
      customValue: newValue 
    }));
  };

  return (
    <div>
      <h2>Reglas Disponibles</h2>
      {availableTemplates.map(template => 
        <div key={template.key}>{template.name}</div>
      )}
      
      <h2>Mis Reglas Personalizadas</h2>
      {businessRules.map(rule => 
        <div key={rule.key}>
          {rule.name}: {JSON.stringify(rule.value)}
        </div>
      )}
    </div>
  );
};
```

### **3. Selectors Avanzados**
```javascript
import { 
  selectFilteredTemplates,
  selectTemplatesByCategory,
  selectActiveTemplatesCount
} from '@shared/store/slices/ruleTemplateSlice';

// Filtrar templates por criterios
const paymentTemplates = useSelector(state => 
  selectTemplatesByCategory(state, 'PAYMENT_POLICY')
);

// Templates activos
const activeCount = useSelector(selectActiveTemplatesCount);

// Búsqueda filtrada
const searchResults = useSelector(state =>
  selectFilteredTemplates(state, { 
    search: 'payment',
    category: 'PAYMENT_POLICY',
    isActive: true 
  })
);
```

## 🎯 **Funcionalidades Implementadas**

### **✅ Owner (Administrador de Templates)**
- Crear nuevas reglas template
- Listar todas sus templates creadas
- Actualizar templates existentes  
- Eliminar templates
- Filtrar por categoría
- Búsqueda por texto

### **✅ Business (Negocio usando reglas)**
- Ver templates disponibles
- Obtener reglas actualmente configuradas
- Personalizar valores de reglas
- Configurar reglas iniciales
- Filtrar por categoría

### **✅ Selectors Optimizados**
- Filtros por categoría, estado activo, búsqueda
- Contadores y estadísticas
- Memoización con createSelector

## 🔥 **Sistema LISTO para usar**

El sistema Redux está **completamente funcional** y probado con el backend. Puedes usar las actions y selectors directamente en tus componentes React/React Native.

**Backend**: ✅ Funcionando  
**APIs**: ✅ Actualizadas  
**Redux**: ✅ Implementado  
**Selectors**: ✅ Optimizados  

¡Solo falta crear los componentes UI para usar estas funcionalidades! 🎉
# Guía: Configuración de Comisiones Personalizadas

## 🎯 Resumen

El sistema de comisiones de Beauty Control utiliza una arquitectura de **3 niveles** que permite configurar valores predeterminados globales, personalizarlos por negocio, y sobrescribirlos por especialista individual.

## 📊 Jerarquía de Configuración

```
Nivel 1: Template (Global)
   ↓ (si no hay customValue)
Nivel 2: Business (Negocio Específico)
   ↓ (si no hay commissionRate)
Nivel 3: Specialist (Especialista Individual)
```

### Ejemplo Práctico

1. **Plantilla Global**: `SPECIALIST_DEFAULT_COMMISSION_RATE` = 50%
   - Todos los negocios heredan este valor por defecto

2. **Personalización del Negocio**: customValue = 40%
   - Este negocio específico usa 40% como su valor predeterminado

3. **Sobrescritura del Especialista**: commissionRate = 35%
   - Este especialista particular recibe 35% de comisión

**Resultado**: El especialista recibe 35%, pero si no se especifica su comisión individual, hereda el 40% del negocio, y si el negocio no personaliza, hereda el 50% global.

## 🔧 Cómo Personalizar la Comisión del Negocio

### Paso 1: Acceder a las Reglas de Negocio

1. Ir a **Perfil del Negocio**
2. Hacer clic en la sección **"Reglas de Negocio"**
3. Se abrirá el modal de configuración de reglas

### Paso 2: Localizar la Regla de Comisión

En la pestaña **"Reglas Asignadas"**, buscar:

- **SPECIALIST_DEFAULT_COMMISSION_RATE**
- Descripción: "Porcentaje de comisión predeterminado para especialistas (0-100)"
- Categoría: `PAYMENT_POLICY`

### Paso 3: Editar el Valor

1. Hacer clic en el botón **"Editar"** azul
2. Se abrirá un prompt con:
   - Nombre de la regla
   - Descripción
   - **Rango permitido: 0 - 100** ← Validación automática
   - Valor actual
3. Ingresar el nuevo valor (ejemplo: `40`)
4. Hacer clic en **OK**

### Paso 4: Verificar el Cambio

- El sistema muestra: `✅ Regla "SPECIALIST_DEFAULT_COMMISSION_RATE" actualizada correctamente con el nuevo valor.`
- En "Valor configurado" se verá el nuevo valor: `40`
- Se agrega nota automática: `Editado manualmente el [fecha]`

## 📝 Reglas de Validación

El sistema valida automáticamente que el valor ingresado:

✅ Sea un número válido
✅ Esté entre 0 y 100 (rango definido en la plantilla)
❌ Si está fuera del rango: `❌ El valor debe ser menor o igual a 100`
❌ Si no es número: `❌ Por favor ingresa un número válido.`

## 🧑‍💼 Crear Especialistas con Comisión Personalizada

### Opción A: Usar el Valor del Negocio

1. Ir a **Perfil del Negocio** → **Especialistas**
2. Hacer clic en **"Agregar Nuevo Especialista"**
3. Completar los datos del especialista
4. En el campo **"Comisión (%)"**:
   - **Dejar en blanco** para usar el valor del negocio (40%)
   - El placeholder muestra: "Dejar en blanco para usar 40%"
5. Guardar

**Resultado**: El especialista heredará el 40% configurado en las reglas del negocio.

### Opción B: Sobrescribir con Valor Individual

1. Seguir los mismos pasos 1-3 de la Opción A
2. En el campo **"Comisión (%)"**:
   - **Ingresar un valor específico** (ejemplo: `35`)
3. Guardar

**Resultado**: El especialista tendrá su propio valor de 35%, ignorando el valor del negocio.

## 🔀 Cascada de Valores

El sistema aplica esta lógica de cascada:

```javascript
commissionRate = specialist.commissionRate 
              ?? businessRule.customValue 
              ?? template.defaultValue 
              ?? 50
```

**Traducción**:
1. Si el especialista tiene `commissionRate` → usar ese valor
2. Si no, usar `customValue` de la regla del negocio
3. Si no, usar `defaultValue` de la plantilla global
4. Si no, usar 50 como último recurso (hardcoded)

## 📋 Estados de las Reglas

### Regla Activa
- **Estado**: Verde "Activa"
- **Efecto**: La regla se aplica normalmente
- **Acción**: Botón amarillo "Desactivar" para cambiar estado

### Regla Inactiva
- **Estado**: Gris "Inactiva"
- **Efecto**: La regla existe pero no se aplica (se ignora)
- **Acción**: Botón verde "Activar" para habilitar

**Nota**: Si desactivas `SPECIALIST_COMMISSION_ENABLED`, el campo de comisión **no se mostrará** al crear especialistas.

## 🎨 Ejemplo de Uso Completo

### Escenario

**Beauty Salon Deluxe** quiere:
- Usar 45% como comisión estándar (en lugar del 50% global)
- Dar 60% a su especialista estrella Ana
- Dar 30% a un especialista junior Carlos

### Configuración

1. **Configurar el negocio**:
   - Ir a Reglas de Negocio
   - Editar `SPECIALIST_DEFAULT_COMMISSION_RATE`
   - Cambiar de 50 a **45**

2. **Crear especialistas**:
   - **Ana** (estrella):
     - Nombre: Ana García
     - Comisión: **60** ← Valor individual
   
   - **Carlos** (junior):
     - Nombre: Carlos López
     - Comisión: **30** ← Valor individual
   
   - **María** (estándar):
     - Nombre: María Rodríguez
     - Comisión: *(dejar en blanco)* ← Hereda 45% del negocio

### Resultado

| Especialista | Comisión | Origen del Valor |
|-------------|----------|------------------|
| Ana García | 60% | Individual (sobrescrito) |
| Carlos López | 30% | Individual (sobrescrito) |
| María Rodríguez | 45% | Negocio (heredado) |

## 🔍 Verificación en Base de Datos

### Ver regla de negocio

```sql
SELECT 
  br.id,
  br.business_id,
  rt.key,
  rt.default_value AS "Valor Global",
  br.custom_value AS "Valor Personalizado",
  br.is_active,
  br.notes
FROM business_rules br
JOIN rule_templates rt ON br.rule_template_id = rt.id
WHERE rt.key = 'SPECIALIST_DEFAULT_COMMISSION_RATE'
  AND br.business_id = 'TU_BUSINESS_ID';
```

### Ver especialistas con comisiones

```sql
SELECT 
  sp.id,
  u.name AS "Nombre",
  sp.commission_rate AS "Comisión Individual",
  b.id AS "Business ID"
FROM specialist_profiles sp
JOIN users u ON sp.user_id = u.id
JOIN businesses b ON sp.business_id = b.id
WHERE b.id = 'TU_BUSINESS_ID';
```

## 🚀 Próximos Pasos

1. ✅ La funcionalidad de edición está implementada
2. ✅ Validación de rango 0-100 funcionando
3. ✅ Cascada de valores configurada en SpecialistsSection
4. 🔄 **Siguiente**: Reiniciar servidor y probar en UI
5. ⏳ **Mejora futura**: Reemplazar `window.prompt()` con modal moderno

## 📚 Archivos Relacionados

- **Frontend**:
  - `packages/web-app/src/components/BusinessRuleModal.jsx` - Modal de edición
  - `packages/web-app/src/pages/business/profile/sections/SpecialistsSection.jsx` - Lógica de comisiones

- **Backend**:
  - `packages/backend/scripts/seed-rule-templates.js` - Definición de plantillas
  - `packages/backend/src/models/RuleTemplate.js` - Modelo de plantillas
  - `packages/backend/src/models/BusinessRule.js` - Modelo de reglas de negocio

- **Documentación**:
  - `COMMISSION_SYSTEM_MIGRATION.md` - Migración completa
  - `RULE_TEMPLATES_API.md` - API de reglas
  - `RULE_TEMPLATES_EXAMPLES.md` - Ejemplos de uso

---

**Última actualización**: ${new Date().toLocaleDateString('es-ES')}

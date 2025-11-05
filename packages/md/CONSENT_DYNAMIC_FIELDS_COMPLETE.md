# 📋 Sistema de Campos Dinámicos para Consentimientos - COMPLETADO

## ✅ Implementación Completada

### 1. **Frontend: Renderizado Dinámico de Campos**

**Archivo:** `ConsentCaptureModal.js`

#### Estado y Manejo:
```javascript
const [editableFieldsData, setEditableFieldsData] = useState({}); // Campos dinámicos del template

const handleEditableFieldChange = (fieldName, value) => {
  setEditableFieldsData(prev => ({
    ...prev,
    [fieldName]: value
  }));
};
```

#### Función de Renderizado:
```javascript
const renderEditableFields = () => {
  if (!consentTemplate?.editableFields || consentTemplate.editableFields.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>Información Adicional</Text>
      {consentTemplate.editableFields.map((field, index) => (
        <View key={field.name || index} style={{ marginBottom: 12 }}>
          <Text style={styles.inputLabel}>
            {field.label} {field.required && '*'}
          </Text>
          <TextInput
            value={editableFieldsData[field.name] || ''}
            onChangeText={(value) => handleEditableFieldChange(field.name, value)}
            placeholder={field.label}
            style={[
              styles.input,
              field.type === 'textarea' && styles.textareaInput
            ]}
            multiline={field.type === 'textarea'}
            numberOfLines={field.type === 'textarea' ? 4 : 1}
          />
        </View>
      ))}
    </View>
  );
};
```

#### Validación de Campos Requeridos:
```javascript
// En validateConsent():
if (consentTemplate?.editableFields) {
  for (const field of consentTemplate.editableFields) {
    if (field.required && !editableFieldsData[field.name]?.trim()) {
      Alert.alert('Campo Requerido', `Por favor complete: ${field.label}`);
      return false;
    }
  }
}
```

#### Envío de Datos:
```javascript
// En captureConsent():
const consentData = {
  appointmentId: appointment.id,
  clientData: {
    ...clientConsent,
    signature: clientSignature, // Firma en base64
    editableFields: editableFieldsData // Campos dinámicos completados
  },
  // ...
};
```

#### Estilos Agregados:
```javascript
textareaInput: {
  minHeight: 80,
  textAlignVertical: 'top'
}
```

---

### 2. **Backend: Almacenamiento de Campos Dinámicos**

**Archivo:** `routes/appointments.js`

#### Endpoint POST /:id/consent:
```javascript
const consentSignature = await ConsentSignature.create({
  businessId,
  customerId: appointment.clientId,
  consentTemplateId: appointment.service.consentTemplateId,
  appointmentId: id,
  serviceId: appointment.serviceId,
  templateVersion: consentTemplate?.version || '1.0',
  templateContent: consentTemplate?.content || clientData.consentText,
  signedBy: clientData.clientName,
  signatureData: clientData.signature, // Firma en base64
  signatureType: 'DIGITAL',
  signedAt: new Date(),
  editableFieldsData: {
    clientIdNumber: clientData.clientId,
    agreedToTerms: clientData.agreedToTerms,
    agreedToTreatment: clientData.agreedToTreatment,
    agreedToPhotos: clientData.agreedToPhotos,
    ...clientData.editableFields // ✅ Campos dinámicos del template
  },
  ipAddress: req.ip,
  deviceInfo: req.headers['user-agent']
});
```

---

### 3. **Modelo: Estructura de Datos**

**Archivo:** `models/ConsentTemplate.js`

#### Campo editableFields (JSONB):
```javascript
editableFields: {
  type: DataTypes.JSONB,
  defaultValue: [],
  comment: 'Campos que el cliente debe completar al firmar: [{"name": "alergias", "label": "Alergias", "type": "textarea", "required": true}]'
}
```

#### Estructura de Ejemplo:
```json
[
  {
    "name": "alergias",
    "label": "¿Tiene alergias conocidas?",
    "type": "textarea",
    "required": true
  },
  {
    "name": "medicamentos",
    "label": "Medicamentos actuales",
    "type": "text",
    "required": false
  },
  {
    "name": "enfermedadesPrevias",
    "label": "Enfermedades previas o condiciones médicas",
    "type": "textarea",
    "required": true
  },
  {
    "name": "cirugiasPrevias",
    "label": "Cirugías estéticas previas",
    "type": "textarea",
    "required": false
  }
]
```

---

## 🎯 Flujo Completo

### Frontend:
1. Modal se abre con `consentTemplate` cargado
2. `renderEditableFields()` lee `consentTemplate.editableFields`
3. Renderiza dinámicamente inputs según el `type`:
   - `text` → TextInput de una línea
   - `textarea` → TextInput multilínea (4 líneas)
4. Usuario completa los campos
5. `handleEditableFieldChange` actualiza `editableFieldsData`
6. Validación verifica campos con `required: true`
7. Datos se envían en `clientData.editableFields`

### Backend:
1. Recibe `clientData.editableFields` en POST /:id/consent
2. Combina con campos fijos en `editableFieldsData`:
   ```javascript
   {
     clientIdNumber: "22528158",
     agreedToTerms: true,
     agreedToTreatment: true,
     agreedToPhotos: false,
     alergias: "Penicilina, mariscos",
     medicamentos: "Ibuprofeno 400mg",
     enfermedadesPrevias: "Hipertensión controlada",
     cirugiasPrevias: "Ninguna"
   }
   ```
3. Guarda en `ConsentSignature.editableFieldsData` (JSONB)
4. Actualiza `Appointment.hasConsent = true`

---

## 📊 Tipos de Campo Soportados

| Tipo | Frontend Component | Estilo | Ejemplo |
|------|-------------------|--------|---------|
| `text` | TextInput | `styles.input` | Nombre, medicamento |
| `textarea` | TextInput multiline | `styles.input + styles.textareaInput` | Alergias, enfermedades |

### Futuros (expandibles):
- `checkbox` → Booleano (sí/no)
- `select` → Picker/dropdown
- `date` → DatePicker
- `number` → Numeric input

---

## 🧪 Cómo Probar

### 1. Crear Template con Campos Dinámicos:
```sql
UPDATE consent_templates
SET editable_fields = '[
  {"name": "alergias", "label": "¿Tiene alergias?", "type": "textarea", "required": true},
  {"name": "medicamentos", "label": "Medicamentos actuales", "type": "text", "required": false}
]'
WHERE code = 'BOTOX_CONSENT';
```

### 2. Asignar Template a Servicio:
```sql
UPDATE services
SET consent_template_id = (SELECT id FROM consent_templates WHERE code = 'BOTOX_CONSENT'),
    requires_consent = true
WHERE name = 'Botox facial';
```

### 3. Flujo en App Mobile:
1. Crear turno con servicio que tiene `requiresConsent = true`
2. Iniciar turno (PENDING → IN_PROGRESS)
3. Al completar, modal de pago aparece
4. Después de pago, modal de consentimiento aparece
5. **Ver campos dinámicos** renderizados: "¿Tiene alergias?", "Medicamentos actuales"
6. Completar campos requeridos (marcados con *)
7. Firmar con canvas
8. Guardar → Backend registra en `editableFieldsData`

---

## 📄 Próximo Paso: Generación de PDF

### Necesidades:
1. **Biblioteca PDF**: Instalar `pdfkit` o `puppeteer`
2. **Template PDF**: Diseñar layout con:
   - Logo del negocio
   - Información del cliente
   - Fecha y hora
   - Texto del consentimiento
   - **Checkboxes** (✓/☐):
     - Términos y condiciones: `agreedToTerms`
     - Autorización de tratamiento: `agreedToTreatment`
     - Autorización de fotos: `agreedToPhotos`
   - **Campos dinámicos** iterados:
     ```
     Alergias: Penicilina, mariscos
     Medicamentos: Ibuprofeno 400mg
     ```
   - **Firma digital** (imagen base64 embebida)
   - Firma del especialista (si existe)
   - Información legal del negocio

3. **Servicio de Generación**:
   ```javascript
   // utils/pdfGenerator.js
   const generateConsentPDF = async (consentSignature, template) => {
     // Crear documento PDF
     // Insertar datos fijos
     // Iterar editableFields y rellenar valores
     // Dibujar checkboxes marcados
     // Insertar firma como imagen
     // Guardar en storage
     // Devolver URL
   };
   ```

4. **Endpoint de Generación**:
   ```javascript
   // POST /api/consent-signatures/:id/generate-pdf
   router.post('/:id/generate-pdf', async (req, res) => {
     const signature = await ConsentSignature.findByPk(id, {
       include: [ConsentTemplate, Client, Service]
     });
     
     const pdfUrl = await generateConsentPDF(signature);
     
     await signature.update({ pdfUrl });
     
     res.json({ success: true, pdfUrl });
   });
   ```

5. **Trigger Automático**:
   - Opción A: Generar inmediatamente después de `ConsentSignature.create()`
   - Opción B: Job en cola (Bull/BullMQ) para async
   - Opción C: Webhook/evento que dispara generación

---

## 🔍 Ejemplo de Datos Guardados

```javascript
// ConsentSignature record:
{
  id: "2ce2b68c-e2e4-45c0-94f1-b3476c0afecb",
  customerId: "abc123",
  consentTemplateId: "def456",
  appointmentId: "ghi789",
  signedBy: "María García",
  signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  signatureType: "DIGITAL",
  editableFieldsData: {
    clientIdNumber: "22528158",
    agreedToTerms: true,
    agreedToTreatment: true,
    agreedToPhotos: false,
    alergias: "Penicilina, látex",
    medicamentos: "Atorvastatina 20mg, Omeprazol 40mg",
    enfermedadesPrevias: "Hipertensión arterial controlada con medicación",
    cirugiasPrevias: "Apendicectomía (2015)"
  },
  templateVersion: "1.0",
  templateContent: "Este consentimiento informado...",
  pdfUrl: null, // Se llenará después de generar PDF
  signedAt: "2025-01-15T10:30:00Z"
}
```

---

## ✅ Ventajas del Sistema Dinámico

1. **Flexibilidad Total**: Cada template puede tener campos distintos sin cambiar código
2. **Escalabilidad**: Agregar nuevos campos es configuración, no desarrollo
3. **Trazabilidad**: `editableFieldsData` JSONB almacena todo lo capturado
4. **Legal**: `templateContent` snapshot garantiza versión exacta firmada
5. **UX**: Usuario solo ve campos relevantes para su tratamiento
6. **Admin-Friendly**: Administrador configura templates sin intervención técnica

---

## 📋 Checklist de Validación

- [x] Estado `editableFieldsData` inicializado
- [x] Función `handleEditableFieldChange` implementada
- [x] Función `renderEditableFields` creada
- [x] Campos dinámicos insertados en formulario
- [x] Validación de campos requeridos
- [x] Envío de datos en payload `clientData.editableFields`
- [x] Backend recibe y almacena en `editableFieldsData`
- [x] Estilo `textareaInput` agregado
- [ ] Prueba con template real con campos dinámicos
- [ ] Generación de PDF con campos llenados
- [ ] Visualización de PDF firmado

---

## 🚀 Estado Actual: LISTO PARA PRUEBAS

El sistema de campos dinámicos está **completamente implementado** y listo para pruebas. 

**Siguiente acción:** Probar con un template que tenga `editableFields` configurados, o comenzar con la generación de PDF.

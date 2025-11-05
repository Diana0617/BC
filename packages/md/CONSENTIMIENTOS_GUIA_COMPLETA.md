# 📋 Sistema de Consentimientos - Guía de Implementación

## 🎯 Visión General

Sistema completo para gestionar consentimientos legales que deben firmar los clientes antes de ciertos servicios (Botox, tatuajes, procedimientos estéticos, etc.).

---

## 📦 Modelos de Base de Datos

### 1. `ConsentTemplate` - Templates de Consentimiento

Almacena las plantillas reutilizables de consentimientos que crea cada negocio.

**Campos**:
- `businessId`: Negocio dueño del template
- `name`: Nombre del template (ej: "Consentimiento Botox")
- `code`: Código único (ej: "CONSENT_BOTOX_V1")
- `content`: HTML con placeholders
- `version`: Control de versiones (ej: "1.0.0")
- `category`: Categoría (ej: "ESTETICO", "MEDICO", "DEPILACION")
- `isActive`: Si está activo
- `editableFields`: Array de campos que debe completar el cliente
- `pdfConfig`: Configuración del PDF generado
- `requiredFields`: Campos adicionales requeridos (legacy)
- `metadata`: Metadatos adicionales

---

### 2. `ConsentSignature` - Firmas de Clientes

Registra cada vez que un cliente firma un consentimiento (con snapshot para trazabilidad legal).

**Campos**:
- `businessId`, `consentTemplateId`, `customerId`: Referencias
- `appointmentId`, `serviceId`: Contexto (opcional)
- `templateVersion`, `templateContent`: Snapshot del template firmado
- `signatureData`: Firma en base64
- `signatureType`: DIGITAL / UPLOADED / TYPED
- `signedAt`, `signedBy`: Datos de la firma
- `editableFieldsData`: Datos completados por el cliente
- `pdfUrl`, `pdfGeneratedAt`: PDF generado
- `ipAddress`, `userAgent`, `location`, `device`: Trazabilidad
- `status`: ACTIVE / REVOKED / EXPIRED
- `revokedAt`, `revokedReason`, `revokedBy`: Si se revocó

---

## 🏷️ Placeholders Disponibles

Estos placeholders se reemplazan automáticamente al mostrar/firmar el consentimiento:

### **Datos del Negocio** (desde `Business`)
```
{{negocio_nombre}}         → "Salón de Belleza Venus"
{{negocio_logo}}           → URL del logo (para incluir en PDF)
{{negocio_direccion}}      → "Calle 123 #45-67, Bogotá"
{{negocio_telefono}}       → "+57 300 123 4567"
{{negocio_email}}          → "contacto@salonvenus.com"
{{negocio_nit}}            → "900123456-7"
```

### **Datos del Cliente** (desde `Customer`)
```
{{cliente_nombre}}         → "María Fernanda García López"
{{cliente_nombre_corto}}   → "María García"
{{cliente_email}}          → "maria@email.com"
{{cliente_telefono}}       → "+57 300 987 6543"
{{cliente_documento}}      → "1234567890"
{{cliente_tipo_documento}} → "CC" / "TI" / "CE"
```

### **Datos del Servicio** (desde `Service`)
```
{{servicio_nombre}}        → "Aplicación de Botox Frontal"
{{servicio_descripcion}}   → "Procedimiento estético..."
{{servicio_duracion}}      → "60 minutos"
{{servicio_precio}}        → "$200,000"
```

### **Datos de la Cita** (desde `Appointment`)
```
{{cita_fecha}}             → "20 de Octubre de 2025"
{{cita_hora}}              → "10:00 AM"
{{especialista_nombre}}    → "Dra. Ana Martínez"
```

### **Datos Automáticos**
```
{{fecha_firma}}            → Fecha actual cuando firma (ej: "14/10/2025")
{{hora_firma}}             → Hora actual cuando firma (ej: "14:30")
{{fecha_firma_completa}}   → "Lunes 14 de Octubre de 2025, 2:30 PM"
```

---

## 📝 Campos Editables (Ejemplos)

Campos que el cliente debe completar al momento de firmar:

```json
[
  {
    "name": "fecha_nacimiento",
    "label": "Fecha de Nacimiento",
    "type": "date",
    "required": true,
    "placeholder": "DD/MM/AAAA"
  },
  {
    "name": "alergias",
    "label": "¿Tiene alguna alergia?",
    "type": "textarea",
    "required": true,
    "placeholder": "Describa sus alergias o escriba 'Ninguna'"
  },
  {
    "name": "medicamentos_actuales",
    "label": "Medicamentos que toma actualmente",
    "type": "textarea",
    "required": false,
    "placeholder": "Liste los medicamentos o escriba 'Ninguno'"
  },
  {
    "name": "condiciones_medicas",
    "label": "Condiciones médicas relevantes",
    "type": "checkbox",
    "required": false,
    "options": [
      { "value": "diabetes", "label": "Diabetes" },
      { "value": "hipertension", "label": "Hipertensión" },
      { "value": "embarazo", "label": "Embarazo" },
      { "value": "lactancia", "label": "Lactancia" }
    ]
  },
  {
    "name": "acepta_condiciones",
    "label": "Acepto las condiciones",
    "type": "checkbox",
    "required": true,
    "options": [
      { "value": "acepto", "label": "He leído y acepto las condiciones" }
    ]
  }
]
```

**Tipos de campos soportados**:
- `text`: Texto corto
- `textarea`: Texto largo
- `date`: Fecha
- `number`: Número
- `checkbox`: Casillas de verificación
- `radio`: Selección única
- `select`: Dropdown

---

## 🎨 Editor de Templates (Frontend)

### **Librería Recomendada: TinyMCE**

```jsx
import { Editor } from '@tinymce/tinymce-react';

function ConsentTemplateEditor({ value, onChange }) {
  return (
    <Editor
      apiKey="your-api-key"
      value={value}
      init={{
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'placeholders | removeformat | help',
        
        // Botón custom para insertar placeholders
        setup: (editor) => {
          editor.ui.registry.addMenuButton('placeholders', {
            text: 'Placeholders',
            fetch: (callback) => {
              const items = [
                {
                  type: 'nestedmenuitem',
                  text: 'Negocio',
                  getSubmenuItems: () => [
                    { type: 'menuitem', text: 'Nombre', onAction: () => editor.insertContent('{{negocio_nombre}}') },
                    { type: 'menuitem', text: 'Dirección', onAction: () => editor.insertContent('{{negocio_direccion}}') },
                    { type: 'menuitem', text: 'Teléfono', onAction: () => editor.insertContent('{{negocio_telefono}}') }
                  ]
                },
                {
                  type: 'nestedmenuitem',
                  text: 'Cliente',
                  getSubmenuItems: () => [
                    { type: 'menuitem', text: 'Nombre', onAction: () => editor.insertContent('{{cliente_nombre}}') },
                    { type: 'menuitem', text: 'Email', onAction: () => editor.insertContent('{{cliente_email}}') },
                    { type: 'menuitem', text: 'Teléfono', onAction: () => editor.insertContent('{{cliente_telefono}}') }
                  ]
                },
                {
                  type: 'nestedmenuitem',
                  text: 'Servicio',
                  getSubmenuItems: () => [
                    { type: 'menuitem', text: 'Nombre', onAction: () => editor.insertContent('{{servicio_nombre}}') },
                    { type: 'menuitem', text: 'Descripción', onAction: () => editor.insertContent('{{servicio_descripcion}}') }
                  ]
                },
                {
                  type: 'menuitem',
                  text: 'Fecha de Firma',
                  onAction: () => editor.insertContent('{{fecha_firma}}')
                }
              ];
              callback(items);
            }
          });
        }
      }}
      onEditorChange={onChange}
    />
  );
}
```

---

## 📄 Ejemplo de Template HTML

```html
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <!-- Header con logo -->
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="{{negocio_logo}}" alt="Logo" style="max-width: 200px; height: auto;">
    <h1>{{negocio_nombre}}</h1>
    <p>{{negocio_direccion}} | {{negocio_telefono}}</p>
  </div>

  <!-- Título -->
  <h2 style="text-align: center; color: #333;">
    CONSENTIMIENTO INFORMADO PARA {{servicio_nombre}}
  </h2>

  <!-- Datos del cliente -->
  <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
    <strong>Datos del Cliente:</strong><br>
    Nombre: {{cliente_nombre}}<br>
    Documento: {{cliente_documento}}<br>
    Teléfono: {{cliente_telefono}}<br>
    Email: {{cliente_email}}
  </div>

  <!-- Contenido del consentimiento -->
  <div style="line-height: 1.6; text-align: justify;">
    <h3>1. NATURALEZA DEL PROCEDIMIENTO</h3>
    <p>
      Por medio del presente documento, yo <strong>{{cliente_nombre}}</strong>, 
      identificado(a) con documento <strong>{{cliente_documento}}</strong>, 
      declaro que he sido informado(a) de manera clara y completa sobre el procedimiento 
      de <strong>{{servicio_nombre}}</strong> que será realizado el día 
      <strong>{{cita_fecha}}</strong> a las <strong>{{cita_hora}}</strong> 
      por <strong>{{especialista_nombre}}</strong>.
    </p>

    <h3>2. RIESGOS Y COMPLICACIONES</h3>
    <p>
      He sido informado(a) sobre los posibles riesgos y complicaciones que pueden derivarse 
      de este procedimiento, incluyendo pero no limitándose a: [detallar riesgos específicos 
      del procedimiento].
    </p>

    <h3>3. BENEFICIOS ESPERADOS</h3>
    <p>
      Entiendo que los beneficios esperados de este procedimiento incluyen: [detallar beneficios].
    </p>

    <h3>4. ALTERNATIVAS</h3>
    <p>
      He sido informado(a) sobre alternativas disponibles y las consecuencias de no realizar 
      el procedimiento.
    </p>

    <h3>5. DECLARACIÓN DE COMPRENSIÓN</h3>
    <ul>
      <li>He leído y comprendido toda la información proporcionada</li>
      <li>He tenido la oportunidad de hacer preguntas</li>
      <li>Todas mis dudas han sido resueltas satisfactoriamente</li>
      <li>Acepto voluntariamente someterme a este procedimiento</li>
    </ul>
  </div>

  <!-- Firma -->
  <div style="margin-top: 40px; border-top: 2px solid #333; padding-top: 20px;">
    <p>
      <strong>Firma del Cliente:</strong> _______________________________<br>
      <strong>Nombre:</strong> {{cliente_nombre}}<br>
      <strong>Documento:</strong> {{cliente_documento}}<br>
      <strong>Fecha:</strong> {{fecha_firma}}<br>
      <strong>Hora:</strong> {{hora_firma}}
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
    <p>
      Documento generado por {{negocio_nombre}}<br>
      {{negocio_direccion}} | {{negocio_telefono}} | {{negocio_email}}
    </p>
  </div>
</div>
```

---

## 🔄 Flujo Completo de Uso

### **Paso 1: Crear Template** (Admin del Negocio)

```javascript
// Frontend - Crear template
POST /api/business/:businessId/consent-templates
{
  "name": "Consentimiento Botox",
  "code": "CONSENT_BOTOX_V1",
  "category": "ESTETICO",
  "content": "<html>... contenido con placeholders ...</html>",
  "editableFields": [
    {
      "name": "alergias",
      "label": "¿Tiene alergias?",
      "type": "textarea",
      "required": true
    }
  ],
  "pdfConfig": {
    "includeLogo": true,
    "fontSize": 12
  }
}
```

---

### **Paso 2: Asociar Template a Servicio** (Al crear/editar servicio)

```javascript
// Frontend - Crear servicio
POST /api/business/:businessId/services
{
  "name": "Aplicación de Botox Frontal",
  "price": 200000,
  "duration": 60,
  "requiresConsent": true,
  "consentTemplateId": "uuid-del-template-creado"
}
```

---

### **Paso 3: Cliente Firma Consentimiento** (Durante la cita)

```javascript
// 1. Frontend - Obtener template con datos reemplazados
GET /api/business/:businessId/consent-templates/:templateId/render
Query: { customerId, appointmentId, serviceId }

// Response: HTML con placeholders reemplazados
{
  "htmlContent": "<html>... con datos reales ...</html>",
  "editableFields": [...],
  "customer": { nombre, email, ... },
  "business": { nombre, logo, ... }
}

// 2. Cliente lee, completa campos editables, firma
// 3. Frontend - Enviar firma
POST /api/business/:businessId/consent-signatures
{
  "consentTemplateId": "uuid",
  "customerId": "uuid",
  "appointmentId": "uuid",
  "serviceId": "uuid",
  "signatureData": "data:image/png;base64,...",
  "signatureType": "DIGITAL",
  "signedBy": "María Fernanda García",
  "editableFieldsData": {
    "alergias": "Ninguna",
    "medicamentos_actuales": "Ibuprofeno 400mg"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}

// Backend:
// 1. Valida datos
// 2. Crea snapshot del template
// 3. Genera PDF con firma
// 4. Almacena PDF en storage
// 5. Guarda ConsentSignature con pdfUrl
```

---

### **Paso 4: Descargar PDF Firmado**

```javascript
// Frontend - Descargar PDF
GET /api/business/:businessId/consent-signatures/:signatureId/pdf

// Backend:
// 1. Verifica permisos
// 2. Recupera PDF del storage
// 3. Retorna archivo PDF
```

---

## 📦 Generación de PDF (Backend)

### **Opción 1: PDFKit** (Recomendada)

```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateConsentPDF(signature) {
  const doc = new PDFDocument({ margin: 50 });
  const pdfPath = `uploads/consents/${signature.id}.pdf`;
  const stream = fs.createWriteStream(pdfPath);
  
  doc.pipe(stream);
  
  // Header con logo
  if (signature.template.pdfConfig.includeLogo && signature.business.logo) {
    doc.image(signature.business.logo, 50, 45, { width: 100 });
  }
  
  // Título
  doc.fontSize(18).text(signature.template.name, { align: 'center' });
  doc.moveDown();
  
  // Contenido HTML parseado (necesitas html-to-pdfmake o similar)
  // ... renderizar el HTML con datos reemplazados
  
  // Firma del cliente
  if (signature.signatureData) {
    doc.image(signature.signatureData, 50, doc.y, { width: 200 });
  }
  
  // Footer
  doc.fontSize(10).text(`Firmado el ${signature.signedAt}`, { align: 'center' });
  
  doc.end();
  
  return new Promise((resolve) => {
    stream.on('finish', () => resolve(pdfPath));
  });
}
```

---

### **Opción 2: Puppeteer** (Más fácil pero más pesado)

```javascript
const puppeteer = require('puppeteer');

async function generateConsentPDF(htmlContent, signatureData) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Inyectar firma en el HTML
  const htmlWithSignature = htmlContent.replace(
    '{{FIRMA_PLACEHOLDER}}',
    `<img src="${signatureData}" style="width: 200px;">`
  );
  
  await page.setContent(htmlWithSignature);
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '50px', bottom: '50px', left: '50px', right: '50px' },
    printBackground: true
  });
  
  await browser.close();
  
  // Guardar PDF
  const pdfPath = `uploads/consents/${Date.now()}.pdf`;
  fs.writeFileSync(pdfPath, pdfBuffer);
  
  return pdfPath;
}
```

---

## 🎯 Próximos Pasos de Implementación

1. ✅ Modelos actualizados con campos de PDF
2. ⏳ Crear Controllers para CRUD de templates
3. ⏳ Crear endpoint de render (reemplazar placeholders)
4. ⏳ Crear endpoint de firma (con generación de PDF)
5. ⏳ Frontend: Editor TinyMCE para crear templates
6. ⏳ Frontend: Visor de consentimiento y firma digital
7. ⏳ Frontend: Descarga de PDF firmado

---

## 📚 Recursos

- **TinyMCE**: https://www.tiny.cloud/
- **PDFKit**: http://pdfkit.org/
- **Puppeteer**: https://pptr.dev/
- **html-to-pdfmake**: https://github.com/Aymkdn/html-to-pdfmake
- **React Signature Canvas**: https://github.com/agilgur5/react-signature-canvas

---

¿Quieres que continuemos con la implementación de los controllers y endpoints? 🚀

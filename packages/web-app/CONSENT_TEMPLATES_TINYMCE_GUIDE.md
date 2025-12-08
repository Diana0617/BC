# 📝 Sistema de Consentimientos - Configuración TinyMCE

## 🎯 Descripción

Sistema completo de gestión de plantillas de consentimiento informado con editor de texto enriquecido (TinyMCE).

## 📦 Instalación

### 1. Instalar TinyMCE React

Ya instalado en el proyecto:

```bash
npm install @tinymce/tinymce-react@6.3.0
```

### 2. Obtener API Key de TinyMCE

TinyMCE requiere una API key gratuita:

1. Ve a: https://www.tiny.cloud/auth/signup/
2. Crea una cuenta gratuita
3. Ve a: https://www.tiny.cloud/my-account/dashboard/
4. Copia tu API Key
5. Pégala en el componente `ConsentTemplateEditor.jsx` línea ~359:

```jsx
<Editor
  apiKey="TU_API_KEY_AQUI" // ⚠️ Reemplazar esto
  ...
/>
```

### 3. Configuración Recomendada (Opcional)

Para uso en producción, puedes usar variables de entorno:

**`.env`:**
```bash
REACT_APP_TINYMCE_API_KEY=tu_api_key_aqui
```

**`ConsentTemplateEditor.jsx`:**
```jsx
<Editor
  apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
  ...
/>
```

## 🗂️ Estructura de Componentes

```
packages/web-app/src/
├── components/
│   ├── consent/
│   │   ├── ConsentTemplateEditor.jsx       ✅ Editor completo con TinyMCE
│   │   └── ConsentTemplateModal.jsx        ✅ Modal para SELECCIONAR plantilla
│   └── services/
│       └── ConsentTemplateModal.jsx        ✅ Modal similar (puede eliminarse)
└── pages/
    └── ConsentTemplatesPage.jsx            ✅ Página principal de gestión
```

## 🎨 Características del Editor

### ✅ Implementadas

- **Editor TinyMCE** con toolbar completo
- **Variables/Placeholders** dinámicos con botones:
  - Datos del negocio: `{{negocio_nombre}}`, `{{negocio_direccion}}`, etc.
  - Datos del cliente: `{{cliente_nombre}}`, `{{cliente_email}}`, etc.
  - Datos del servicio: `{{servicio_nombre}}`
  - Fechas: `{{fecha_firma}}`, `{{fecha_cita}}`
- **Categorización** de plantillas (Estético, Médico, etc.)
- **Versionamiento automático** al editar contenido
- **Vista previa** con placeholders visualizados
- **Filtros** por búsqueda, categoría y estado
- **Validaciones** de campos requeridos

### 📋 Campos del Modelo

```javascript
{
  id: UUID,
  businessId: UUID,
  name: String,              // Nombre de la plantilla
  code: String,              // Código único (no editable)
  content: TEXT,             // HTML del editor TinyMCE
  version: String,           // Auto-incrementado
  category: String,          // ESTETICO, MEDICO, etc.
  editableFields: JSONB,     // Campos que el cliente completa
  pdfConfig: JSONB,          // Configuración del PDF
  isActive: Boolean,         // Estado activo/inactivo
  metadata: JSONB            // Datos adicionales
}
```

## 🔄 Flujo de Trabajo

### 1. Crear/Editar Plantilla

```
ConsentTemplatesPage
  └── Click "Nueva Plantilla"
      └── ConsentTemplateEditor (Modal)
          ├── Formulario básico (nombre, código, categoría)
          ├── Editor TinyMCE con toolbar completo
          └── Panel de variables (sidebar)
              └── Click en variable → se inserta en el editor
```

### 2. Asignar Plantilla a Servicio

```
ServiceFormModal
  └── Click "Asignar Consentimiento"
      └── ConsentTemplateModal
          ├── Lista de plantillas activas
          └── Seleccionar → Guarda consentTemplateId en Service
```

### 3. Cliente Firma Consentimiento

```
1. Cliente agenda cita
2. Sistema muestra plantilla del servicio
3. Placeholders se reemplazan con datos reales
4. Cliente completa campos editables
5. Cliente firma digitalmente
6. Se guarda ConsentSignature con:
   - templateContent (snapshot con datos)
   - signatureData (firma digital)
   - editableFieldsData (campos completados)
```

## 🎛️ Configuración TinyMCE

### Plugins Habilitados

```javascript
plugins: [
  'advlist',        // Listas avanzadas
  'autolink',       // Auto-detectar links
  'lists',          // Listas numeradas/viñetas
  'link',           // Insertar links
  'image',          // Insertar imágenes
  'charmap',        // Caracteres especiales
  'preview',        // Vista previa
  'anchor',         // Anclas
  'searchreplace',  // Buscar y reemplazar
  'visualblocks',   // Bloques visuales
  'code',           // Ver código HTML
  'fullscreen',     // Pantalla completa
  'insertdatetime', // Insertar fecha/hora
  'media',          // Insertar media
  'table',          // Tablas
  'help',           // Ayuda
  'wordcount'       // Contador de palabras
]
```

### Toolbar

```
undo redo | blocks | 
bold italic forecolor | 
alignleft aligncenter alignright alignjustify | 
bullist numlist outdent indent | 
removeformat | help
```

## 🚀 Uso

### Página de Gestión

```jsx
import ConsentTemplatesPage from './pages/ConsentTemplatesPage';

// En tus rutas:
<Route path="/consent-templates" element={<ConsentTemplatesPage />} />
```

### Usar Editor Directamente

```jsx
import ConsentTemplateEditor from './components/consent/ConsentTemplateEditor';

<ConsentTemplateEditor
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSave={async (templateData) => {
    // Tu lógica de guardado
    await dispatch(createConsentTemplate({ businessId, data: templateData }));
  }}
  template={null} // null = crear nuevo, objeto = editar
  businessId={businessId}
/>
```

## 🔐 Backend - Endpoints

```
GET    /api/business/:businessId/consent-templates
GET    /api/business/:businessId/consent-templates/:templateId
POST   /api/business/:businessId/consent-templates
PUT    /api/business/:businessId/consent-templates/:templateId
DELETE /api/business/:businessId/consent-templates/:templateId
```

## 📊 Redux

```javascript
import { 
  fetchConsentTemplates, 
  createConsentTemplate,
  updateConsentTemplate,
  deleteConsentTemplate
} from '@shared/store/slices/consentSlice';

// Listar
dispatch(fetchConsentTemplates({ businessId, params: { activeOnly: true } }));

// Crear
dispatch(createConsentTemplate({ businessId, data: templateData }));

// Actualizar
dispatch(updateConsentTemplate({ businessId, templateId, data: templateData }));

// Eliminar (soft delete)
dispatch(deleteConsentTemplate({ businessId, templateId, hardDelete: false }));
```

## 🎨 Personalización

### Agregar más placeholders

Edita `ConsentTemplateEditor.jsx`:

```javascript
const placeholders = [
  // ... placeholders existentes
  { 
    label: 'Mi Nuevo Campo', 
    value: '{{mi_campo}}',
    description: 'Descripción del campo'
  }
];
```

Luego en el backend (`consentController.js`), agrega el reemplazo:

```javascript
processedContent = processedContent
  .replace(/\{\{mi_campo\}\}/g, valorDelCampo);
```

### Agregar más categorías

Edita ambos archivos:

**`ConsentTemplateEditor.jsx`:**
```javascript
const categories = [
  // ... categorías existentes
  { value: 'MI_CATEGORIA', label: 'Mi Categoría' }
];
```

**`ConsentTemplatesPage.jsx`:**
```javascript
const categories = [
  // ... categorías existentes
  { value: 'MI_CATEGORIA', label: 'Mi Categoría' }
];
```

## 📝 Ejemplo de Plantilla

```html
<h2>CONSENTIMIENTO INFORMADO - {{servicio_nombre}}</h2>

<p>Yo, <strong>{{cliente_nombre}}</strong>, identificado(a) con documento <strong>{{cliente_documento}}</strong>, manifiesto que:</p>

<ol>
  <li>He sido informado(a) sobre el procedimiento de <strong>{{servicio_nombre}}</strong></li>
  <li>Comprendo los riesgos y beneficios del tratamiento</li>
  <li>Autorizo a <strong>{{negocio_nombre}}</strong> a realizar el procedimiento</li>
</ol>

<p>Fecha: {{fecha_firma}}</p>

<hr>

<p><strong>{{negocio_nombre}}</strong><br>
{{negocio_direccion}}<br>
Tel: {{negocio_telefono}}</p>
```

## 🐛 Troubleshooting

### Error: "This domain is not registered with Tiny Cloud"

**Solución:** Necesitas registrar tu dominio en TinyMCE Cloud:
1. Ve a https://www.tiny.cloud/my-account/domains/
2. Agrega `localhost` para desarrollo
3. Agrega tu dominio de producción

### El editor no carga

**Solución:** Verifica:
- ✅ API key configurada correctamente
- ✅ Conexión a internet activa
- ✅ No hay bloqueadores de ads/scripts

### Variables no se reemplazan

**Solución:** Verifica que los placeholders:
- Sean exactamente iguales: `{{cliente_nombre}}` (con dobles llaves)
- No tengan espacios extra
- Estén implementados en el backend (`consentController.js`)

## 📚 Recursos

- **TinyMCE Docs:** https://www.tiny.cloud/docs/
- **TinyMCE React:** https://www.tiny.cloud/docs/integrations/react/
- **API Reference:** https://www.tiny.cloud/docs/api/

## ✅ Checklist de Implementación

- [x] TinyMCE instalado
- [x] Editor component creado
- [x] Página de gestión creada
- [x] Redux configurado
- [x] Backend endpoints funcionando
- [ ] API Key de TinyMCE configurada
- [ ] Rutas agregadas en el router
- [ ] Probado en navegador
- [ ] Variables funcionando correctamente

## 🎉 ¡Listo!

Una vez configures la API key de TinyMCE, el sistema estará 100% funcional para crear y gestionar plantillas de consentimiento.

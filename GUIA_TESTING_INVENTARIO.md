# 🧪 Guía de Testing - Sistema de Inventario y Productos

## 📋 Índice
1. [Gestión de Productos](#gestión-de-productos)
2. [Stock Inicial](#stock-inicial)
3. [Facturas de Proveedor](#facturas-de-proveedor)
4. [Catálogo de Proveedores](#catálogo-de-proveedores)
5. [Movimientos de Inventario](#movimientos-de-inventario)
6. [Casos de Prueba](#casos-de-prueba)

---

## 1. Gestión de Productos

### Ubicación
`Inventario → Productos`

### Funcionalidades a Probar

#### ✅ Crear Producto Nuevo
1. Click en "Nuevo Producto"
2. Completar campos obligatorios:
   - Nombre
   - SKU (único)
   - Precio de venta
   - Costo unitario
3. Campos opcionales:
   - Descripción
   - Código de barras
   - Categoría
   - Marca
   - Unidad de medida
   - **Imágenes** (hasta 5, máx 5MB cada una)
4. Activar/desactivar "Controlar inventario"
5. Guardar

**Esperado:**
- Producto se crea exitosamente
- Si hay imágenes, se suben a Cloudinary y se guardan las URLs
- El producto aparece en la lista de productos
- Si "Controlar inventario" está activo, aparece en Stock Inicial

#### ✅ Editar Producto
1. Click en el ícono de lápiz en un producto
2. Modificar campos necesarios
3. **Agregar/eliminar imágenes**
4. Guardar cambios

**Esperado:**
- Cambios se guardan correctamente
- Imágenes se actualizan en el catálogo (si el producto está en él)

#### ✅ Cargar Imágenes
1. Click en "Subir Imagen"
2. Seleccionar JPG, PNG o WEBP (máx 5MB)
3. Verificar preview
4. Eliminar imagen con botón X

**Esperado:**
- Imagen se sube a Cloudinary
- Preview se muestra correctamente
- Eliminación funciona sin errores

---

## 2. Stock Inicial

### Ubicación
`Inventario → Stock → Carga Inicial`

### Funcionalidades a Probar

#### ✅ Carga Manual de Stock
1. Seleccionar sucursal (obligatorio)
2. Click en un producto de la lista disponible
3. Ingresar cantidad y costo unitario
4. Agregar más productos si es necesario
5. Verificar total de inversión
6. Click en "Cargar Stock"
7. Confirmar

**Esperado:**
- Solo productos sin stock (currentStock = 0) aparecen en lista
- Se crea movimiento de inventario tipo `INITIAL_STOCK`
- Stock del producto se actualiza
- **Producto se agrega al Catálogo de Proveedores automáticamente**
- Productos exitosos se eliminan de la lista
- Si hay errores, se muestran detalles y productos fallidos permanecen

**Validaciones:**
- No se puede cargar stock inicial si el producto ya tiene stock
- Cantidad debe ser > 0
- Costo unitario debe ser > 0

#### ✅ Carga Masiva por CSV
1. Click en "Descargar Plantilla" para ver formato
2. Preparar archivo CSV con:
   - SKU, Nombre Producto, Descripción, Barcode, Categoría, Precio Venta, Costo Unitario, Cantidad, Unidad
3. Campos obligatorios: SKU, Nombre, Precio Venta, Costo Unitario, Cantidad
4. Campos opcionales: Descripción, Barcode (dejar vacíos)
5. Seleccionar archivo CSV

**Esperado:**
- Si el producto NO existe, se crea automáticamente
- Si el producto existe, solo se carga el stock
- Validaciones muestran errores por línea
- Productos válidos se agregan a la lista para revisar antes de confirmar

**Formato CSV:**
```csv
SKU,Nombre Producto,Descripción,Barcode,Categoría,Precio Venta,Costo Unitario,Cantidad,Unidad
PROD001,Shampoo Keratina 500ml,Shampoo reparador,7501234567890,Cuidado Capilar,45000,25000,10,unidad
PROD002,Tinte Rubio Ceniza,,,Coloración,35000,18000,5,unidad
```

---

## 3. Facturas de Proveedor

### Ubicación
`Inventario → Compras → Facturas`

### Funcionalidades a Probar

#### ✅ Crear Factura (Paso 1: Proveedor)
1. Click en "Nueva Factura"
2. Elegir entre:
   - **Proveedor existente**: Seleccionar de lista
   - **Proveedor nuevo**: Completar datos del proveedor

**Campos de proveedor:**
- Nombre (obligatorio)
- Email
- Teléfono
- NIT/RUT
- Dirección
- Ciudad
- País
- Persona de contacto
- Términos de pago (días)

#### ✅ Crear Factura (Paso 2: Items)
1. Completar datos de factura:
   - Número de factura (obligatorio)
   - Fecha de emisión
   - Fecha de vencimiento (se calcula automáticamente)
   - IVA incluido o no
   - Porcentaje de IVA
2. Agregar productos:
   - **Opción A: Producto existente** (seleccionar de lista)
   - **Opción B: Crear producto nuevo** (marcar checkbox)

**Para producto nuevo:**
- Nombre (obligatorio)
- SKU (obligatorio)
- Categoría
- Marca
- **Imágenes del producto** (NUEVA FUNCIONALIDAD)
  - Click en "Agregar Imagen"
  - Seleccionar JPG, PNG o WEBP (máx 5MB)
  - Ver preview
  - Eliminar con botón X si es necesario

3. Para cada item, ingresar:
   - Cantidad
   - Costo unitario
4. Verificar total calculado
5. Opcional: Subir archivo adjunto (PDF o imagen de la factura física)

#### ✅ Crear Factura (Paso 3: Resumen y Confirmación)
1. Revisar:
   - Datos del proveedor
   - Número de factura
   - Items y cantidades
   - Subtotal, IVA, Total
2. Click en "Crear Factura"

**Esperado:**
- Factura se crea con estado `PENDING`
- Si se crearon productos nuevos:
  - Se guardan con sus imágenes
  - Aparecen en lista de productos
  - Están listos para ser usados
- Archivo adjunto se sube a Cloudinary si fue proporcionado

#### ✅ Aprobar Factura
1. En lista de facturas, click en factura `PENDING`
2. Click en "Aprobar"
3. Confirmar aprobación

**Esperado:**
- Estado cambia a `APPROVED`
- Se crean movimientos de inventario tipo `PURCHASE` por cada item
- Stock de productos se incrementa
- **Items se agregan/actualizan en Catálogo de Proveedores**
- **Imágenes de productos se copian al catálogo** (producto.images → catalogItem.images)

**Importante:** 
- Si el producto se creó con imágenes, esas imágenes también aparecerán en el catálogo
- El catálogo usa la clave única: `businessId + supplierSku`

#### ✅ Rechazar Factura
1. Click en factura `PENDING`
2. Click en "Rechazar"
3. Ingresar motivo del rechazo
4. Confirmar

**Esperado:**
- Estado cambia a `REJECTED`
- NO se crean movimientos de inventario
- NO se actualiza el stock
- NO se agrega al catálogo

---

## 4. Catálogo de Proveedores

### Ubicación
`Inventario → Catálogo de Proveedores`

### ¿Qué es?
Base de datos de productos que has comprado a proveedores, con historial de precios y disponibilidad.

### ¿Cómo se alimenta?
El catálogo se crea **automáticamente** desde dos fuentes:

1. **Al aprobar facturas de proveedor**
   - Cada item de la factura se agrega al catálogo
   - Si ya existe (mismo businessId + supplierSku), se actualiza
   - Se copia la imagen del producto al catálogo

2. **Al cargar stock inicial**
   - Los productos cargados se agregan al catálogo
   - Se marcan con `supplierId = null` (stock inicial sin proveedor específico)

### Funcionalidades a Probar

#### ✅ Ver Catálogo
1. Acceder a Catálogo de Proveedores
2. Verificar lista de productos

**Campos mostrados:**
- **Imagen del producto** (si existe)
- Nombre
- SKU del proveedor
- Categoría
- Marca
- Precio actual
- Última compra
- Estado de disponibilidad

#### ✅ Filtrar Catálogo
1. **Por disponibilidad:**
   - Todos
   - Disponibles
   - No disponibles

2. **Por proveedor:**
   - Todos
   - Seleccionar proveedor específico

3. **Por precio:**
   - Rango mínimo - máximo

4. **Por búsqueda:**
   - Buscar por nombre, SKU o categoría

**Esperado:**
- Filtros se aplican correctamente
- Combinación de filtros funciona
- Búsqueda encuentra coincidencias

#### ✅ Descargar PDF del Catálogo
1. Aplicar filtros deseados
2. Click en "Descargar PDF"

**Esperado:**
- PDF se genera con los items filtrados
- Incluye información de cada producto
- Logo del negocio aparece (si está configurado)

#### ✅ Verificar Imágenes en Catálogo
1. Crear producto con imagen
2. Crear factura de proveedor con ese producto
3. Aprobar factura
4. Ir a Catálogo de Proveedores
5. Verificar que la imagen aparece

**Esperado:**
- Imagen del producto se muestra en el catálogo
- Si no hay imagen, aparece placeholder de ícono

---

## 5. Movimientos de Inventario

### Ubicación
`Inventario → Stock → Movimientos`

### Tipos de Movimientos

#### 📥 INITIAL_STOCK
- **Origen:** Carga inicial de stock
- **Efecto:** Incrementa stock
- **Referencia:** N/A
- **Requiere aprobación:** No

#### 📥 PURCHASE
- **Origen:** Factura de proveedor aprobada
- **Efecto:** Incrementa stock
- **Referencia:** Número de factura y proveedor
- **Requiere aprobación:** Sí (aprobar factura)

#### 📤 SALE
- **Origen:** Venta de producto
- **Efecto:** Reduce stock
- **Referencia:** ID de venta/cita
- **Requiere aprobación:** No (automático)

#### 🔧 ADJUSTMENT
- **Origen:** Ajuste manual de inventario
- **Efecto:** Incrementa o reduce stock
- **Referencia:** Motivo del ajuste
- **Requiere aprobación:** Depende de configuración

### Funcionalidades a Probar

#### ✅ Ver Historial de Movimientos
1. Filtrar por:
   - Producto
   - Tipo de movimiento
   - Rango de fechas
   - Sucursal
2. Verificar información mostrada:
   - Fecha y hora
   - Tipo de movimiento
   - Producto
   - Cantidad
   - Stock anterior → Stock nuevo
   - Usuario que realizó el movimiento
   - Referencia (factura, venta, etc.)

---

## 6. Casos de Prueba

### 🧪 Caso 1: Flujo Completo - Producto Nuevo con Imagen desde Factura

**Pasos:**
1. Ir a "Productos" y verificar que el producto no existe
2. Crear factura de proveedor
3. Marcar "Crear producto nuevo"
4. Completar datos: Nombre, SKU, Categoría
5. **Subir imagen del producto** (JPG, 2MB)
6. Ingresar cantidad y costo
7. Crear factura (queda en PENDING)
8. Aprobar factura
9. Verificar:
   - Producto creado con imagen en "Productos"
   - Stock actualizado en el producto
   - Movimiento tipo PURCHASE creado
   - **Item aparece en Catálogo con la imagen**

**Resultado Esperado:** ✅ Todo el flujo funciona, la imagen aparece en producto y catálogo

---

### 🧪 Caso 2: Stock Inicial → Catálogo

**Pasos:**
1. Crear producto nuevo sin imagen
2. Ir a "Stock Inicial"
3. Seleccionar sucursal
4. Agregar el producto recién creado
5. Ingresar cantidad: 10, costo: $5000
6. Confirmar carga
7. Verificar:
   - Stock del producto = 10
   - Movimiento tipo INITIAL_STOCK creado
   - **Producto aparece en Catálogo** (sin proveedor, supplierId = null)

**Resultado Esperado:** ✅ Producto en catálogo sin proveedor asignado

---

### 🧪 Caso 3: Múltiples Imágenes en Producto

**Pasos:**
1. Crear/editar producto
2. Subir 3 imágenes diferentes
3. Guardar
4. Crear factura con ese producto
5. Aprobar factura
6. Ir a Catálogo de Proveedores
7. Verificar que aparece la primera imagen

**Resultado Esperado:** ✅ Array de imágenes se guarda, catálogo muestra primera imagen

---

### 🧪 Caso 4: Producto Ya con Stock - No Permitir Stock Inicial

**Pasos:**
1. Crear producto y cargarle stock inicial (10 unidades)
2. Intentar volver a cargar stock inicial del mismo producto
3. Verificar error

**Resultado Esperado:** ❌ "El producto ya tiene stock registrado" - No permite carga

---

### 🧪 Caso 5: CSV con Productos Nuevos e Imágenes

**Pasos:**
1. Preparar CSV con 5 productos nuevos
2. Campos: SKU, Nombre, Descripción, Barcode, Categoría, Precio, Costo, Cantidad, Unidad
3. Cargar archivo
4. Confirmar carga
5. Editar cada producto para agregar imagen
6. Crear factura con 2 de esos productos
7. Aprobar factura
8. Verificar catálogo

**Resultado Esperado:** ✅ Productos creados, solo los de la factura en catálogo con imágenes

---

### 🧪 Caso 6: Filtros del Catálogo

**Pasos:**
1. Asegurar tener productos de diferentes proveedores en catálogo
2. Filtrar por "Disponibles"
3. Filtrar por proveedor específico
4. Aplicar rango de precios
5. Buscar por texto
6. Combinar varios filtros
7. Limpiar filtros

**Resultado Esperado:** ✅ Cada filtro funciona correctamente, se pueden combinar

---

### 🧪 Caso 7: Rechazo de Factura - No Afecta Catálogo

**Pasos:**
1. Crear factura con producto nuevo (con imagen)
2. Verificar estado PENDING
3. Rechazar factura con motivo
4. Verificar:
   - Estado = REJECTED
   - Producto creado existe pero sin stock
   - NO aparece en catálogo
   - NO hay movimiento de inventario

**Resultado Esperado:** ✅ Rechazo no crea movimientos ni actualiza catálogo

---

### 🧪 Caso 8: Validaciones de Imagen

**Pasos:**
1. Intentar subir archivo PDF → ❌ Error: solo imágenes
2. Intentar subir imagen de 10MB → ❌ Error: máx 5MB
3. Intentar subir imagen de 2MB JPG → ✅ Éxito
4. Subir 5 imágenes → ✅ Permitido
5. Intentar agregar 6ta imagen → ❌ Error: máximo 5

**Resultado Esperado:** ✅ Validaciones funcionan correctamente

---

## 📊 Checklist Final de Testing

### Productos
- [ ] Crear producto con imágenes
- [ ] Editar producto y modificar imágenes
- [ ] Eliminar imágenes de producto
- [ ] Validaciones de formato y tamaño de imagen
- [ ] Producto con "Controlar inventario" activo

### Stock Inicial
- [ ] Carga manual de stock (1 producto)
- [ ] Carga manual de stock (múltiples productos)
- [ ] Carga por CSV con productos existentes
- [ ] Carga por CSV con productos nuevos
- [ ] Validación: no permitir doble carga inicial
- [ ] Mensaje de error detallado si falla
- [ ] Productos exitosos se eliminan de lista

### Facturas de Proveedor
- [ ] Crear factura con proveedor nuevo
- [ ] Crear factura con proveedor existente
- [ ] Crear producto nuevo en factura con imágenes
- [ ] Usar producto existente en factura
- [ ] Aprobar factura → stock aumenta
- [ ] Aprobar factura → aparece en catálogo con imagen
- [ ] Rechazar factura → no afecta stock ni catálogo
- [ ] Subir archivo adjunto (PDF de factura física)

### Catálogo de Proveedores
- [ ] Visualizar catálogo completo
- [ ] Verificar imágenes se muestran correctamente
- [ ] Filtrar por disponibilidad
- [ ] Filtrar por proveedor
- [ ] Filtrar por rango de precios
- [ ] Buscar por texto
- [ ] Combinar múltiples filtros
- [ ] Descargar PDF del catálogo
- [ ] Items de stock inicial aparecen sin proveedor
- [ ] Items de facturas aparecen con proveedor

### Movimientos de Inventario
- [ ] Ver historial completo
- [ ] Filtrar por tipo de movimiento
- [ ] Filtrar por producto
- [ ] Filtrar por fechas
- [ ] Verificar INITIAL_STOCK en movimientos
- [ ] Verificar PURCHASE en movimientos
- [ ] Referencias correctas (factura, venta, etc.)

---

## 🐛 Bugs Conocidos Resueltos

1. ✅ **Imágenes no aparecían en catálogo:** Resuelto - ahora se copian desde product.images al aprobar factura
2. ✅ **Where clause incorrecto:** Resuelto - ahora usa {businessId, supplierSku}
3. ✅ **Stock inicial sin error detallado:** Resuelto - muestra errores por producto
4. ✅ **No se podían subir imágenes en facturas:** Resuelto - nuevo componente de carga

---

## 📞 Contacto para Reporte de Bugs

Al encontrar un error, reportar con:
1. **URL y página** donde ocurre
2. **Pasos exactos** para reproducir
3. **Resultado esperado** vs **resultado obtenido**
4. **Screenshots** si es posible
5. **Console errors** (F12 → Console)
6. **Datos de prueba** usados (SKU, nombres, etc.)

---

**Última actualización:** 22 de noviembre, 2025
**Versión del sistema:** develop branch

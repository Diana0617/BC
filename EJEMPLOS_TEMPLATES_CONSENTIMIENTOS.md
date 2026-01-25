# 📝 Ejemplos de Templates de Consentimientos

## Variables Disponibles

### 🏢 Datos del Negocio
- `{{negocio_logo}}` - Logo del negocio (imagen)
- `{{negocio_nombre}}` - Nombre del negocio
- `{{negocio_direccion}}` - Dirección física
- `{{negocio_telefono}}` - Teléfono de contacto
- `{{negocio_email}}` - Correo electrónico

### 👤 Datos del Cliente
- `{{cliente_nombre_completo}}` - Nombre y apellido completo
- `{{cliente_nombre}}` - Solo el nombre
- `{{cliente_apellido}}` - Solo el apellido
- `{{cliente_email}}` - Correo electrónico
- `{{cliente_telefono}}` - Teléfono
- `{{cliente_tipo_documento}}` - Tipo (CC, DNI, Pasaporte, etc.)
- `{{cliente_numero_documento}}` - Número de documento
- `{{cliente_documento_completo}}` - Tipo y número (ej: CC: 1234567890)
- `{{cliente_fecha_nacimiento}}` - Fecha de nacimiento (DD/MM/AAAA)
- `{{cliente_edad}}` - Edad calculada (ej: 25 años)

### 💆 Datos del Servicio
- `{{servicio_nombre}}` - Nombre del procedimiento/servicio

### 📅 Fechas
- `{{fecha_firma}}` - Fecha actual de firma
- `{{fecha_cita}}` - Fecha de la cita programada

---

## 📋 Template 1: Tratamiento Estético Básico

```html
<h2 style="text-align: center;">CONSENTIMIENTO INFORMADO</h2>
<h3 style="text-align: center;">TRATAMIENTO ESTÉTICO</h3>

<p><strong>DATOS DEL PACIENTE:</strong></p>
<ul>
  <li>Nombre Completo: <strong>{{cliente_nombre_completo}}</strong></li>
  <li>Documento: <strong>{{cliente_documento_completo}}</strong></li>
  <li>Edad: <strong>{{cliente_edad}}</strong></li>
  <li>Teléfono: <strong>{{cliente_telefono}}</strong></li>
  <li>Email: <strong>{{cliente_email}}</strong></li>
</ul>

<p><strong>TRATAMIENTO A REALIZAR:</strong> {{servicio_nombre}}</p>

<h4>DECLARACIÓN DE CONSENTIMIENTO</h4>

<p>Yo, <strong>{{cliente_nombre_completo}}</strong>, identificado(a) con <strong>{{cliente_documento_completo}}</strong>, de <strong>{{cliente_edad}}</strong>, por medio del presente documento:</p>

<ol>
  <li><strong>DECLARO</strong> que he sido informado(a) de manera clara y completa sobre el procedimiento <strong>{{servicio_nombre}}</strong> que será realizado en <strong>{{negocio_nombre}}</strong>.</li>
  
  <li><strong>CERTIFICO</strong> que:
    <ul>
      <li>✓ No padezco enfermedades cardíacas, renales, hepáticas o metabólicas</li>
      <li>✓ No estoy embarazada ni en período de lactancia</li>
      <li>✓ No tengo alergias conocidas a los productos que se utilizarán</li>
      <li>✓ No estoy tomando medicamentos que puedan interferir con el tratamiento</li>
    </ul>
  </li>
  
  <li><strong>AUTORIZO</strong> expresamente a <strong>{{negocio_nombre}}</strong> para realizar el tratamiento solicitado.</li>
  
  <li><strong>COMPRENDO</strong> que los resultados pueden variar según las características individuales de cada persona.</li>
  
  <li><strong>ME COMPROMETO</strong> a seguir todas las indicaciones post-tratamiento proporcionadas por el profesional.</li>
</ol>

<p style="margin-top: 30px;">Firmado en <strong>{{negocio_nombre}}</strong>, el <strong>{{fecha_firma}}</strong></p>
```

---

## 💉 Template 2: Procedimientos Invasivos (Botox, Rellenos)

```html
<h2 style="text-align: center;">CONSENTIMIENTO INFORMADO</h2>
<h3 style="text-align: center;">PROCEDIMIENTO DE MEDICINA ESTÉTICA</h3>

<p><strong>IDENTIFICACIÓN DEL PACIENTE:</strong></p>
<p>Yo, <strong>{{cliente_nombre_completo}}</strong>, identificado(a) con documento <strong>{{cliente_tipo_documento}}</strong> número <strong>{{cliente_numero_documento}}</strong>, nacido(a) el <strong>{{cliente_fecha_nacimiento}}</strong> (<strong>{{cliente_edad}}</strong>),</p>

<p><strong>PROCEDIMIENTO:</strong> {{servicio_nombre}}</p>
<p><strong>CENTRO:</strong> {{negocio_nombre}}</p>
<p><strong>UBICACIÓN:</strong> {{negocio_direccion}}</p>
<p><strong>CONTACTO:</strong> {{negocio_telefono}}</p>

<h4>1. INFORMACIÓN SOBRE EL PROCEDIMIENTO</h4>
<p>He sido informado(a) de manera clara sobre:</p>
<ul>
  <li>La naturaleza del procedimiento {{servicio_nombre}}</li>
  <li>Los beneficios esperados del tratamiento</li>
  <li>Los riesgos y complicaciones posibles</li>
  <li>Las alternativas de tratamiento disponibles</li>
  <li>El tiempo de recuperación esperado</li>
</ul>

<h4>2. RIESGOS Y COMPLICACIONES</h4>
<p>Entiendo que, como todo procedimiento médico, existen riesgos que incluyen pero no se limitan a:</p>
<ul>
  <li>Hematomas o moretones temporales en la zona tratada</li>
  <li>Enrojecimiento, hinchazón o sensibilidad</li>
  <li>Reacciones alérgicas a los productos utilizados</li>
  <li>Asimetría que puede requerir corrección</li>
  <li>Resultados que no cumplan completamente mis expectativas</li>
</ul>

<h4>3. DECLARACIÓN DE SALUD</h4>
<p><strong>CERTIFICO QUE:</strong></p>
<ul>
  <li>✓ No estoy embarazada ni en período de lactancia</li>
  <li>✓ No tengo enfermedades autoinmunes</li>
  <li>✓ No padezco trastornos de coagulación</li>
  <li>✓ No he tenido reacciones alérgicas previas a procedimientos similares</li>
  <li>✓ He informado sobre todos mis antecedentes médicos relevantes</li>
  <li>✓ He informado sobre todos los medicamentos que estoy tomando</li>
</ul>

<h4>4. AUTORIZACIÓN Y COMPROMISO</h4>
<p>Por medio de la presente:</p>
<ul>
  <li><strong>AUTORIZO</strong> la realización del procedimiento descrito</li>
  <li><strong>ME COMPROMETO</strong> a seguir todas las indicaciones pre y post-procedimiento</li>
  <li><strong>ACEPTO</strong> la responsabilidad por cualquier información incorrecta proporcionada</li>
  <li><strong>COMPRENDO</strong> que los resultados pueden variar y no están garantizados</li>
</ul>

<h4>5. FOTOGRAFÍAS Y DOCUMENTACIÓN</h4>
<p>Autorizo la toma de fotografías del antes y después del tratamiento con fines de seguimiento médico y documentación del procedimiento.</p>

<p style="margin-top: 40px;"><strong>Firma del Paciente:</strong></p>
<p><strong>Nombre:</strong> {{cliente_nombre_completo}}</p>
<p><strong>Documento:</strong> {{cliente_documento_completo}}</p>
<p><strong>Fecha:</strong> {{fecha_firma}}</p>
```

---

## 🪒 Template 3: Depilación Láser

```html
<h2 style="text-align: center;">CONSENTIMIENTO INFORMADO</h2>
<h3 style="text-align: center;">DEPILACIÓN LÁSER</h3>

<div style="border: 2px solid #333; padding: 15px; margin: 20px 0;">
  <p><strong>DATOS DEL PACIENTE:</strong></p>
  <p>Nombre: <strong>{{cliente_nombre_completo}}</strong></p>
  <p>Documento: <strong>{{cliente_documento_completo}}</strong></p>
  <p>Edad: <strong>{{cliente_edad}}</strong></p>
  <p>Contacto: <strong>{{cliente_telefono}}</strong></p>
</div>

<h4>INFORMACIÓN DEL TRATAMIENTO</h4>
<p>Yo, <strong>{{cliente_nombre_completo}}</strong>, he sido informado(a) que el tratamiento de depilación láser:</p>

<ul>
  <li>Requiere múltiples sesiones (generalmente 6-8) para resultados óptimos</li>
  <li>Los resultados varían según el tipo de piel y vello</li>
  <li>Puede causar molestias temporales durante la aplicación</li>
  <li>Requiere evitar la exposición solar antes y después de cada sesión</li>
</ul>

<h4>CONTRAINDICACIONES</h4>
<p><strong>DECLARO QUE NO:</strong></p>
<ul>
  <li>❌ Estoy embarazada o en período de lactancia</li>
  <li>❌ Tengo infecciones activas en la zona a tratar</li>
  <li>❌ He tomado sol o usado camas de bronceado en las últimas 2 semanas</li>
  <li>❌ Estoy tomando medicamentos fotosensibilizantes</li>
  <li>❌ Tengo antecedentes de cicatrización queloide</li>
  <li>❌ Padezco epilepsia o trastornos convulsivos</li>
</ul>

<h4>CUIDADOS POST-TRATAMIENTO</h4>
<p><strong>ME COMPROMETO A:</strong></p>
<ol>
  <li>Evitar la exposición solar directa por 2 semanas</li>
  <li>Usar protector solar FPS 50+ en la zona tratada</li>
  <li>No depilar con cera, pinzas o métodos que arranquen el vello</li>
  <li>Hidratar la piel según indicaciones</li>
  <li>Reportar cualquier reacción adversa inmediatamente</li>
</ol>

<h4>AUTORIZACIÓN</h4>
<p>Autorizo a <strong>{{negocio_nombre}}</strong> para realizar el tratamiento de depilación láser, habiendo comprendido toda la información proporcionada.</p>

<p style="margin-top: 30px;">
  <strong>Paciente:</strong> {{cliente_nombre_completo}}<br>
  <strong>Documento:</strong> {{cliente_documento_completo}}<br>
  <strong>Fecha:</strong> {{fecha_firma}}<br>
  <strong>Centro:</strong> {{negocio_nombre}}<br>
  <strong>Teléfono:</strong> {{negocio_telefono}}
</p>
```

---

## 🎨 Template 4: Tatuajes y Micropigmentación

```html
<h2 style="text-align: center;">CONSENTIMIENTO INFORMADO</h2>
<h3 style="text-align: center;">TATUAJE / MICROPIGMENTACIÓN</h3>

<p><strong>IDENTIFICACIÓN:</strong></p>
<ul>
  <li>Nombre: <strong>{{cliente_nombre_completo}}</strong></li>
  <li>Documento: <strong>{{cliente_documento_completo}}</strong></li>
  <li>Edad: <strong>{{cliente_edad}}</strong></li>
  <li>Fecha de nacimiento: <strong>{{cliente_fecha_nacimiento}}</strong></li>
  <li>Teléfono: <strong>{{cliente_telefono}}</strong></li>
</ul>

<p><strong>SERVICIO:</strong> {{servicio_nombre}}</p>
<p><strong>ESTUDIO:</strong> {{negocio_nombre}}</p>

<h4>DECLARACIÓN DEL CLIENTE</h4>

<p>Yo, <strong>{{cliente_nombre_completo}}</strong>, DECLARO que:</p>

<ol>
  <li><strong>SOY MAYOR DE EDAD</strong> (mayor de 18 años) según consta en mi documento de identidad.</li>
  
  <li><strong>ESTADO DE SALUD:</strong>
    <ul>
      <li>✓ No padezco diabetes</li>
      <li>✓ No tengo problemas de coagulación</li>
      <li>✓ No estoy embarazada ni amamantando</li>
      <li>✓ No tengo alergias conocidas a tintas o anestésicos</li>
      <li>✓ No tengo enfermedades de la piel en la zona a tatuar</li>
      <li>✓ No tengo antecedentes de cicatrización queloide</li>
    </ul>
  </li>
  
  <li><strong>HE SIDO INFORMADO(A) SOBRE:</strong>
    <ul>
      <li>El diseño y ubicación del tatuaje/micropigmentación</li>
      <li>Los cuidados necesarios durante la cicatrización</li>
      <li>Los riesgos de infección si no se siguen las indicaciones</li>
      <li>La permanencia del tatuaje y dificultad de remoción</li>
      <li>Los posibles cambios de color con el tiempo</li>
    </ul>
  </li>
  
  <li><strong>ME COMPROMETO A:</strong>
    <ul>
      <li>Seguir estrictamente las instrucciones de cuidado</li>
      <li>Mantener la zona limpia y protegida</li>
      <li>No exponerme al sol durante la cicatrización</li>
      <li>No sumergir el tatuaje en piscinas, mar o jacuzzis</li>
      <li>Contactar al estudio ante cualquier complicación</li>
    </ul>
  </li>
</ol>

<h4>AUTORIZACIÓN</h4>
<p>Autorizo a <strong>{{negocio_nombre}}</strong> y su equipo profesional para realizar el trabajo acordado, habiendo leído y comprendido todo lo anterior.</p>

<div style="margin-top: 40px; border-top: 2px solid #000; padding-top: 20px;">
  <p><strong>Firma del Cliente</strong></p>
  <p>Nombre: <strong>{{cliente_nombre_completo}}</strong></p>
  <p>Documento: <strong>{{cliente_documento_completo}}</strong></p>
  <p>Edad: <strong>{{cliente_edad}}</strong></p>
  <p>Fecha: <strong>{{fecha_firma}}</strong></p>
</div>

<div style="margin-top: 20px; padding: 10px; background-color: #f0f0f0;">
  <p style="font-size: 10px;"><strong>{{negocio_nombre}}</strong> | {{negocio_direccion}} | Tel: {{negocio_telefono}}</p>
</div>
```

---

## 💡 Consejos para Crear Templates

1. **Usa las variables del cliente** para personalizar automáticamente cada documento
2. **Incluye edad y documento** para validación legal
3. **Estructura clara** con títulos y listas para fácil lectura
4. **Declaraciones específicas** según el tipo de procedimiento
5. **Información de contacto** del negocio al final
6. **Sección de firma** claramente identificada
7. **Fecha automática** usando `{{fecha_firma}}`

## ⚠️ Importante

- Las variables se reemplazan automáticamente cuando el cliente firma
- Si un cliente no tiene un campo (ej: fecha de nacimiento), la variable se reemplazará por texto vacío
- El PDF generado incluirá automáticamente la firma digital del cliente
- Todos los datos quedan registrados con fecha y hora para cumplimiento legal

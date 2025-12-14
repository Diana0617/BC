# Tarjetas de Fidelización PDF - Guía Rápida

## 🎴 ¿Qué son las Tarjetas de Fidelización?

Son tarjetas físicas personalizadas en formato PDF que los negocios pueden imprimir y entregar a sus clientes. Cada tarjeta incluye:

- Logo del negocio
- Nombre del cliente
- Puntos acumulados
- Código de referido único
- **Código QR** para consultar puntos instantáneamente
- Colores personalizados del negocio

**Tamaño:** 85.6mm x 53.98mm (mismo tamaño que una tarjeta de crédito)

---

## 🚀 Uso Rápido

**IMPORTANTE:** Los clientes NO tienen acceso a la web/app. Solo el personal del negocio (Business) genera e imprime las tarjetas para entregarlas físicamente a los clientes.

### Para el Negocio (Business)

#### 1️⃣ **Generar tarjeta de un cliente específico**

```bash
GET /api/loyalty/business/client/{clientId}/card/pdf
Authorization: Bearer <business-token>

# Descarga: tarjeta-{clientId}.pdf
```

**Caso de uso:** Recepcionista registra nuevo cliente y le imprime su tarjeta en el momento.

#### 2️⃣ **Generar múltiples tarjetas en una hoja A4**

```bash
POST /api/loyalty/business/cards/bulk-pdf
Authorization: Bearer <business-token>
Content-Type: application/json

{
  "clients": [
    { "clientId": "uuid-1", "points": 1500 },
    { "clientId": "uuid-2", "points": 2300 },
    { "clientId": "uuid-3", "points": 800 },
    ...hasta 10 clientes por página
  ]
}

# Descarga: tarjetas-fidelizacion-{timestamp}.pdf
```

**Caso de uso:** Owner quiere imprimir tarjetas para todos sus clientes frecuentes de una sola vez.

**Formato:** Hoja A4 con 10 tarjetas (2 columnas x 5 filas). Imprimir, recortar y entregar.

---

## 🎨 Personalización de Colores

### Configurar en el Panel de Administración

```javascript
// Navegar a: Configuración → Branding → Colores de Fidelización

{
  "BRANDING_PRIMARY_COLOR": "#8B5CF6",      // Color principal de la tarjeta
  "BRANDING_SECONDARY_COLOR": "#EC4899",    // Color para gradiente
  "BRANDING_ACCENT_COLOR": "#F59E0B",       // Color de los puntos
  "BRANDING_TEXT_COLOR": "#1F2937",         // Color del texto
  "BRANDING_BACKGROUND_COLOR": "#FFFFFF",   // Color de fondo
  "BRANDING_USE_GRADIENT": true             // ¿Usar gradiente?
}
```

### Paletas Predefinidas

**Salón Moderno:**
- Primario: `#EC4899` (Rosa)
- Secundario: `#8B5CF6` (Púrpura)
- Acento: `#F59E0B` (Dorado)

**Spa Wellness:**
- Primario: `#10B981` (Verde)
- Secundario: `#14B8A6` (Turquesa)
- Acento: `#34D399` (Verde claro)

**Barbería Clásica:**
- Primario: `#1F2937` (Negro)
- Secundario: `#374151` (Gris)
- Acento: `#EF4444` (Rojo)
- Gradiente: `false` (fondo sólido)

---

## 📋 Casos de Uso

### 1. **Entrega Inmediata al Registrarse**

```
Cliente nuevo → Recepcionista registra → Genera tarjeta PDF → Imprime → Entrega
```

**Ventaja:** El cliente sale con su tarjeta y puede empezar a acumular puntos.

### 2. **Cliente Consulta sus Puntos con el QR**

```
Cliente escanea QR con su teléfono → Ve sus puntos actualizados → Decide canjear
```

**Ventaja:** Cliente puede verificar sus puntos en cualquier momento sin necesidad de app o login.

### 3. **Campaña de Renovación**

```
Dueño del negocio selecciona clientes activos → Genera PDF bulk → Imprime 50 tarjetas → Entrega en próxima visita
```

**Ventaja:** Incentiva a clientes regulares y mejora retención.

### 4. **Regalo de Bienvenida**

```
Cliente completa primera cita → Recepcionista imprime tarjeta con puntos de bienvenida → Explica programa y QR
```

**Ventaja:** Engagement inmediato y explicación visual del programa.

---

## 🖨️ Consejos de Impresión

### Papel Recomendado
- **Cartulina**: 250-300 g/m² (tarjetas rígidas)
- **Papel fotográfico**: 200 g/m² (acabado brillante)
- **Papel mate**: 200 g/m² (acabado profesional)

### Impresoras
- **Inyección de tinta**: Buena calidad, más lenta
- **Láser color**: Rápida, ideal para bulk
- **Impresora de tarjetas PVC**: Máxima durabilidad (requiere equipo especial)

### Acabados
- **Laminado**: Protege contra agua y desgaste
- **Plastificado**: Mayor durabilidad
- **Recorte con esquinas redondeadas**: Aspecto más profesional

---

## 🔧 Dependencias Técnicas

```json
{
  "pdfkit": "^0.17.2",    // Generación de PDFs
  "axios": "^1.x.x",      // Descarga de logos desde URLs
  "qrcode": "^1.x.x"      // Generación de códigos QR
}
```

**Nota:** Todas las dependencias ya están instaladas en el proyecto.

---

## 🐛 Troubleshooting

### El logo no aparece en la tarjeta

**Causa:** URL del logo inválida o no accesible.

**Solución:**
1. Verificar que el campo `logo` del negocio tenga una URL válida
2. Asegurar que la URL sea accesible públicamente
3. Verificar que sea una imagen (PNG, JPG, WebP)

### Los colores no se aplican

**Causa:** Las reglas de branding no están configuradas para el negocio.

**Solución:**
```bash
# Ejecutar seed de reglas (solo una vez en el sistema)
node packages/backend/scripts/seed-rule-templates.js

# El dueño del negocio debe configurar los colores desde su panel de administración
# Ruta: Configuración → Branding → Colores de Fidelización
```

### El PDF está en blanco

**Causa:** Datos del cliente no encontrados.

**Solución:**
1. Verificar que el `clientId` exista en la base de datos
2. Verificar que el cliente esté asociado al negocio (`business_clients`)
3. Verificar que el cliente tenga un `referralCode` generado

---

## 📚 Recursos Adicionales

- [Documentación completa del sistema](./LOYALTY_SYSTEM.md)
- [API Endpoints](./LOYALTY_SYSTEM.md#api-endpoints)
- [Configuración de branding](./LOYALTY_SYSTEM.md#configuración-de-branding)
- [Ejemplos de paletas](./LOYALTY_SYSTEM.md#ejemplos-de-paletas-de-colores-por-industria)

---

## � Código QR

Cada tarjeta incluye un código QR que al escanearlo:

- **Muestra los puntos actuales del cliente**
- **No requiere login ni autenticación**
- **Actualizado en tiempo real**
- **Incluye nombre del cliente y código de referido**

### Endpoint Público

```bash
GET /api/loyalty/public/check/{referralCode}
# Sin autenticación requerida

# Respuesta:
{
  "success": true,
  "data": {
    "clientName": "Juan Pérez",
    "points": 1500,
    "referralCode": "REF-ABC123",
    "referralCount": 3
  }
}
```

### Página de Consulta

El QR apunta a: `https://tudominio.com/check-points/{referralCode}`

Esta página debe:
1. Extraer el `referralCode` de la URL
2. Llamar al endpoint público
3. Mostrar los puntos de forma amigable
4. (Opcional) Mostrar recompensas disponibles

---

## 🔮 Próximas Funcionalidades

- [x] Código QR en la tarjeta para escaneo rápido ✅
- [ ] Foto del cliente en la tarjeta
- [ ] Niveles/Tiers (Bronce, Plata, Oro, Platinum)
- [ ] Diseños alternativos (vertical, A6, etc.)
- [ ] Marcas de corte para impresión profesional

---

## 📞 Soporte

¿Problemas con las tarjetas? Contacta al equipo de desarrollo o revisa la documentación técnica completa en `LOYALTY_SYSTEM.md`.

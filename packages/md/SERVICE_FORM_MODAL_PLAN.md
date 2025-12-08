# 🎯 Plan de Actualización - ServiceFormModal

## Cambios a Implementar:

### 1. **Nuevo Estado para Paquetes**
```javascript
const [isPackage, setIsPackage] = useState(false)
const [packageType, setPackageType] = useState('SINGLE')
const [packageConfig, setPackageConfig] = useState({
  sessions: 3,
  sessionInterval: 30,
  maintenanceSessions: 6,
  maintenanceInterval: 30,
  description: '',
  pricing: {}
})
```

### 2. **Nueva Sección en el Form** (después de precio)
- Checkbox: "¿Es un paquete multi-sesión?"
- Si es paquete:
  - Radio buttons: MULTI_SESSION | WITH_MAINTENANCE
  - Configuración dinámica según tipo
  
### 3. **Configuración MULTI_SESSION**
- Número de sesiones (min 2)
- Intervalo entre sesiones (días)
- Precio por sesión
- Descuento opcional

### 4. **Configuración WITH_MAINTENANCE**
- Precio sesión principal
- Número de mantenimientos
- Precio por mantenimiento
- Intervalo entre mantenimientos

### 5. **Cálculo Automático de Precio Total**
- Mostrar precio calculado
- Permitir pago parcial (checkbox)

### 6. **Validaciones**
- Si es paquete: validar configuración
- Precio total debe ser > 0
- Sesiones >= 2 para MULTI_SESSION

## Diseño Móvil-First
- Inputs grandes (min-height 44px)
- Espaciado generoso
- Botones grandes y fáciles de tocar
- Grid responsive (1 columna móvil, 2 en tablet+)

¿Procedemos con la implementación?

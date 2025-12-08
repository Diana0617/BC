# 📋 Guía de Migraciones de Base de Datos

## ⚠️ IMPORTANTE: Sincronización Automática vs Migraciones

### 🚨 Problema: Sincronización Automática en Producción

**NO usar `sequelize.sync({ alter: true })` en producción** porque:

1. **Modifica la estructura** de las tablas cada vez que el servidor arranca
2. **Ejecuta ALTER TABLE** en cada inicio (lento y riesgoso)
3. **Puede causar problemas** con constraints, foreign keys y datos existentes
4. **No es reversible** - no hay control de versiones de los cambios

### ✅ Solución: Migraciones Manuales

## 🔧 Configuración de Entornos

### Desarrollo Local
```env
DISABLE_SYNC=false    # Permite sync automático para desarrollo rápido
FORCE_SYNC_DB=false   # NO borrar datos
```

### Producción (Railway/Vercel)
```env
DISABLE_SYNC=true     # ⚠️ OBLIGATORIO: Desactivar sync automático
FORCE_SYNC_DB=false   # ⚠️ NUNCA usar true en producción
```

## 📝 Crear una Nueva Migración

### 1. Crear archivo de migración

Ubicación: `packages/backend/scripts/migrations/`

Formato: `XXX_descripcion_del_cambio.js`

Ejemplo: `001_add_business_specialist_role.js`

```javascript
#!/usr/bin/env node
require('dotenv').config();
const { sequelize } = require('../../src/models');

async function runMigration() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');
    
    console.log('🔄 Iniciando migración...\n');
    
    // Paso 1: Ejemplo - Agregar valor a ENUM
    console.log('📝 Paso 1: Agregando valor al enum...');
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'NUEVO_VALOR'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_tabla_columna'
          )
        ) THEN
          ALTER TYPE "enum_tabla_columna" ADD VALUE 'NUEVO_VALOR';
          RAISE NOTICE 'Valor agregado exitosamente';
        ELSE
          RAISE NOTICE 'Valor ya existe';
        END IF;
      END $$;
    `);
    console.log('✅ Paso 1 completado\n');
    
    // Paso 2: Ejemplo - Agregar columna
    console.log('📝 Paso 2: Agregando columna...');
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'tabla'
          AND column_name = 'nuevaColumna'
        ) THEN
          ALTER TABLE "tabla"
          ADD COLUMN "nuevaColumna" INTEGER NULL;
          
          COMMENT ON COLUMN "tabla"."nuevaColumna"
          IS 'Descripción de la columna';
          
          RAISE NOTICE 'Columna agregada exitosamente';
        ELSE
          RAISE NOTICE 'Columna ya existe';
        END IF;
      END $$;
    `);
    console.log('✅ Paso 2 completado\n');
    
    // Paso 3: Ejemplo - Actualizar datos
    console.log('📝 Paso 3: Actualizando datos...');
    const [results] = await sequelize.query(`
      UPDATE "tabla"
      SET "columna" = valor
      WHERE condicion
      RETURNING id, columna;
    `);
    console.log('✅ Datos actualizados:', results);
    
    console.log('\n✅ Migración completada exitosamente!\n');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada\n');
  }
}

runMigration()
  .then(() => {
    console.log('🎉 Migración finalizada exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Migración falló:', error);
    process.exit(1);
  });
```

### 2. Ejecutar migración

#### Desarrollo Local
```bash
cd packages/backend
node scripts/migrations/001_descripcion.js
```

#### Producción (con DATABASE_URL configurada)
```bash
cd packages/backend
# Asegurarse que DATABASE_URL apunta a producción
node scripts/migrations/001_descripcion.js
```

## 🎯 Buenas Prácticas

### ✅ Hacer

1. **Siempre usar `IF NOT EXISTS`** para hacer migraciones idempotentes
2. **Usar transacciones** para cambios complejos
3. **Validar en local** antes de ejecutar en producción
4. **Usar camelCase** para nombres de columnas (Sequelize usa camelCase)
5. **Documentar cada paso** con console.log descriptivos
6. **Incluir RETURNING** en UPDATE/INSERT para verificar cambios
7. **Cerrar conexión** en bloque finally

### ❌ Evitar

1. **NO usar `{ force: true }`** en producción (BORRA DATOS)
2. **NO usar `{ alter: true }`** en cada inicio del servidor
3. **NO usar snake_case** en nombres de columnas (usar camelCase)
4. **NO ejecutar sin probar** en local primero
5. **NO olvidar el bloque finally** para cerrar conexión

## 🔍 Verificar Estado de la BD

### Ver enums disponibles
```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
);
```

### Ver columnas de una tabla
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscription_plans';
```

### Ver constraints
```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tabla';
```

## 📚 Ejemplos de Migraciones Comunes

### Agregar valor a ENUM
```sql
ALTER TYPE "enum_users_role" ADD VALUE 'BUSINESS_SPECIALIST';
```

### Agregar columna nullable
```sql
ALTER TABLE "subscription_plans"
ADD COLUMN "maxServices" INTEGER NULL;
```

### Actualizar datos existentes
```sql
UPDATE "subscription_plans"
SET "maxUsers" = 1, "maxServices" = 10
WHERE "name" = 'Básico';
```

### Modificar columna con JSONB
```sql
UPDATE "subscription_plans"
SET "features" = jsonb_set(
  COALESCE("features", '{}'::jsonb),
  '{nueva_key}',
  '"valor"'::jsonb
)
WHERE "name" = 'Básico';
```

## 🚀 Flujo de Trabajo Recomendado

1. **Desarrollo Local**
   - Crear migración
   - Probar en BD local
   - Verificar que sea idempotente (ejecutarla 2 veces)

2. **Commit y Push**
   - Commitear archivo de migración
   - Push a rama desarrollo

3. **Producción**
   - Ejecutar migración manualmente en producción
   - Verificar que funcionó correctamente
   - Railway/Vercel se desplegará automáticamente con el código actualizado

4. **Verificación**
   - Confirmar que el servidor arranca sin errores
   - Verificar que las nuevas features funcionan
   - Monitorear logs por si hay problemas

## 🔐 Variables de Entorno en Railway

Asegurarse de configurar en Railway:

```
DISABLE_SYNC=true
FORCE_SYNC_DB=false
DATABASE_URL=postgresql://...
```

## 📞 Solución de Problemas

### Problema: "Column does not exist"
- **Causa:** Usando snake_case en lugar de camelCase
- **Solución:** Cambiar nombres a camelCase (maxUsers, not max_users)

### Problema: "Type already contains value"
- **Causa:** Valor ya existe en el enum
- **Solución:** Usar IF NOT EXISTS en la migración

### Problema: "Relation does not exist"
- **Causa:** Tabla no se ha creado aún
- **Solución:** Verificar orden de sincronización en server.js

### Problema: "Servidor modifica tablas en cada inicio"
- **Causa:** DISABLE_SYNC=false
- **Solución:** Cambiar a DISABLE_SYNC=true en producción

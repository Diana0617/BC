# 🔧 Guía Rápida: Agregar tu IP al Firewall de Azure

## Opción 1: Desde Azure Portal (Más Fácil)

1. Ve a: https://portal.azure.com
2. Busca: `beautycontrol-db`
3. Menú izquierdo → **Redes** (Networking)
4. Click en: **"+ Agregar dirección IP del cliente actual"**
5. Click en: **"Guardar"**
6. Espera 1 minuto
7. Vuelve a intentar la conexión

## Opción 2: Ver tu IP y agregarla manualmente

```powershell
# Ver tu IP pública
curl ifconfig.me

# Luego agrega esa IP en Azure Portal → beautycontrol-db → Redes
```

## Después de agregar tu IP:

```powershell
# Ejecutar el script de diagnóstico
$env:PGPASSWORD="BeautyControl2024!"
psql "host=beautycontrol-db.postgres.database.azure.com port=5432 dbname=beautycontrol user=dbadmin sslmode=require" -f check_specialist_schedules.sql
```

O ejecutar queries individuales:

```powershell
# Ver especialistas
$env:PGPASSWORD="BeautyControl2024!"
psql "host=beautycontrol-db.postgres.database.azure.com port=5432 dbname=beautycontrol user=dbadmin sslmode=require" -c "SELECT u.id, u.\"firstName\" || ' ' || u.\"lastName\" as nombre, u.\"branchId\", b.name as sucursal FROM \"Users\" u LEFT JOIN \"Branches\" b ON u.\"branchId\" = b.id WHERE u.\"businessId\" = 'f97e749b-36d3-48bd-b82f-42cd6f23ed86' AND u.role = 'SPECIALIST' AND u.\"deletedAt\" IS NULL;"
```

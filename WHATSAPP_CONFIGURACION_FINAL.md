# Configuración WhatsApp Business - Control de Negocios

## ✅ Estado Actual

**Todo está configurado correctamente en el código:**
- OAuth Redirect URIs: ✅
- Embedded Signup: ✅ (config_id: 884984130753544)
- System User: ✅ (beautycontrol-whatsapp - ID: 61587066625875)
- Activos asignados: ✅
- Código backend actualizado: ✅

**Pendiente en Meta:**
- ❌ Agregar método de pago en WhatsApp Manager

---

## 📱 Datos de Conexión CORRECTOS

### Número de WhatsApp (Producción)
- **Nombre verificado:** Control de Negocios
- **Número de teléfono:** +57 304 4731739
- **Phone Number ID:** `809471882259840` ⬅️ **USAR ESTE**
- **WABA ID:** `234893543888569`

### System User Token (válido 60 días)
```
EAAbaTrSIKlQBQv0zl2TJBm0fNL8mOZBSHPCFE1HZCNdPEOBPT5VUiL2qPkbmXoNrs8nfgwUL5dQVVH51pZCeGbI7j6CeBNN1jwXVV8TZBcEBaDgZCaZAkNOAiGXJhETWux7dmZB1mFizUxs7qNtZCw8gx7jDhBJzJpLFrGRIKYmcCMdtHk21HLfIZBTaKdEQPu8LZCYEwRHhQH5mxT8ZBHZCJvnFq76bA8ZCf88bhXt2jl1tZA
```

**⚠️ Este token expira en ~60 días. Antes de que expire, genera uno nuevo desde:**
https://business.facebook.com/settings/system-users/775167712218052

---

## 🔧 Pasos para Completar la Conexión

### 1. Agregar Método de Pago en Meta (CRÍTICO)

**Enlace directo:**
https://business.facebook.com/wa/manage/payment-settings/?waba_id=234893543888569

**Pasos:**
1. Ve al enlace anterior
2. Click en "Agregar método de pago"
3. Ingresa tarjeta de crédito/débito
4. Guarda

**Nota:** No se cobrará durante el período gratuito, pero es requisito obligatorio de Meta para poder enviar mensajes.

---

### 2. Guardar Token en Beauty Control

**Una vez agregues el método de pago:**

1. **Ve a:** https://www.controldenegocios.com/business/profile
2. **Pestaña:** WhatsApp
3. **Sección:** Manual Token Management
4. **Ingresa:**
   - **Access Token:** (copiar el token de arriba)
   - **Phone Number ID:** `809471882259840`
   - **WABA ID:** `234893543888569`
5. **Click:** Guardar

---

### 3. Verificar Conexión Exitosa

Después de guardar, deberías ver:
- ✅ Estado: "Conectado"
- ✅ Nombre: "Control de Negocios"
- ✅ Número: "+57 304 4731739"

---

## 🚀 Funcionalidades Disponibles

Una vez conectado correctamente:
- ✅ Enviar mensajes de texto a clientes
- ✅ Recibir respuestas de clientes
- ✅ Enviar recordatorios de citas
- ✅ Notificaciones automáticas
- ✅ Mensajes de confirmación de reservas

---

## 📋 Información Adicional

### Meta Developer Dashboard
- **App ID:** 1928881431390804
- **App Name:** Control de Negocios
- **URL:** https://developers.facebook.com/apps/1928881431390804/

### Business Manager
- **Business ID:** 775167712218052
- **URL:** https://business.facebook.com/settings/info/775167712218052

### WhatsApp Manager
- **URL:** https://business.facebook.com/wa/manage/home/
- **Account:** Control de Negocios

---

## ⚠️ Notas Importantes

1. **Token Expiration:** El token del System User expira en 60 días. Marca en el calendario para renovarlo antes.

2. **Embedded Signup:** Actualmente bloqueado hasta que Meta complete el BSP review. Una vez aprobado, los clientes podrán conectar WhatsApp con un solo click.

3. **Costos:** Meta cobra por conversación iniciada por el negocio después del período gratuito. Consulta precios en: https://business.whatsapp.com/products/platform-pricing

4. **Webhook:** Ya está configurado y funcionando en:
   - URL: https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp
   - Verify Token: beauty_control_webhook_verify_2024

---

## 🆘 Soporte

Si encuentras problemas:
1. Verifica que el método de pago esté agregado
2. Confirma que el token no haya expirado
3. Revisa logs de Azure: https://portal.azure.com (beautycontrol-api)
4. Consulta documentación de Meta: https://developers.facebook.com/docs/whatsapp/

---

**Última actualización:** 22 de enero de 2026

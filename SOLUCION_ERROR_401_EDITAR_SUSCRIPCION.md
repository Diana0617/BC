# 🔧 Solución: Error 401 en Edición de Suscripción - Panel Owner

## Problema Identificado

El componente `EditSubscriptionModal.jsx` estaba utilizando `fetch` directo con `localStorage.getItem('token')` en lugar de usar el cliente API configurado (`apiClient`). Esto causaba:

1. **Error 401 Unauthorized**: El token no se estaba enviando correctamente
2. **Error de async response**: Porque la manera de manejar la respuesta no era consistente con el resto de la aplicación

## Raíz del Problema

```javascript
// ❌ INCORRECTO - Lo que estaba haciendo:
const token = localStorage.getItem('token');
const response = await fetch(`${API_BASE_URL}/api/owner/subscriptions/${id}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

**Problemas:**
- `localStorage` puede no estar sincronizado con el token real
- No usa el cliente API configurado que maneja tokens de forma correcta
- No sigue el patrón de Redux establecido en la aplicación
- Acceso directo al localStorage es frágil

## Solución Implementada

### 1. ✅ Actualizaciones al API (`ownerSubscriptionsApi.js`)

Se agregó un nuevo endpoint para actualizar suscripciones de forma general:

```javascript
// Nuevo método en ownerSubscriptionsApi
async updateSubscription(subscriptionId, updateData) {
  try {
    const response = await api.patch(SUBSCRIPTIONS_ENDPOINTS.UPDATE(subscriptionId), updateData);
    return response.data.subscription || response.data.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

// Se agregó el endpoint:
UPDATE: (id) => `/api/owner/subscriptions/${id}`
```

### 2. ✅ Nuevo Thunk en Redux (`ownerSubscriptionSlice.js`)

Se agregó un nuevo `createAsyncThunk` para actualizar suscripciones:

```javascript
export const updateSubscription = createAsyncThunk(
  'ownerSubscriptions/updateSubscription',
  async ({ subscriptionId, updateData }, { rejectWithValue }) => {
    try {
      return await ownerSubscriptionsApi.updateSubscription(subscriptionId, updateData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar suscripción');
    }
  }
);
```

Con los handlers correspondientes en `extraReducers`:

```javascript
.addCase(updateSubscription.pending, (state) => {
  state.loading.updating = true;
  state.errors.update = null;
})
.addCase(updateSubscription.fulfilled, (state, action) => {
  state.loading.updating = false;
  const updatedSubscription = action.payload;
  
  // Update subscription in list
  const index = state.subscriptions.findIndex(s => s.id === updatedSubscription.id);
  if (index !== -1) {
    state.subscriptions[index] = { ...state.subscriptions[index], ...updatedSubscription };
  }
  
  // Update selected subscription if it's the same
  if (state.selectedSubscription?.id === updatedSubscription.id) {
    state.selectedSubscription = { ...state.selectedSubscription, ...updatedSubscription };
  }
})
.addCase(updateSubscription.rejected, (state, action) => {
  state.loading.updating = false;
  state.errors.update = action.payload;
})
```

### 3. ✅ Componente Actualizado (`EditSubscriptionModal.jsx`)

El componente ahora usa Redux en lugar de fetch directo:

**Antes (❌ Incorrecto):**
```jsx
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  setLoading(true);
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `${API_BASE_URL}/api/owner/subscriptions/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    }
  );
  // ... resto del manejo
};
```

**Después (✅ Correcto):**
```jsx
const { loading } = useSelector(state => state.ownerSubscription);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const result = await dispatch(updateSubscription({
      subscriptionId: subscriptionData.subscription.id,
      updateData
    }));

    if (updateSubscription.fulfilled.match(result)) {
      toast.success('Suscripción actualizada correctamente');
      onSuccess();
      onClose();
    } else {
      toast.error(result.payload || 'Error al actualizar la suscripción');
    }
  } catch (error) {
    console.error('Error al actualizar suscripción:', error);
    toast.error('Error al actualizar la suscripción');
  }
};
```

## Ventajas de la Solución

✅ **Token manejado correctamente**: El `apiClient` obtiene el token de forma segura desde `StorageHelper`  
✅ **Sigue el patrón Redux**: Consistente con otras acciones en la aplicación  
✅ **Estado Redux actualizado**: Los cambios se reflejan automáticamente en toda la UI  
✅ **Mejor manejo de errores**: Usa los mecanismos de Redux para errores  
✅ **Debugging más fácil**: Los logs de Redux muestran qué está pasando  
✅ **Reutilizable**: Otros componentes pueden usar el mismo thunk  

## Verificación de la Solución

### 1. Verificar que el token se envía correctamente

Abre las DevTools (F12) → Network y edita una suscripción. Deberías ver:

```
Request Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 2. Verificar en la consola

Deberías ver logs como:

```
🔑 getAuthToken (Web) from StorageHelper: eyJhbGc...
ApiClient buildHeaders: Added Authorization header
ApiClient request: {
  url: "https://beautycontrol-api.azurewebsites.net/api/owner/subscriptions/...",
  method: "PATCH",
  hasAuthHeader: true,
  ...
}
```

### 3. Verificar respuesta 200

El error 401 debe desaparecer y obtendrás una respuesta 200 con los datos actualizados.

## Archivos Modificados

```
📝 packages/shared/src/api/ownerSubscriptionsApi.js
   - Se agregó endpoint UPDATE
   - Se agregó método updateSubscription()

📝 packages/shared/src/store/slices/ownerSubscriptionSlice.js
   - Se agregó thunk updateSubscription
   - Se agregaron handlers en extraReducers

📝 packages/web-app/src/components/owner/EditSubscriptionModal.jsx
   - Reemplazado fetch directo por Redux dispatch
   - Uso de apiClient automático vía Redux
```

## Cómo Testear

1. **Navega al panel Owner → Negocios**
2. **Selecciona un negocio que tenga una suscripción**
3. **Haz clic en el botón ✏️ Editar (en la tabla de suscripciones)**
4. **Cambia algún dato (plan, estado, fechas, etc.)**
5. **Haz clic en "Guardar Cambios"**

**Resultado esperado:**
- ✅ Toast verde: "Suscripción actualizada correctamente"
- ✅ Modal se cierra
- ✅ Los datos actualizados se muestran en la tabla

## Troubleshooting

### Si aún obtienes 401:

1. Verifica que el token esté en `localStorage` o `sessionStorage`
2. Abre DevTools → Application → Storage → LocalStorage
3. Busca `bc_auth_token` o `token`
4. Si no está, haz login de nuevo

### Si ves "Error al actualizar la suscripción":

1. Abre DevTools → Console
2. Busca logs de error rojo
3. Verifica que el `subscriptionId` sea válido
4. Revisa que todos los datos sean válidos (fechas, planes, etc.)

### Si el modal no se cierra:

- Verifica que `onSuccess()` esté siendo llamado
- Revisa los logs en Redux DevTools
- Asegúrate de que la respuesta del backend es exitosa

---

**✅ Solución completada y testeada**

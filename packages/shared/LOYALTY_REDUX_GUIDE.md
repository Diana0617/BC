# Sistema de Fidelización - Redux Integration

## 🎯 Uso en Frontend Web (React)

### 1. Importar hooks y actions

```javascript
import { useSelector, useDispatch } from 'react-redux';
import {
  // Thunks - Cliente
  fetchMyBalance,
  fetchMyTransactions,
  fetchMyReferralCode,
  fetchMyReferrals,
  redeemPoints,
  fetchMyRewards,
  applyReward,
  downloadMyCard,
  // Thunks - Negocio
  fetchClientBalance,
  fetchClientTransactions,
  creditPointsManually,
  findClientByReferralCode,
  downloadClientCard,
  downloadBulkCards,
  // Actions
  resetMyBalance,
  setShowRedeemModal,
  clearLoyaltyErrors
} from '@bc/shared/store/slices';

import {
  // Selectores básicos
  selectMyBalance,
  selectTotalPoints,
  selectMyTransactions,
  selectMyRewards,
  selectActiveRewards,
  // Selectores computados
  selectHasPoints,
  selectHasActiveRewards,
  selectMyLoyaltyDashboard
} from '@bc/shared/store/selectors';
```

### 2. Ejemplo: Dashboard de Puntos del Cliente

```jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMyBalance, 
  fetchMyReferralCode,
  selectMyLoyaltyDashboard,
  selectMyBalanceLoading 
} from '@bc/shared/store';

const LoyaltyDashboard = () => {
  const dispatch = useDispatch();
  const dashboard = useSelector(selectMyLoyaltyDashboard);
  const loading = useSelector(selectMyBalanceLoading);

  useEffect(() => {
    dispatch(fetchMyBalance());
    dispatch(fetchMyReferralCode());
  }, [dispatch]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="loyalty-dashboard">
      <div className="points-card">
        <h2>Mis Puntos</h2>
        <p className="points-total">{dashboard.totalPoints}</p>
        
        {dashboard.hasPointsExpiringSoon && (
          <div className="expiring-alert">
            {dashboard.expiringSoon.map((exp, i) => (
              <p key={i}>
                {exp.points} puntos expiran el {new Date(exp.expiresAt).toLocaleDateString()}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="referral-card">
        <h3>Mi Código de Referido</h3>
        <p className="referral-code">{dashboard.referralCode}</p>
        <p>Has referido a {dashboard.referralCount} personas</p>
        <p>Has ganado {dashboard.referralPoints} puntos por referidos</p>
      </div>

      {dashboard.hasActiveRewards && (
        <div className="rewards-card">
          <h3>Recompensas Activas</h3>
          <p>Tienes {dashboard.activeRewardsCount} recompensas disponibles</p>
        </div>
      )}
    </div>
  );
};

export default LoyaltyDashboard;
```

### 3. Ejemplo: Canjear Puntos

```jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  redeemPoints, 
  setShowRedeemModal,
  selectRedeemLoading,
  selectRedeemError,
  selectLastRedeemedReward,
  selectTotalPoints
} from '@bc/shared/store';

const RedeemPointsModal = () => {
  const dispatch = useDispatch();
  const totalPoints = useSelector(selectTotalPoints);
  const loading = useSelector(selectRedeemLoading);
  const error = useSelector(selectRedeemError);
  const lastReward = useSelector(selectLastRedeemedReward);
  
  const [rewardType, setRewardType] = useState('DISCOUNT_PERCENTAGE');
  const [points, setPoints] = useState(0);
  const [value, setValue] = useState(0);

  const handleRedeem = async () => {
    const result = await dispatch(redeemPoints({
      points,
      rewardType,
      value,
      description: 'Canje desde app web'
    }));

    if (result.type.endsWith('/fulfilled')) {
      alert(`Recompensa creada! Código: ${lastReward.code}`);
      dispatch(setShowRedeemModal(false));
    }
  };

  return (
    <div className="modal">
      <h2>Canjear Puntos</h2>
      <p>Puntos disponibles: {totalPoints}</p>

      <div className="form-group">
        <label>Tipo de Recompensa</label>
        <select value={rewardType} onChange={e => setRewardType(e.target.value)}>
          <option value="DISCOUNT_PERCENTAGE">Descuento Porcentual</option>
          <option value="DISCOUNT_FIXED">Descuento Fijo</option>
          <option value="FREE_SERVICE">Servicio Gratis</option>
        </select>
      </div>

      <div className="form-group">
        <label>Puntos a Canjear</label>
        <input 
          type="number" 
          value={points} 
          onChange={e => setPoints(Number(e.target.value))}
          max={totalPoints}
        />
      </div>

      <div className="form-group">
        <label>Valor de la Recompensa</label>
        <input 
          type="number" 
          value={value} 
          onChange={e => setValue(Number(e.target.value))}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button onClick={handleRedeem} disabled={loading}>
        {loading ? 'Canjeando...' : 'Canjear'}
      </button>
    </div>
  );
};

export default RedeemPointsModal;
```

### 4. Ejemplo: Descargar Tarjeta PDF

```jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  downloadMyCard, 
  selectDownloadCardLoading 
} from '@bc/shared/store';

const DownloadCardButton = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectDownloadCardLoading);

  const handleDownload = () => {
    dispatch(downloadMyCard());
  };

  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Descargando...' : 'Descargar Mi Tarjeta PDF'}
    </button>
  );
};

export default DownloadCardButton;
```

### 5. Ejemplo: Panel de Administración (Negocio)

```jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchClientBalance,
  creditPointsManually,
  downloadClientCard,
  selectClientBalance,
  selectClientBalanceLoading
} from '@bc/shared/store';

const ClientLoyaltyAdmin = ({ clientId }) => {
  const dispatch = useDispatch();
  const balance = useSelector(selectClientBalance);
  const loading = useSelector(selectClientBalanceLoading);
  const [points, setPoints] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchClientBalance(clientId));
  }, [dispatch, clientId]);

  const handleCreditPoints = async () => {
    await dispatch(creditPointsManually({
      clientId,
      points,
      description,
      type: 'MANUAL_ADJUSTMENT'
    }));
    
    // Recargar balance
    dispatch(fetchClientBalance(clientId));
    setPoints(0);
    setDescription('');
  };

  const handleDownloadCard = () => {
    dispatch(downloadClientCard(clientId));
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="client-loyalty-admin">
      <h2>Administrar Puntos del Cliente</h2>
      
      <div className="balance-display">
        <h3>Puntos Actuales</h3>
        <p className="points">{balance?.totalPoints || 0}</p>
      </div>

      <div className="manual-credit">
        <h3>Acreditar/Debitar Puntos</h3>
        <input 
          type="number" 
          value={points}
          onChange={e => setPoints(Number(e.target.value))}
          placeholder="Puntos (negativo para debitar)"
        />
        <input 
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descripción"
        />
        <button onClick={handleCreditPoints}>
          Acreditar/Debitar
        </button>
      </div>

      <div className="card-actions">
        <button onClick={handleDownloadCard}>
          Descargar Tarjeta del Cliente
        </button>
      </div>
    </div>
  );
};

export default ClientLoyaltyAdmin;
```

---

## 📱 Uso en Mobile (React Native)

El uso es exactamente igual, solo cambia que necesitas importar desde el store de React Native:

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMyBalance,
  selectMyLoyaltyDashboard
} from '@bc/shared/store';

const LoyaltyScreen = () => {
  const dispatch = useDispatch();
  const dashboard = useSelector(selectMyLoyaltyDashboard);

  useEffect(() => {
    dispatch(fetchMyBalance());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.points}>{dashboard.totalPoints}</Text>
      <Text>Puntos Acumulados</Text>
      
      {dashboard.hasPointsExpiringSoon && (
        <View style={styles.alert}>
          <Text>¡Puntos por expirar!</Text>
        </View>
      )}
    </View>
  );
};
```

**Nota:** La descarga de PDFs en mobile requiere manejo especial de archivos. Considera usar `react-native-fs` o `expo-file-system`.

---

## 🔧 Selectores Disponibles

### Selectores Básicos

- `selectMyBalance` - Balance completo del cliente
- `selectTotalPoints` - Puntos totales (número)
- `selectMyTransactions` - Lista de transacciones
- `selectMyReferralCode` - Objeto con código de referido
- `selectMyReferrals` - Lista de referidos
- `selectMyRewards` - Lista de recompensas
- `selectClientBalance` - Balance de cliente específico (negocio)

### Selectores Computados

- `selectHasPoints` - Boolean: ¿tiene puntos?
- `selectHasPointsExpiringSoon` - Boolean: ¿tiene puntos por expirar?
- `selectActiveRewards` - Solo recompensas activas
- `selectUsedRewards` - Solo recompensas usadas
- `selectExpiredRewards` - Solo recompensas expiradas
- `selectActiveRewardsCount` - Cantidad de recompensas activas
- `selectCreditTransactions` - Solo transacciones de crédito
- `selectDebitTransactions` - Solo transacciones de débito
- `selectMyLoyaltyDashboard` - Objeto completo para dashboard

### Selectores de Estado

- `selectMyBalanceLoading` - ¿Cargando balance?
- `selectRedeemLoading` - ¿Canjeando puntos?
- `selectDownloadCardLoading` - ¿Descargando tarjeta?
- `selectMyBalanceError` - Error al cargar balance
- `selectRedeemError` - Error al canjear
- `selectIsAnyLoading` - ¿Hay alguna operación en curso?
- `selectHasAnyError` - ¿Hay algún error?

---

## 🎬 Acciones (Actions)

### Limpiar Estado

```javascript
dispatch(resetMyBalance());
dispatch(resetMyTransactions());
dispatch(resetMyRewards());
dispatch(clearLoyaltyErrors());
```

### Controlar UI

```javascript
dispatch(setShowRedeemModal(true));
dispatch(setShowRewardDetailsModal(true));
dispatch(setSelectedReward(reward));
```

---

## 🚀 Casos de Uso Comunes

### 1. Buscar Cliente por Código de Referido

```javascript
const [searchCode, setSearchCode] = useState('');
const foundClient = useSelector(selectFoundClient);
const loading = useSelector(selectFindClientLoading);

const handleSearch = () => {
  dispatch(findClientByReferralCode(searchCode));
};

// Luego usar foundClient para mostrar info del cliente
```

### 2. Generar Tarjetas Bulk

```javascript
const handleGenerateBulkCards = () => {
  const clientsData = selectedClients.map(client => ({
    clientId: client.id,
    points: client.loyaltyPoints
  }));

  dispatch(downloadBulkCards({ clients: clientsData }));
};
```

### 3. Mostrar Historial de Transacciones Paginado

```javascript
const [page, setPage] = useState(1);
const transactions = useSelector(selectMyTransactions);
const pagination = useSelector(selectMyTransactionsPagination);

useEffect(() => {
  dispatch(fetchMyTransactions({ 
    limit: 20, 
    offset: (page - 1) * 20 
  }));
}, [page, dispatch]);

// Mostrar transactions y botones de paginación
```

---

## 📚 Recursos

- **API Client**: `@bc/shared/api/loyaltyApi`
- **Slice**: `@bc/shared/store/slices/loyaltySlice`
- **Selectors**: `@bc/shared/store/selectors/loyaltySelectors`
- **Backend Docs**: `packages/backend/LOYALTY_SYSTEM.md`
- **Quick Start**: `packages/backend/LOYALTY_CARDS_QUICKSTART.md`

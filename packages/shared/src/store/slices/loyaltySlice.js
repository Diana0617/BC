/**
 * Redux Slice para el sistema de fidelización/loyalty
 * Maneja el estado de puntos, transacciones, recompensas y referidos
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import loyaltyApi from '../../api/loyaltyApi';

/**
 * ========================================
 * ASYNC THUNKS - CLIENTE
 * ========================================
 */

/**
 * Cargar balance de puntos del cliente autenticado
 */
export const fetchMyBalance = createAsyncThunk(
  'loyalty/fetchMyBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getMyBalance();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar balance'
      );
    }
  }
);

/**
 * Cargar transacciones del cliente autenticado
 */
export const fetchMyTransactions = createAsyncThunk(
  'loyalty/fetchMyTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getMyTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar transacciones'
      );
    }
  }
);

/**
 * Cargar código de referido del cliente autenticado
 */
export const fetchMyReferralCode = createAsyncThunk(
  'loyalty/fetchMyReferralCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getMyReferralCode();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar código de referido'
      );
    }
  }
);

/**
 * Cargar lista de referidos del cliente autenticado
 */
export const fetchMyReferrals = createAsyncThunk(
  'loyalty/fetchMyReferrals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getMyReferrals(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar referidos'
      );
    }
  }
);

/**
 * Canjear puntos por recompensa
 */
export const redeemPoints = createAsyncThunk(
  'loyalty/redeemPoints',
  async (data, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.redeemPoints(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al canjear puntos'
      );
    }
  }
);

/**
 * Cargar recompensas del cliente autenticado
 */
export const fetchMyRewards = createAsyncThunk(
  'loyalty/fetchMyRewards',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getMyRewards(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar recompensas'
      );
    }
  }
);

/**
 * Aplicar recompensa a una cita/compra
 */
export const applyReward = createAsyncThunk(
  'loyalty/applyReward',
  async (data, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.applyReward(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al aplicar recompensa'
      );
    }
  }
);

/**
 * Descargar tarjeta de fidelización del cliente
 */
export const downloadMyCard = createAsyncThunk(
  'loyalty/downloadMyCard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.downloadMyCard();
      const blob = response.data;
      loyaltyApi.downloadBlob(blob, 'tarjeta-fidelizacion.pdf');
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al descargar tarjeta'
      );
    }
  }
);

/**
 * ========================================
 * ASYNC THUNKS - NEGOCIO
 * ========================================
 */

/**
 * Cargar balance de un cliente específico
 */
export const fetchClientBalance = createAsyncThunk(
  'loyalty/fetchClientBalance',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getClientBalance(clientId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar balance del cliente'
      );
    }
  }
);

/**
 * Cargar transacciones de un cliente específico
 */
export const fetchClientTransactions = createAsyncThunk(
  'loyalty/fetchClientTransactions',
  async ({ clientId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getClientTransactions(clientId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar transacciones del cliente'
      );
    }
  }
);

/**
 * Cargar referidos de un cliente específico
 */
export const fetchClientReferrals = createAsyncThunk(
  'loyalty/fetchClientReferrals',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.getClientReferrals(clientId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al cargar referidos del cliente'
      );
    }
  }
);

/**
 * Acreditar puntos manualmente a un cliente
 */
export const creditPointsManually = createAsyncThunk(
  'loyalty/creditPointsManually',
  async (data, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.creditPointsManually(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al acreditar puntos'
      );
    }
  }
);

/**
 * Buscar cliente por código de referido
 */
export const findClientByReferralCode = createAsyncThunk(
  'loyalty/findClientByReferralCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.findClientByReferralCode(code);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Cliente no encontrado'
      );
    }
  }
);

/**
 * Descargar tarjeta de fidelización de un cliente específico
 */
export const downloadClientCard = createAsyncThunk(
  'loyalty/downloadClientCard',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.downloadClientCard(clientId);
      const blob = response.data;
      loyaltyApi.downloadBlob(blob, `tarjeta-${clientId}.pdf`);
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al descargar tarjeta'
      );
    }
  }
);

/**
 * Generar múltiples tarjetas en un PDF
 */
export const downloadBulkCards = createAsyncThunk(
  'loyalty/downloadBulkCards',
  async (data, { rejectWithValue }) => {
    try {
      const response = await loyaltyApi.downloadBulkCards(data);
      const blob = response.data;
      const filename = `tarjetas-fidelizacion-${Date.now()}.pdf`;
      loyaltyApi.downloadBlob(blob, filename);
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Error al descargar tarjetas'
      );
    }
  }
);

/**
 * ========================================
 * SLICE
 * ========================================
 */

const initialState = {
  // Balance y puntos del cliente autenticado
  myBalance: null,
  myBalanceLoading: false,
  myBalanceError: null,

  // Transacciones del cliente autenticado
  myTransactions: [],
  myTransactionsPagination: null,
  myTransactionsLoading: false,
  myTransactionsError: null,

  // Código de referido del cliente autenticado
  myReferralCode: null,
  myReferralCodeLoading: false,
  myReferralCodeError: null,

  // Referidos del cliente autenticado
  myReferrals: [],
  myReferralsPagination: null,
  myReferralsLoading: false,
  myReferralsError: null,

  // Recompensas del cliente autenticado
  myRewards: [],
  myRewardsLoading: false,
  myRewardsError: null,

  // Estado de canje de puntos
  redeemLoading: false,
  redeemError: null,
  lastRedeemedReward: null,

  // Estado de aplicación de recompensa
  applyRewardLoading: false,
  applyRewardError: null,

  // Balance de cliente específico (para negocio)
  clientBalance: null,
  clientBalanceLoading: false,
  clientBalanceError: null,

  // Transacciones de cliente específico (para negocio)
  clientTransactions: [],
  clientTransactionsPagination: null,
  clientTransactionsLoading: false,
  clientTransactionsError: null,

  // Referidos de cliente específico (para negocio)
  clientReferrals: [],
  clientReferralsLoading: false,
  clientReferralsError: null,

  // Búsqueda por código de referido
  foundClient: null,
  findClientLoading: false,
  findClientError: null,

  // Descarga de tarjetas
  downloadCardLoading: false,
  downloadCardError: null,

  // UI helpers
  showRedeemModal: false,
  showRewardDetailsModal: false,
  selectedReward: null
};

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    // Resetear balance del cliente autenticado
    resetMyBalance: (state) => {
      state.myBalance = null;
      state.myBalanceError = null;
    },

    // Resetear transacciones del cliente autenticado
    resetMyTransactions: (state) => {
      state.myTransactions = [];
      state.myTransactionsPagination = null;
      state.myTransactionsError = null;
    },

    // Resetear recompensas del cliente autenticado
    resetMyRewards: (state) => {
      state.myRewards = [];
      state.myRewardsError = null;
    },

    // Resetear balance de cliente específico
    resetClientBalance: (state) => {
      state.clientBalance = null;
      state.clientBalanceError = null;
    },

    // Resetear transacciones de cliente específico
    resetClientTransactions: (state) => {
      state.clientTransactions = [];
      state.clientTransactionsPagination = null;
      state.clientTransactionsError = null;
    },

    // Resetear cliente encontrado
    resetFoundClient: (state) => {
      state.foundClient = null;
      state.findClientError = null;
    },

    // Modal de canje
    setShowRedeemModal: (state, action) => {
      state.showRedeemModal = action.payload;
    },

    // Modal de detalles de recompensa
    setShowRewardDetailsModal: (state, action) => {
      state.showRewardDetailsModal = action.payload;
    },

    // Seleccionar recompensa
    setSelectedReward: (state, action) => {
      state.selectedReward = action.payload;
    },

    // Limpiar errores
    clearErrors: (state) => {
      state.myBalanceError = null;
      state.myTransactionsError = null;
      state.myReferralCodeError = null;
      state.myReferralsError = null;
      state.myRewardsError = null;
      state.redeemError = null;
      state.applyRewardError = null;
      state.clientBalanceError = null;
      state.clientTransactionsError = null;
      state.clientReferralsError = null;
      state.findClientError = null;
      state.downloadCardError = null;
    }
  },
  extraReducers: (builder) => {
    // ===== fetchMyBalance =====
    builder
      .addCase(fetchMyBalance.pending, (state) => {
        state.myBalanceLoading = true;
        state.myBalanceError = null;
      })
      .addCase(fetchMyBalance.fulfilled, (state, action) => {
        state.myBalanceLoading = false;
        state.myBalance = action.payload.data || action.payload;
      })
      .addCase(fetchMyBalance.rejected, (state, action) => {
        state.myBalanceLoading = false;
        state.myBalanceError = action.payload;
      });

    // ===== fetchMyTransactions =====
    builder
      .addCase(fetchMyTransactions.pending, (state) => {
        state.myTransactionsLoading = true;
        state.myTransactionsError = null;
      })
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.myTransactionsLoading = false;
        state.myTransactions = action.payload.data?.transactions || action.payload.transactions || [];
        state.myTransactionsPagination = action.payload.data?.pagination || action.payload.pagination || null;
      })
      .addCase(fetchMyTransactions.rejected, (state, action) => {
        state.myTransactionsLoading = false;
        state.myTransactionsError = action.payload;
      });

    // ===== fetchMyReferralCode =====
    builder
      .addCase(fetchMyReferralCode.pending, (state) => {
        state.myReferralCodeLoading = true;
        state.myReferralCodeError = null;
      })
      .addCase(fetchMyReferralCode.fulfilled, (state, action) => {
        state.myReferralCodeLoading = false;
        state.myReferralCode = action.payload.data || action.payload;
      })
      .addCase(fetchMyReferralCode.rejected, (state, action) => {
        state.myReferralCodeLoading = false;
        state.myReferralCodeError = action.payload;
      });

    // ===== fetchMyReferrals =====
    builder
      .addCase(fetchMyReferrals.pending, (state) => {
        state.myReferralsLoading = true;
        state.myReferralsError = null;
      })
      .addCase(fetchMyReferrals.fulfilled, (state, action) => {
        state.myReferralsLoading = false;
        state.myReferrals = action.payload.data?.referrals || action.payload.referrals || [];
        state.myReferralsPagination = action.payload.data?.pagination || action.payload.pagination || null;
      })
      .addCase(fetchMyReferrals.rejected, (state, action) => {
        state.myReferralsLoading = false;
        state.myReferralsError = action.payload;
      });

    // ===== redeemPoints =====
    builder
      .addCase(redeemPoints.pending, (state) => {
        state.redeemLoading = true;
        state.redeemError = null;
      })
      .addCase(redeemPoints.fulfilled, (state, action) => {
        state.redeemLoading = false;
        state.lastRedeemedReward = action.payload.data?.reward || action.payload.reward;
        // Actualizar balance si viene en la respuesta
        if (action.payload.data?.newBalance !== undefined) {
          state.myBalance = {
            ...state.myBalance,
            totalPoints: action.payload.data.newBalance
          };
        }
      })
      .addCase(redeemPoints.rejected, (state, action) => {
        state.redeemLoading = false;
        state.redeemError = action.payload;
      });

    // ===== fetchMyRewards =====
    builder
      .addCase(fetchMyRewards.pending, (state) => {
        state.myRewardsLoading = true;
        state.myRewardsError = null;
      })
      .addCase(fetchMyRewards.fulfilled, (state, action) => {
        state.myRewardsLoading = false;
        state.myRewards = action.payload.data?.rewards || action.payload.rewards || [];
      })
      .addCase(fetchMyRewards.rejected, (state, action) => {
        state.myRewardsLoading = false;
        state.myRewardsError = action.payload;
      });

    // ===== applyReward =====
    builder
      .addCase(applyReward.pending, (state) => {
        state.applyRewardLoading = true;
        state.applyRewardError = null;
      })
      .addCase(applyReward.fulfilled, (state, action) => {
        state.applyRewardLoading = false;
        // Actualizar recompensa en la lista
        const reward = action.payload.data?.reward || action.payload.reward;
        if (reward) {
          const index = state.myRewards.findIndex(r => r.id === reward.id);
          if (index !== -1) {
            state.myRewards[index] = reward;
          }
        }
      })
      .addCase(applyReward.rejected, (state, action) => {
        state.applyRewardLoading = false;
        state.applyRewardError = action.payload;
      });

    // ===== downloadMyCard =====
    builder
      .addCase(downloadMyCard.pending, (state) => {
        state.downloadCardLoading = true;
        state.downloadCardError = null;
      })
      .addCase(downloadMyCard.fulfilled, (state) => {
        state.downloadCardLoading = false;
      })
      .addCase(downloadMyCard.rejected, (state, action) => {
        state.downloadCardLoading = false;
        state.downloadCardError = action.payload;
      });

    // ===== fetchClientBalance =====
    builder
      .addCase(fetchClientBalance.pending, (state) => {
        state.clientBalanceLoading = true;
        state.clientBalanceError = null;
      })
      .addCase(fetchClientBalance.fulfilled, (state, action) => {
        state.clientBalanceLoading = false;
        state.clientBalance = action.payload.data || action.payload;
      })
      .addCase(fetchClientBalance.rejected, (state, action) => {
        state.clientBalanceLoading = false;
        state.clientBalanceError = action.payload;
      });

    // ===== fetchClientTransactions =====
    builder
      .addCase(fetchClientTransactions.pending, (state) => {
        state.clientTransactionsLoading = true;
        state.clientTransactionsError = null;
      })
      .addCase(fetchClientTransactions.fulfilled, (state, action) => {
        state.clientTransactionsLoading = false;
        state.clientTransactions = action.payload.data?.transactions || action.payload.transactions || [];
        state.clientTransactionsPagination = action.payload.data?.pagination || action.payload.pagination || null;
      })
      .addCase(fetchClientTransactions.rejected, (state, action) => {
        state.clientTransactionsLoading = false;
        state.clientTransactionsError = action.payload;
      });

    // ===== fetchClientReferrals =====
    builder
      .addCase(fetchClientReferrals.pending, (state) => {
        state.clientReferralsLoading = true;
        state.clientReferralsError = null;
      })
      .addCase(fetchClientReferrals.fulfilled, (state, action) => {
        state.clientReferralsLoading = false;
        state.clientReferrals = action.payload.data?.referrals || action.payload.referrals || [];
      })
      .addCase(fetchClientReferrals.rejected, (state, action) => {
        state.clientReferralsLoading = false;
        state.clientReferralsError = action.payload;
      });

    // ===== creditPointsManually =====
    builder
      .addCase(creditPointsManually.pending, (state) => {
        state.clientBalanceLoading = true;
      })
      .addCase(creditPointsManually.fulfilled, (state, action) => {
        state.clientBalanceLoading = false;
        // Agregar transacción a la lista si existe
        const transaction = action.payload.data?.transaction || action.payload.transaction;
        if (transaction) {
          state.clientTransactions.unshift(transaction);
        }
      })
      .addCase(creditPointsManually.rejected, (state, action) => {
        state.clientBalanceLoading = false;
        state.clientBalanceError = action.payload;
      });

    // ===== findClientByReferralCode =====
    builder
      .addCase(findClientByReferralCode.pending, (state) => {
        state.findClientLoading = true;
        state.findClientError = null;
      })
      .addCase(findClientByReferralCode.fulfilled, (state, action) => {
        state.findClientLoading = false;
        state.foundClient = action.payload.data?.client || action.payload.client;
      })
      .addCase(findClientByReferralCode.rejected, (state, action) => {
        state.findClientLoading = false;
        state.findClientError = action.payload;
      });

    // ===== downloadClientCard =====
    builder
      .addCase(downloadClientCard.pending, (state) => {
        state.downloadCardLoading = true;
        state.downloadCardError = null;
      })
      .addCase(downloadClientCard.fulfilled, (state) => {
        state.downloadCardLoading = false;
      })
      .addCase(downloadClientCard.rejected, (state, action) => {
        state.downloadCardLoading = false;
        state.downloadCardError = action.payload;
      });

    // ===== downloadBulkCards =====
    builder
      .addCase(downloadBulkCards.pending, (state) => {
        state.downloadCardLoading = true;
        state.downloadCardError = null;
      })
      .addCase(downloadBulkCards.fulfilled, (state) => {
        state.downloadCardLoading = false;
      })
      .addCase(downloadBulkCards.rejected, (state, action) => {
        state.downloadCardLoading = false;
        state.downloadCardError = action.payload;
      });
  }
});

export const {
  resetMyBalance,
  resetMyTransactions,
  resetMyRewards,
  resetClientBalance,
  resetClientTransactions,
  resetFoundClient,
  setShowRedeemModal,
  setShowRewardDetailsModal,
  setSelectedReward,
  clearErrors
} = loyaltySlice.actions;

export default loyaltySlice.reducer;

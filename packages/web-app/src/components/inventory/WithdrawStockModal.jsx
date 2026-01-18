import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  RemoveCircle as WithdrawIcon,
  Inventory as ProductIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useBusinessContext } from '../../context/BusinessContext';

const WithdrawStockModal = ({ open, onClose, onSuccess, products = [], branches = [], currentBranchId = null }) => {
  const { businessId } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    branchId: currentBranchId || '',
    quantity: '',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [availableStock, setAvailableStock] = useState(null);

  // Filtrar solo productos consumibles (FOR_PROCEDURES o BOTH)
  const consumableProducts = products.filter(
    p => p.productType === 'FOR_PROCEDURES' || p.productType === 'BOTH'
  );

  useEffect(() => {
    if (formData.productId) {
      const product = consumableProducts.find(p => p.id === formData.productId);
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, consumableProducts]);

  useEffect(() => {
    if (selectedProduct) {
      if (formData.branchId) {
        const branchStock = selectedProduct.branchStocks?.find(
          bs => bs.branchId === formData.branchId
        );
        setAvailableStock(branchStock?.currentStock || 0);
      } else {
        setAvailableStock(selectedProduct.currentStock || 0);
      }
    } else {
      setAvailableStock(null);
    }
  }, [selectedProduct, formData.branchId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.productId || !formData.quantity) {
      setError('El producto y la cantidad son requeridos');
      return;
    }

    if (formData.quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (availableStock !== null && formData.quantity > availableStock) {
      setError(`Stock insuficiente. Disponible: ${availableStock}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/business/${businessId}/config/inventory/withdraw-stock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            productId: formData.productId,
            branchId: formData.branchId || null,
            quantity: parseFloat(formData.quantity),
            notes: formData.notes
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al retirar stock');
      }

      toast.success(data.message || 'Retiro registrado exitosamente');
      
      if (onSuccess) {
        onSuccess(data.data);
      }
      
      handleClose();
    } catch (err) {
      console.error('Error withdrawing stock:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: '',
      branchId: currentBranchId || '',
      quantity: '',
      notes: ''
    });
    setSelectedProduct(null);
    setAvailableStock(null);
    setError(null);
    onClose();
  };

  const selectedBranch = branches.find(b => b.id === formData.branchId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WithdrawIcon color="warning" />
          <Typography variant="h6">Retirar Stock (Consumo)</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Para registro de consumo interno de productos
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Seleccionar Producto */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Producto Consumible"
                value={formData.productId}
                onChange={(e) => handleChange('productId', e.target.value)}
                required
                InputProps={{
                  startAdornment: <ProductIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                helperText="Solo productos para procedimientos o uso dual"
              >
                <MenuItem value="">Seleccionar producto</MenuItem>
                {consumableProducts.length === 0 ? (
                  <MenuItem disabled>No hay productos consumibles</MenuItem>
                ) : (
                  consumableProducts.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      <Box>
                        <Typography>{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {product.sku} | Stock: {product.currentStock} {product.unit}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            {/* Sucursal (opcional) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Sucursal (opcional)"
                value={formData.branchId}
                onChange={(e) => handleChange('branchId', e.target.value)}
                InputProps={{
                  startAdornment: <StoreIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                helperText="Dejar vacío para retirar del stock general"
              >
                <MenuItem value="">Stock General</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Stock disponible */}
            {availableStock !== null && (
              <Grid item xs={12}>
                <Alert severity={availableStock > 0 ? 'success' : 'warning'}>
                  <Typography variant="body2">
                    <strong>Stock disponible:</strong> {availableStock} {selectedProduct?.unit || 'unidades'}
                    {selectedBranch && ` en ${selectedBranch.name}`}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Cantidad */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Cantidad a Retirar"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
                inputProps={{ min: 0.01, step: 0.01 }}
                helperText={`Unidad: ${selectedProduct?.unit || 'unidades'}`}
              />
            </Grid>

            {/* Notas */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notas"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Ej: Consumo de shampoo para tratamiento, tinte usado en servicio, etc."
                required
              />
            </Grid>

            {/* Info adicional */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="caption">
                  Este retiro se registrará como consumo del personal y se descontará del inventario. 
                  El movimiento quedará registrado en el historial de movimientos de inventario.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            disabled={loading || !formData.productId || !formData.quantity || !formData.notes}
            startIcon={loading ? <CircularProgress size={20} /> : <WithdrawIcon />}
          >
            {loading ? 'Retirando...' : 'Retirar Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WithdrawStockModal;

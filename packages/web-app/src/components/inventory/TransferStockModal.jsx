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
  SwapHoriz as TransferIcon,
  Store as StoreIcon,
  Inventory as ProductIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useBusinessContext } from '../../context/BusinessContext';

const TransferStockModal = ({ open, onClose, onSuccess, products = [], branches = [] }) => {
  const { businessId } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    fromBranchId: '',
    toBranchId: '',
    quantity: '',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fromBranchStock, setFromBranchStock] = useState(null);
  const [toBranchStock, setToBranchStock] = useState(null);

  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId);
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  useEffect(() => {
    if (selectedProduct && formData.fromBranchId) {
      const stock = selectedProduct.branchStocks?.find(
        bs => bs.branchId === formData.fromBranchId
      );
      setFromBranchStock(stock);
    } else {
      setFromBranchStock(null);
    }
  }, [selectedProduct, formData.fromBranchId]);

  useEffect(() => {
    if (selectedProduct && formData.toBranchId) {
      const stock = selectedProduct.branchStocks?.find(
        bs => bs.branchId === formData.toBranchId
      );
      setToBranchStock(stock);
    } else {
      setToBranchStock(null);
    }
  }, [selectedProduct, formData.toBranchId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar sucursal destino si se cambia origen
    if (field === 'fromBranchId' && formData.toBranchId === value) {
      setFormData(prev => ({ ...prev, toBranchId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.productId || !formData.fromBranchId || !formData.toBranchId || !formData.quantity) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (formData.fromBranchId === formData.toBranchId) {
      setError('Las sucursales de origen y destino no pueden ser iguales');
      return;
    }

    if (formData.quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    const availableStock = fromBranchStock?.currentStock || 0;
    if (formData.quantity > availableStock) {
      setError(`Stock insuficiente. Disponible: ${availableStock}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/business/${businessId}/config/inventory/transfer-between-branches`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            productId: formData.productId,
            fromBranchId: formData.fromBranchId,
            toBranchId: formData.toBranchId,
            quantity: parseFloat(formData.quantity),
            notes: formData.notes
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al transferir stock');
      }

      toast.success(data.message || 'Transferencia exitosa');
      
      if (onSuccess) {
        onSuccess(data.data);
      }
      
      handleClose();
    } catch (err) {
      console.error('Error transferring stock:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: '',
      fromBranchId: '',
      toBranchId: '',
      quantity: '',
      notes: ''
    });
    setSelectedProduct(null);
    setFromBranchStock(null);
    setToBranchStock(null);
    setError(null);
    onClose();
  };

  const fromBranch = branches.find(b => b.id === formData.fromBranchId);
  const toBranch = branches.find(b => b.id === formData.toBranchId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TransferIcon color="primary" />
          <Typography variant="h6">Transferir Stock entre Sucursales</Typography>
        </Box>
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
                label="Producto"
                value={formData.productId}
                onChange={(e) => handleChange('productId', e.target.value)}
                required
                InputProps={{
                  startAdornment: <ProductIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              >
                <MenuItem value="">Seleccionar producto</MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    <Box>
                      <Typography>{product.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {product.sku} | Stock Global: {product.currentStock} {product.unit}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Sucursal Origen */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Desde Sucursal"
                value={formData.fromBranchId}
                onChange={(e) => handleChange('fromBranchId', e.target.value)}
                required
                InputProps={{
                  startAdornment: <StoreIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              >
                <MenuItem value="">Seleccionar sucursal</MenuItem>
                {branches.map((branch) => (
                  <MenuItem 
                    key={branch.id} 
                    value={branch.id}
                    disabled={branch.id === formData.toBranchId}
                  >
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
              
              {fromBranchStock && (
                <Box mt={1}>
                  <Chip
                    label={`Stock disponible: ${fromBranchStock.currentStock} ${selectedProduct?.unit || ''}`}
                    color={fromBranchStock.currentStock > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              )}
            </Grid>

            {/* Sucursal Destino */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Hacia Sucursal"
                value={formData.toBranchId}
                onChange={(e) => handleChange('toBranchId', e.target.value)}
                required
                InputProps={{
                  startAdornment: <StoreIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              >
                <MenuItem value="">Seleccionar sucursal</MenuItem>
                {branches.map((branch) => (
                  <MenuItem 
                    key={branch.id} 
                    value={branch.id}
                    disabled={branch.id === formData.fromBranchId}
                  >
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
              
              {toBranchStock && (
                <Box mt={1}>
                  <Chip
                    label={`Stock actual: ${toBranchStock.currentStock} ${selectedProduct?.unit || ''}`}
                    color="info"
                    size="small"
                  />
                </Box>
              )}
            </Grid>

            {/* Cantidad */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Cantidad a Transferir"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
                inputProps={{ min: 1, step: 0.01 }}
                helperText={
                  fromBranchStock && formData.quantity
                    ? `Quedarán ${fromBranchStock.currentStock - formData.quantity} en ${fromBranch?.name}`
                    : ''
                }
              />
            </Grid>

            {/* Notas */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notas (opcional)"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Motivo de la transferencia, observaciones..."
              />
            </Grid>

            {/* Resumen */}
            {selectedProduct && fromBranch && toBranch && formData.quantity && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Resumen:</strong> Se transferirán <strong>{formData.quantity} {selectedProduct.unit || 'unidades'}</strong> de <strong>{selectedProduct.name}</strong> desde <strong>{fromBranch.name}</strong> hacia <strong>{toBranch.name}</strong>
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.productId || !formData.fromBranchId || !formData.toBranchId || !formData.quantity}
            startIcon={loading ? <CircularProgress size={20} /> : <TransferIcon />}
          >
            {loading ? 'Transfiriendo...' : 'Transferir'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransferStockModal;

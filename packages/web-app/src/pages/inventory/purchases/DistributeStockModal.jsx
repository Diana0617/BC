import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  CallSplit as DistributeIcon,
  Store as StoreIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import businessBranchesApi from '@shared/api/businessBranchesApi';
const DistributeStockModal = ({ open, onClose, invoice, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const businessId = user?.businessId;
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  
  // distribution: [{ branchId, items: [{ productId, quantity }] }]
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    if (open && businessId && invoice) {
      loadBranches();
      initializeDistribution();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, businessId, invoice]);

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await businessBranchesApi.getBranches(businessId);
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
      toast.error('Error al cargar sucursales');
    } finally {
      setLoadingBranches(false);
    }
  };

  const initializeDistribution = () => {
    if (!invoice?.items || branches.length === 0) return;

    // Inicializar con una sucursal por defecto (la primera)
    const initialDist = [{
      branchId: branches[0]?.id || '',
      items: invoice.items.map(item => ({
        productId: item.productId,
        quantity: 0
      }))
    }];

    setDistribution(initialDist);
  };

  const handleAddBranch = () => {
    if (!invoice?.items) return;

    setDistribution([
      ...distribution,
      {
        branchId: '',
        items: invoice.items.map(item => ({
          productId: item.productId,
          quantity: 0
        }))
      }
    ]);
  };

  const handleRemoveBranch = (distIndex) => {
    if (distribution.length === 1) {
      toast.error('Debe haber al menos una sucursal');
      return;
    }
    setDistribution(distribution.filter((_, i) => i !== distIndex));
  };

  const handleBranchChange = (distIndex, branchId) => {
    const newDist = [...distribution];
    newDist[distIndex].branchId = branchId;
    setDistribution(newDist);
  };

  const handleQuantityChange = (distIndex, itemIndex, quantity) => {
    const newDist = [...distribution];
    newDist[distIndex].items[itemIndex].quantity = parseFloat(quantity) || 0;
    setDistribution(newDist);
  };

  const getProductTotalDistributed = (productId) => {
    return distribution.reduce((sum, dist) => {
      const item = dist.items.find(i => i.productId === productId);
      return sum + (item?.quantity || 0);
    }, 0);
  };

  const isValidDistribution = () => {
    if (!invoice?.items) return false;

    // Verificar que todas las sucursales estén seleccionadas
    if (distribution.some(d => !d.branchId)) {
      return false;
    }

    // Verificar que no haya sucursales duplicadas
    const branchIds = distribution.map(d => d.branchId);
    if (new Set(branchIds).size !== branchIds.length) {
      return false;
    }

    // Verificar que cada producto esté completamente distribuido
    return invoice.items.every(item => {
      const distributed = getProductTotalDistributed(item.productId);
      return distributed === item.quantity;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidDistribution()) {
      setError('La distribución no es válida. Verifica que todas las cantidades coincidan con la factura.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/business/${businessId}/supplier-invoices/${invoice.id}/distribute-stock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ distribution })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al distribuir stock');
      }

      toast.success('Stock distribuido exitosamente');
      
      if (onSuccess) {
        onSuccess(data.data);
      }
      
      handleClose();
    } catch (err) {
      console.error('Error distributing stock:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDistribution([]);
    setError(null);
    onClose();
  };

  const getUsedBranches = () => {
    return distribution.map(d => d.branchId).filter(Boolean);
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DistributeIcon color="primary" />
          <Typography variant="h6">Distribuir Stock entre Sucursales</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Factura: {invoice.invoiceNumber}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loadingBranches ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : branches.length === 0 ? (
            <Alert severity="warning">
              No hay sucursales registradas. Crea al menos una sucursal para distribuir stock.
            </Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                Distribuye las cantidades de cada producto entre las sucursales. Las cantidades deben sumar exactamente lo indicado en la factura.
              </Alert>

              {/* Resumen de productos en la factura */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Productos en la Factura:
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="right">Cantidad Facturada</TableCell>
                        <TableCell align="right">Distribuido</TableCell>
                        <TableCell align="center">Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.items.map((item, idx) => {
                        const distributed = getProductTotalDistributed(item.productId);
                        const remaining = item.quantity - distributed;
                        const isComplete = remaining === 0;
                        const isOver = distributed > item.quantity;

                        return (
                          <TableRow key={idx}>
                            <TableCell>{item.product?.name || item.productId}</TableCell>
                            <TableCell align="right">
                              <strong>{item.quantity}</strong> {item.product?.unit}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                color={isOver ? 'error' : isComplete ? 'success.main' : 'text.secondary'}
                                fontWeight={isOver || isComplete ? 'bold' : 'normal'}
                              >
                                {distributed}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {isOver ? (
                                <Chip label={`+${distributed - item.quantity} exceso`} color="error" size="small" />
                              ) : isComplete ? (
                                <Chip label="Completo" color="success" size="small" />
                              ) : (
                                <Chip label={`Faltan ${remaining}`} color="warning" size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Divider sx={{ my: 2 }} />

              {/* Distribución por sucursal */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Distribución por Sucursal:
              </Typography>

              {distribution.map((dist, distIndex) => {
                const usedBranches = getUsedBranches();

                return (
                  <Paper key={distIndex} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <StoreIcon color="primary" />
                      <TextField
                        select
                        size="small"
                        label="Sucursal"
                        value={dist.branchId}
                        onChange={(e) => handleBranchChange(distIndex, e.target.value)}
                        required
                        sx={{ minWidth: 250 }}
                      >
                        {branches.map((branch) => (
                          <option
                            key={branch.id}
                            value={branch.id}
                            disabled={usedBranches.includes(branch.id) && branch.id !== dist.branchId}
                          >
                            {branch.name}
                          </option>
                        ))}
                      </TextField>

                      {distribution.length > 1 && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveBranch(distIndex)}
                        >
                          Quitar
                        </Button>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      {invoice.items.map((item, itemIndex) => (
                        <Grid item xs={12} sm={6} md={4} key={itemIndex}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label={item.product?.name || 'Producto'}
                            value={dist.items[itemIndex]?.quantity || ''}
                            onChange={(e) => handleQuantityChange(distIndex, itemIndex, e.target.value)}
                            inputProps={{ min: 0, step: 0.01 }}
                            helperText={`Max: ${item.quantity} ${item.product?.unit || ''}`}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                );
              })}

              <Button
                startIcon={<DistributeIcon />}
                onClick={handleAddBranch}
                disabled={distribution.length >= branches.length}
              >
                Agregar Otra Sucursal
              </Button>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingBranches || !isValidDistribution()}
            startIcon={loading ? <CircularProgress size={20} /> : <DistributeIcon />}
          >
            {loading ? 'Distribuyendo...' : 'Distribuir Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DistributeStockModal;

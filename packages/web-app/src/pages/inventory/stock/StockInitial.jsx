import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const StockInitial = () => {
  const [products, setProducts] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products', {
        params: {
          isActive: true,
          trackInventory: true,
          limit: 1000
        }
      });
      
      // Filtrar solo productos sin stock
      const productsWithoutStock = response.data.data.products.filter(
        p => p.currentStock === 0
      );
      
      setProducts(productsWithoutStock);
      
      if (productsWithoutStock.length === 0) {
        setError('No hay productos disponibles para carga inicial. Todos los productos ya tienen stock registrado.');
      }
    } catch (err) {
      setError('Error al cargar productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    // Verificar que no esté ya agregado
    if (stockItems.find(item => item.productId === product.id)) {
      return;
    }

    setStockItems([
      ...stockItems,
      {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unit: product.unit,
        quantity: 1,
        unitCost: product.cost || 0
      }
    ]);
  };

  const handleRemoveProduct = (productId) => {
    setStockItems(stockItems.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId, value) => {
    setStockItems(stockItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: parseInt(value) || 0 }
        : item
    ));
  };

  const handleCostChange = (productId, value) => {
    setStockItems(stockItems.map(item => 
      item.productId === productId 
        ? { ...item, unitCost: parseFloat(value) || 0 }
        : item
    ));
  };

  const calculateTotal = () => {
    return stockItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await axios.post('/api/products/bulk-initial-stock', {
        products: stockItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost
        }))
      });

      setResults(response.data.data);
      setSuccess(`Stock inicial cargado exitosamente: ${response.data.data.processed} productos`);
      setStockItems([]);
      setConfirmDialog(false);
      
      // Recargar productos
      loadProducts();
    } catch (err) {
      setError('Error al cargar stock inicial: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const availableProducts = products.filter(
    p => !stockItems.find(item => item.productId === p.id)
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          📦 Carga Inicial de Stock
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Define el inventario inicial de tus productos. Solo se pueden cargar productos sin stock previo.
        </Typography>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Información */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> La carga inicial solo se puede realizar una vez por producto.
          Una vez cargado el stock inicial, las modificaciones se deben hacer a través de movimientos
          de inventario (compras, ajustes, etc.).
        </Typography>
      </Alert>

      <Box display="flex" gap={3}>
        {/* Lista de productos disponibles */}
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Productos Disponibles ({availableProducts.length})
          </Typography>
          
          <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
            {availableProducts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No hay productos disponibles para carga inicial
              </Typography>
            ) : (
              availableProducts.map(product => (
                <Box
                  key={product.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleAddProduct(product)}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.sku && `SKU: ${product.sku} • `}
                      {product.category && `${product.category} • `}
                      Unidad: {product.unit}
                    </Typography>
                  </Box>
                  <IconButton size="small" color="primary">
                    <AddIcon />
                  </IconButton>
                </Box>
              ))
            )}
          </Box>
        </Paper>

        {/* Lista de productos seleccionados */}
        <Paper sx={{ flex: 2, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Stock a Cargar ({stockItems.length} productos)
            </Typography>
            {stockItems.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => setConfirmDialog(true)}
              >
                Cargar Stock
              </Button>
            )}
          </Box>

          {stockItems.length === 0 ? (
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center'
              }}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Selecciona productos de la lista de la izquierda
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Haz clic en un producto para agregarlo
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: '400px' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Costo Unitario</TableCell>
                      <TableCell align="right">Costo Total</TableCell>
                      <TableCell align="center">Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.productSku && `${item.productSku} • `}
                            {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                            inputProps={{ min: 1, style: { textAlign: 'right' } }}
                            sx={{ width: '100px' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.unitCost}
                            onChange={(e) => handleCostChange(item.productId, e.target.value)}
                            inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                            sx={{ width: '120px' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            ${(item.quantity * item.unitCost).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveProduct(item.productId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Total */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'primary.light',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h6" color="primary.contrastText">
                  Inversión Total en Stock Inicial
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.contrastText">
                  ${calculateTotal().toLocaleString()}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Resultados */}
      {results && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Resultados de la Carga
          </Typography>
          
          {results.results.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom color="success.main">
                <CheckIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Productos cargados exitosamente: {results.processed}
              </Typography>
              <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                {results.results.map((result, index) => (
                  <Chip
                    key={index}
                    label={`${result.productName}: ${result.quantity} unidades`}
                    size="small"
                    color="success"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {results.errors.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom color="error.main">
                <ErrorIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Errores encontrados: {results.errors.length}
              </Typography>
              <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                {results.errors.map((err, index) => (
                  <Alert key={index} severity="error" sx={{ mb: 1 }}>
                    {err.error}
                  </Alert>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={confirmDialog} onClose={() => !submitting && setConfirmDialog(false)}>
        <DialogTitle>Confirmar Carga de Stock Inicial</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            ¿Estás seguro de cargar el stock inicial para {stockItems.length} producto(s)?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esta acción:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>
              <Typography variant="body2" color="text.secondary">
                Creará movimientos de inventario tipo INITIAL_STOCK
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Actualizará el stock de cada producto
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Registrará una inversión total de <strong>${calculateTotal().toLocaleString()}</strong>
              </Typography>
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {submitting ? 'Cargando...' : 'Confirmar Carga'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockInitial;

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
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Receipt as InvoiceIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useBusinessContext } from '../../../context/BusinessContext';
import { getProducts } from '@shared/api/businessInventoryApi';

const CreateInvoiceModal = ({ open, onClose, onSuccess }) => {
  const { businessId } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    supplierId: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  const [items, setItems] = useState([
    { productId: '', quantity: '', unitCost: '' }
  ]);

  useEffect(() => {
    if (open && businessId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, businessId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Cargar productos y proveedores
      const [productsRes, suppliersRes] = await Promise.all([
        getProducts(businessId, { limit: 1000 }),
        fetch(`${import.meta.env.VITE_API_URL}/business/${businessId}/suppliers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
      ]);

      setProducts(productsRes.data?.products || []);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Si se selecciona un producto, autocompletar precio de costo
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product?.cost) {
        newItems[index].unitCost = product.cost;
      }
    }

    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: '', unitCost: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      toast.error('Debe haber al menos un producto');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const cost = parseFloat(item.unitCost) || 0;
      return sum + (quantity * cost);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.supplierId || !formData.invoiceNumber || !formData.issueDate) {
      setError('Todos los campos obligatorios deben estar completos');
      return;
    }

    const validItems = items.filter(
      item => item.productId && item.quantity && item.unitCost
    );

    if (validItems.length === 0) {
      setError('Debe agregar al menos un producto válido');
      return;
    }

    setLoading(true);

    try {
      const subtotal = calculateSubtotal();
      
      const invoiceData = {
        supplierId: formData.supplierId,
        invoiceNumber: formData.invoiceNumber,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate || null,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity),
          unitCost: parseFloat(item.unitCost)
        })),
        subtotal,
        tax: 0,
        total: subtotal,
        notes: formData.notes
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/business/${businessId}/supplier-invoices`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(invoiceData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear factura');
      }

      toast.success('Factura creada. Ahora distribuye el stock entre sucursales.');
      
      if (onSuccess) {
        onSuccess(data.data);
      }
      
      handleClose();
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplierId: '',
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: ''
    });
    setItems([{ productId: '', quantity: '', unitCost: '' }]);
    setError(null);
    onClose();
  };

  const subtotal = calculateSubtotal();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InvoiceIcon color="primary" />
          <Typography variant="h6">Nueva Factura de Compra</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Paso 1: Crear factura (PENDING) → Luego distribuir stock
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loadingData ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {/* Proveedor */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Proveedor *"
                    value={formData.supplierId}
                    onChange={(e) => handleChange('supplierId', e.target.value)}
                    required
                  >
                    <MenuItem value="">Seleccionar proveedor</MenuItem>
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Número de Factura */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Factura *"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                    required
                    placeholder="Ej: FAC-001"
                  />
                </Grid>

                {/* Fecha de Emisión */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Emisión *"
                    value={formData.issueDate}
                    onChange={(e) => handleChange('issueDate', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Fecha de Vencimiento */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Vencimiento"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Notas */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Notas"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Observaciones sobre la compra..."
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Items */}
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Productos</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                  >
                    Agregar Producto
                  </Button>
                </Box>

                {items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0);

                  return (
                    <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <TextField
                            fullWidth
                            select
                            size="small"
                            label="Producto"
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            required
                          >
                            <MenuItem value="">Seleccionar producto</MenuItem>
                            {products.map((prod) => (
                              <MenuItem key={prod.id} value={prod.id}>
                                {prod.name} ({prod.sku})
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid item xs={6} sm={2}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Cantidad"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            required
                            inputProps={{ min: 0.01, step: 0.01 }}
                          />
                        </Grid>

                        <Grid item xs={6} sm={2}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Costo Unit."
                            value={item.unitCost}
                            onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </Grid>

                        <Grid item xs={10} sm={2}>
                          <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary">
                              Subtotal
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              ${itemTotal.toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={2} sm={1}>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length === 1}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>

                        {product && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Stock actual: {product.currentStock} {product.unit}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  );
                })}
              </Box>

              {/* Total */}
              <Box textAlign="right" mt={2}>
                <Typography variant="h6">
                  Total: <Box component="span" color="primary.main">${subtotal.toLocaleString()}</Box>
                </Typography>
              </Box>
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
            disabled={loading || loadingData}
            startIcon={loading ? <CircularProgress size={20} /> : <InvoiceIcon />}
          >
            {loading ? 'Creando...' : 'Crear Factura'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateInvoiceModal;

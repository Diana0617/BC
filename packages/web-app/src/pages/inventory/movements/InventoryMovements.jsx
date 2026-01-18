import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  Grid,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  ShoppingCart as PurchaseIcon,
  RemoveCircle as AdjustmentIcon,
  TrendingDown as ConsumptionIcon,
  TrendingUp as StockInIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getInventoryMovements } from '@shared/api/businessInventoryApi';
import { useBusinessContext } from '../../../context/BusinessContext';

const InventoryMovements = () => {
  const { businessId } = useBusinessContext();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    productId: '',
    branchId: '',
    movementType: '',
    reason: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  });

  const [showFilters, setShowFilters] = useState(true);

  // Tipos de movimiento con sus colores e iconos
  const movementTypes = {
    PURCHASE: {
      label: 'Compra',
      color: 'success',
      icon: <PurchaseIcon fontSize="small" />,
      bg: '#e8f5e9'
    },
    ADJUSTMENT: {
      label: 'Ajuste',
      color: 'warning',
      icon: <AdjustmentIcon fontSize="small" />,
      bg: '#fff3e0'
    },
    TRANSFER_OUT: {
      label: 'Salida - Transferencia',
      color: 'error',
      icon: <ArrowDownward fontSize="small" />,
      bg: '#ffebee'
    },
    TRANSFER_IN: {
      label: 'Entrada - Transferencia',
      color: 'info',
      icon: <ArrowUpward fontSize="small" />,
      bg: '#e3f2fd'
    },
    SALE: {
      label: 'Venta',
      color: 'secondary',
      icon: <TrendingDown fontSize="small" />,
      bg: '#f3e5f5'
    },
    INITIAL_STOCK: {
      label: 'Stock Inicial',
      color: 'default',
      icon: <StockInIcon fontSize="small" />,
      bg: '#f5f5f5'
    }
  };

  const reasons = {
    STAFF_CONSUMPTION: 'Consumo del Personal',
    BRANCH_TRANSFER: 'Transferencia entre Sucursales',
    INITIAL_STOCK: 'Stock Inicial',
    ADJUSTMENT: 'Ajuste Manual',
    PURCHASE: 'Compra'
  };

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await getInventoryMovements(businessId, params);
      
      setMovements(response.data.movements || []);
      setTotalItems(response.data.pagination?.totalItems || 0);
      setSummary(response.data.summary || null);
    } catch (err) {
      console.error('Error fetching movements:', err);
      setError(err.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchMovements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, businessId]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchMovements();
  };

  const handleClearFilters = () => {
    setFilters({
      productId: '',
      branchId: '',
      movementType: '',
      reason: '',
      userId: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(0);
    setTimeout(fetchMovements, 100);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getMovementIcon = (type) => {
    return movementTypes[type]?.icon || <TransferIcon fontSize="small" />;
  };

  const getMovementColor = (type) => {
    return movementTypes[type]?.color || 'default';
  };

  const getMovementBg = (type) => {
    return movementTypes[type]?.bg || '#ffffff';
  };

  return (
    <Box>
      {/* Header con estadísticas */}
      {summary && (
        <Grid container spacing={2} mb={3}>
          {summary.totals?.map((total, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getMovementIcon(total.movementType)}
                    <Typography variant="body2" color="text.secondary">
                      {movementTypes[total.movementType]?.label || total.movementType}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" mt={1}>
                    {total.count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total: {total.totalQuantity > 0 ? '+' : ''}{total.totalQuantity}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <FilterIcon />
            Filtros
          </Typography>
          <Box>
            <IconButton onClick={() => setShowFilters(!showFilters)} size="small">
              <FilterIcon />
            </IconButton>
            <IconButton onClick={fetchMovements} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {showFilters && (
          <>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Tipo de Movimiento"
                  value={filters.movementType}
                  onChange={(e) => handleFilterChange('movementType', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(movementTypes).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {value.icon}
                        {value.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Razón"
                  value={filters.reason}
                  onChange={(e) => handleFilterChange('reason', e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {Object.entries(reasons).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Desde"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Hasta"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                startIcon={<FilterIcon />}
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                Limpiar
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Tabla de movimientos */}
      <Paper>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Sucursal</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Razón/Notas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary" py={3}>
                          No hay movimientos para mostrar
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((movement) => (
                      <TableRow
                        key={movement.id}
                        sx={{ bgcolor: getMovementBg(movement.movementType) }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(movement.createdAt), 'dd/MM/yyyy', { locale: es })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(movement.createdAt), 'HH:mm', { locale: es })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getMovementIcon(movement.movementType)}
                            label={movementTypes[movement.movementType]?.label || movement.movementType}
                            color={getMovementColor(movement.movementType)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {movement.product?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {movement.product?.sku || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {movement.branch?.name || 'General'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={movement.quantity > 0 ? 'success.main' : 'error.main'}
                          >
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product?.unit || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {movement.user?.name || 'Sistema'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {reasons[movement.reason] || movement.reason}
                          </Typography>
                          {movement.notes && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {movement.notes}
                            </Typography>
                          )}
                          {movement.metadata?.transferFromBranchName && (
                            <Chip
                              label={`Desde: ${movement.metadata.transferFromBranchName}`}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                          {movement.metadata?.transferToBranchName && (
                            <Chip
                              label={`Hacia: ${movement.metadata.transferToBranchName}`}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default InventoryMovements;

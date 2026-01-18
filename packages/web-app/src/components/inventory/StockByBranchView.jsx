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
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  SwapHoriz as TransferIcon,
  RemoveCircle as WithdrawIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { getProducts } from '@shared/api/businessInventoryApi';
import { useBusinessContext } from '../../context/BusinessContext';
import TransferStockModal from './TransferStockModal';
import WithdrawStockModal from './WithdrawStockModal';

const StockByBranchView = ({ branches = [] }) => {
  const { businessId } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0); // 0 = General, 1+ = Branches
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts(businessId, {
        includeInactive: false,
        limit: 1000
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = products.filter(
      p =>
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) {
      return { color: 'error', icon: <WarningIcon fontSize="small" />, label: 'Sin stock' };
    } else if (stock <= minStock) {
      return { color: 'warning', icon: <WarningIcon fontSize="small" />, label: 'Stock bajo' };
    } else {
      return { color: 'success', icon: <CheckIcon fontSize="small" />, label: 'Normal' };
    }
  };

  const renderGeneralStock = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell align="right">Stock Global</TableCell>
            <TableCell align="right">Stock Mínimo</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography color="text.secondary" py={3}>
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => {
              const status = getStockStatus(product.currentStock, product.minStock);
              
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {product.sku || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.category || '-'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {product.currentStock} {product.unit || ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {product.minStock} {product.unit || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={status.icon}
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver distribución por sucursales">
                      <IconButton size="small" onClick={() => {/* Scroll to branches tabs */}}>
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderBranchStock = (branch) => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell align="right">Stock en {branch.name}</TableCell>
            <TableCell align="right">Stock Global</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="text.secondary" py={3}>
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => {
              const branchStock = product.branchStocks?.find(bs => bs.branchId === branch.id);
              const stock = branchStock?.currentStock || 0;
              const minStock = branchStock?.minStock || product.minStock;
              const status = getStockStatus(stock, minStock);
              
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {product.sku || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.category || '-'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color={stock > 0 ? 'text.primary' : 'error.main'}>
                      {stock} {product.unit || ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {product.currentStock} {product.unit || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={status.icon}
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Header con búsqueda y acciones */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <TextField
            size="small"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <Box display="flex" gap={1}>
            <Tooltip title="Transferir entre sucursales">
              <Button
                variant="outlined"
                startIcon={<TransferIcon />}
                onClick={() => setShowTransferModal(true)}
                disabled={branches.length < 2}
              >
                Transferir
              </Button>
            </Tooltip>

            <Tooltip title="Retirar stock (consumo)">
              <Button
                variant="outlined"
                color="warning"
                startIcon={<WithdrawIcon />}
                onClick={() => setShowWithdrawModal(true)}
              >
                Retirar
              </Button>
            </Tooltip>

            <Tooltip title="Actualizar">
              <IconButton onClick={fetchProducts} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Tabs: General + Sucursales */}
      <Paper>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Stock General" />
          {branches.map((branch) => (
            <Tab key={branch.id} label={branch.name} />
          ))}
        </Tabs>

        <Box p={2}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {selectedTab === 0 && renderGeneralStock()}
              {branches.map((branch, index) => 
                selectedTab === index + 1 && renderBranchStock(branch)
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* Modals */}
      <TransferStockModal
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={fetchProducts}
        products={products}
        branches={branches}
      />

      <WithdrawStockModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={fetchProducts}
        products={products}
        branches={branches}
      />
    </Box>
  );
};

export default StockByBranchView;

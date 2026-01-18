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
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  CallSplit as DistributeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useBusinessContext } from '../../../context/BusinessContext';
import supplierInvoicesApi from '@shared/api/supplierInvoicesApi';
import CreateInvoiceModal from './CreateInvoiceModal';
import DistributeStockModal from './DistributeStockModal';

const PurchaseInvoices = () => {
  const { businessId } = useBusinessContext();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await supplierInvoicesApi.getInvoices(businessId);
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDistributeModal(true);
  };

  const handleApproveClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowConfirmApprove(true);
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/business/${businessId}/supplier-invoices/${selectedInvoice.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al aprobar factura');
      }

      toast.success('Factura aprobada exitosamente');
      setShowConfirmApprove(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error('Error approving invoice:', error);
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'APPROVED':
        return 'Aprobada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Facturas de Compra
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona las compras a proveedores y distribución de stock
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Actualizar">
            <IconButton onClick={fetchInvoices} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateModal(true)}
          >
            Nueva Factura
          </Button>
        </Box>
      </Box>

      {/* Info sobre el flujo */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Flujo:</strong> 1. Crear factura (PENDING) → 2. Distribuir stock entre sucursales → 3. Aprobar factura
        </Typography>
      </Alert>

      {/* Tabla de facturas */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" py={3}>
                        No hay facturas registradas
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => {
                    const isDistributed = invoice.metadata?.stockDistributed;
                    const canDistribute = invoice.status === 'PENDING' && !isDistributed;
                    const canApprove = invoice.status === 'PENDING' && isDistributed;

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {invoice.invoiceNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {invoice.supplier?.name || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(invoice.issueDate), 'dd/MM/yyyy', { locale: es })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            ${invoice.total?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(invoice.status)}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {invoice.status === 'PENDING' && (
                            <Chip
                              label={isDistributed ? 'Distribuido' : 'Sin distribuir'}
                              color={isDistributed ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            {canDistribute && (
                              <Tooltip title="Distribuir stock entre sucursales">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleDistribute(invoice)}
                                >
                                  <DistributeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canApprove && (
                              <Tooltip title="Aprobar factura">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApproveClick(invoice)}
                                >
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Ver detalles">
                              <IconButton size="small">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modals */}
      <CreateInvoiceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchInvoices}
      />

      {selectedInvoice && (
        <DistributeStockModal
          open={showDistributeModal}
          onClose={() => {
            setShowDistributeModal(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onSuccess={fetchInvoices}
        />
      )}

      {/* Confirm Approve Dialog */}
      <Dialog open={showConfirmApprove} onClose={() => setShowConfirmApprove(false)}>
        <DialogTitle>Confirmar Aprobación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de aprobar la factura <strong>{selectedInvoice?.invoiceNumber}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            El stock ya ha sido distribuido. Esta acción finalizará el proceso y no se podrá modificar.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmApprove(false)}>
            Cancelar
          </Button>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Aprobar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseInvoices;

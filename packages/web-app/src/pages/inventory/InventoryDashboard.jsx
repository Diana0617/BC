import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import {
  Inventory as InventoryIcon,
  Upload as UploadIcon,
  ShoppingCart as PurchaseIcon,
  PointOfSale as SalesIcon,
  Build as ConsumptionIcon,
  Assignment as MovementsIcon
} from '@mui/icons-material';

// Componentes de las pestañas
import StockInitial from './stock/StockInitial';
import InventoryMovements from './movements/InventoryMovements';

// Componentes pendientes (crearemos después)
const ProductsList = () => (
  <Box p={3}>
    <Typography variant="h5">Lista de Productos</Typography>
    <Typography color="text.secondary">En desarrollo...</Typography>
  </Box>
);

const PurchaseOrders = () => (
  <Box p={3}>
    <Typography variant="h5">Órdenes de Compra</Typography>
    <Typography color="text.secondary">En desarrollo...</Typography>
  </Box>
);

const ProductSales = () => (
  <Box p={3}>
    <Typography variant="h5">Ventas de Productos</Typography>
    <Typography color="text.secondary">En desarrollo...</Typography>
  </Box>
);

const InternalConsumption = () => (
  <Box p={3}>
    <Typography variant="h5">Consumo Interno</Typography>
    <Typography color="text.secondary">En desarrollo...</Typography>
  </Box>
);

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    {
      label: 'Stock Inicial',
      icon: <UploadIcon />,
      component: <StockInitial />
    },
    {
      label: 'Productos',
      icon: <InventoryIcon />,
      component: <ProductsList />
    },
    {
      label: 'Compras',
      icon: <PurchaseIcon />,
      component: <PurchaseOrders />
    },
    {
      label: 'Ventas',
      icon: <SalesIcon />,
      component: <ProductSales />
    },
    {
      label: 'Consumo',
      icon: <ConsumptionIcon />,
      component: <InternalConsumption />
    },
    {
      label: 'Movimientos',
      icon: <MovementsIcon />,
      component: <InventoryMovements />
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          📦 Gestión de Inventario
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra productos, compras, ventas y movimientos de inventario
        </Typography>
      </Box>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabs[activeTab].component}
      </Box>
    </Box>
  );
};

export default InventoryDashboard;

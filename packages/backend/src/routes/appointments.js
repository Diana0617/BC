const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const tenancyMiddleware = require('../middleware/tenancy');
const { allStaffRoles } = require('../middleware/roleCheck');

// Todas las rutas de citas requieren autenticación
router.use(authMiddleware);
router.use(tenancyMiddleware);
router.use(allStaffRoles);

// Obtener lista de citas
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener citas aún no implementada'
  });
});

// Crear nueva cita
router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear cita aún no implementada'
  });
});

// Obtener cita por ID
router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener cita por ID aún no implementada'
  });
});

// Actualizar cita
router.put('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar cita aún no implementada'
  });
});

// Cancelar cita
router.patch('/:id/cancel', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de cancelar cita aún no implementada'
  });
});

// Completar cita
router.patch('/:id/complete', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de completar cita aún no implementada'
  });
});

// Subir evidencia de cita
router.post('/:id/evidence', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de subir evidencia aún no implementada'
  });
});

module.exports = router;
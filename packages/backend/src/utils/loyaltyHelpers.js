/**
 * Utilidades para el sistema de Fidelización
 */

/**
 * Generar código único de referido para un cliente
 * Formato: REF-ABC123
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'REF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generar código único de recompensa
 * Formato: RWD-ABC123XYZ
 */
function generateRewardCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RWD-';
  for (let i = 0; i < 9; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 2 || i === 5) code += '-';
  }
  return code;
}

/**
 * Calcular puntos según monto y multiplicador
 * @param {number} amount - Monto en dinero
 * @param {number} pointsPerUnit - Puntos por cada unidad monetaria (ej: 1 punto por cada $1000)
 * @param {number} multiplier - Multiplicador (ej: 1.5 para promociones)
 * @returns {number} Cantidad de puntos calculados
 */
function calculatePoints(amount, pointsPerUnit = 1, multiplier = 1) {
  if (!amount || amount <= 0) return 0;
  const basePoints = Math.floor(amount * pointsPerUnit);
  return Math.floor(basePoints * multiplier);
}

/**
 * Calcular fecha de expiración de puntos
 * @param {number} validityDays - Días de validez (desde hoy)
 * @returns {Date} Fecha de expiración
 */
function calculatePointsExpiration(validityDays = 365) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + validityDays);
  return expirationDate;
}

/**
 * Calcular fecha de expiración de recompensa
 * @param {number} validityDays - Días de validez (desde hoy)
 * @returns {Date} Fecha de expiración
 */
function calculateRewardExpiration(validityDays = 30) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + validityDays);
  return expirationDate;
}

module.exports = {
  generateReferralCode,
  generateRewardCode,
  calculatePoints,
  calculatePointsExpiration,
  calculateRewardExpiration
};

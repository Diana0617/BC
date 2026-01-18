import * as XLSX from 'xlsx';

/**
 * Formatea un número como moneda colombiana
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea una fecha en formato legible
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Traduce el tipo de movimiento
 */
const translateType = (type) => {
  const types = {
    'INCOME': 'Ingreso',
    'EXPENSE': 'Gasto',
  };
  return types[type] || type;
};

/**
 * Traduce el método de pago
 */
const translatePaymentMethod = (method) => {
  const methods = {
    'CASH': 'Efectivo',
    'CARD': 'Tarjeta',
    'TRANSFER': 'Transferencia',
    'DIGITAL_WALLET': 'Billetera Digital',
  };
  return methods[method] || method;
};

/**
 * Traduce el estado
 */
const translateStatus = (status) => {
  const statuses = {
    'PENDING': 'Pendiente',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado',
  };
  return statuses[status] || status;
};

/**
 * Exporta movimientos financieros a un archivo Excel
 * @param {Array} movements - Array de movimientos financieros
 * @param {Object} filters - Filtros aplicados (fechas, tipo, etc.)
 * @param {String} businessName - Nombre del negocio
 */
export const exportMovementsToExcel = (movements, filters = {}, businessName = 'Negocio') => {
  // Preparar los datos para el Excel
  const excelData = movements.map((movement) => ({
    'Fecha': formatDate(movement.transactionDate || movement.createdAt),
    'Tipo': translateType(movement.type),
    'Categoría': movement.category || '',
    'Descripción': movement.description || '',
    'Método de Pago': translatePaymentMethod(movement.paymentMethod),
    'Monto': movement.amount,
    'Estado': translateStatus(movement.status),
    'Usuario': movement.user?.name || movement.user?.email || '',
  }));

  // Crear hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Configurar anchos de columna
  const columnWidths = [
    { wch: 20 }, // Fecha
    { wch: 10 }, // Tipo
    { wch: 20 }, // Categoría
    { wch: 40 }, // Descripción
    { wch: 18 }, // Método de Pago
    { wch: 15 }, // Monto
    { wch: 12 }, // Estado
    { wch: 25 }, // Usuario
  ];
  worksheet['!cols'] = columnWidths;

  // Crear libro de trabajo
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

  // Agregar hoja de resumen
  const summaryData = calculateSummary(movements);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  // Generar nombre de archivo
  const dateRange = filters.startDate && filters.endDate
    ? `${new Date(filters.startDate).toLocaleDateString('es-CO')}_${new Date(filters.endDate).toLocaleDateString('es-CO')}`
    : new Date().toLocaleDateString('es-CO');
  
  const filename = `Movimientos_${businessName.replace(/\s+/g, '_')}_${dateRange}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, filename);

  return filename;
};

/**
 * Calcula el resumen de movimientos
 */
const calculateSummary = (movements) => {
  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    byPaymentMethod: {},
    byCategory: {},
  };

  movements.forEach((movement) => {
    const amount = parseFloat(movement.amount) || 0;
    
    // Total por tipo
    if (movement.type === 'INCOME') {
      summary.totalIncome += amount;
    } else if (movement.type === 'EXPENSE') {
      summary.totalExpense += amount;
    }

    // Total por método de pago
    const method = translatePaymentMethod(movement.paymentMethod);
    if (!summary.byPaymentMethod[method]) {
      summary.byPaymentMethod[method] = { income: 0, expense: 0 };
    }
    if (movement.type === 'INCOME') {
      summary.byPaymentMethod[method].income += amount;
    } else {
      summary.byPaymentMethod[method].expense += amount;
    }

    // Total por categoría
    const category = movement.category || 'Sin categoría';
    if (!summary.byCategory[category]) {
      summary.byCategory[category] = 0;
    }
    summary.byCategory[category] += movement.type === 'INCOME' ? amount : -amount;
  });

  // Preparar datos para el Excel
  const summaryArray = [
    { 'Concepto': 'Total Ingresos', 'Valor': formatCurrency(summary.totalIncome) },
    { 'Concepto': 'Total Gastos', 'Valor': formatCurrency(summary.totalExpense) },
    { 'Concepto': 'Balance', 'Valor': formatCurrency(summary.totalIncome - summary.totalExpense) },
    { 'Concepto': '', 'Valor': '' }, // Espacio en blanco
    { 'Concepto': 'POR MÉTODO DE PAGO', 'Valor': '' },
  ];

  // Agregar resumen por método de pago
  Object.entries(summary.byPaymentMethod).forEach(([method, values]) => {
    summaryArray.push({
      'Concepto': `${method} - Ingresos`,
      'Valor': formatCurrency(values.income),
    });
    summaryArray.push({
      'Concepto': `${method} - Gastos`,
      'Valor': formatCurrency(values.expense),
    });
    summaryArray.push({
      'Concepto': `${method} - Balance`,
      'Valor': formatCurrency(values.income - values.expense),
    });
  });

  summaryArray.push({ 'Concepto': '', 'Valor': '' }); // Espacio en blanco
  summaryArray.push({ 'Concepto': 'POR CATEGORÍA', 'Valor': '' });

  // Agregar resumen por categoría
  Object.entries(summary.byCategory)
    .sort((a, b) => b[1] - a[1]) // Ordenar por monto descendente
    .forEach(([category, amount]) => {
      summaryArray.push({
        'Concepto': category,
        'Valor': formatCurrency(amount),
      });
    });

  return summaryArray;
};

/**
 * Exporta balance por método de pago a Excel
 */
export const exportPaymentMethodBalanceToExcel = (movements, businessName = 'Negocio') => {
  const paymentMethodTotals = {};

  movements.forEach((movement) => {
    const method = movement.paymentMethod;
    if (!paymentMethodTotals[method]) {
      paymentMethodTotals[method] = { income: 0, expense: 0, balance: 0 };
    }

    const amount = parseFloat(movement.amount) || 0;
    if (movement.type === 'INCOME') {
      paymentMethodTotals[method].income += amount;
    } else if (movement.type === 'EXPENSE') {
      paymentMethodTotals[method].expense += amount;
    }
  });

  // Calcular balances
  Object.keys(paymentMethodTotals).forEach((method) => {
    paymentMethodTotals[method].balance = 
      paymentMethodTotals[method].income - paymentMethodTotals[method].expense;
  });

  // Preparar datos para Excel
  const excelData = Object.entries(paymentMethodTotals).map(([method, totals]) => ({
    'Método de Pago': translatePaymentMethod(method),
    'Total Ingresos': formatCurrency(totals.income),
    'Total Gastos': formatCurrency(totals.expense),
    'Balance': formatCurrency(totals.balance),
  }));

  // Agregar fila de totales
  const totalIncome = Object.values(paymentMethodTotals).reduce((sum, t) => sum + t.income, 0);
  const totalExpense = Object.values(paymentMethodTotals).reduce((sum, t) => sum + t.expense, 0);
  excelData.push({
    'Método de Pago': 'TOTAL',
    'Total Ingresos': formatCurrency(totalIncome),
    'Total Gastos': formatCurrency(totalExpense),
    'Balance': formatCurrency(totalIncome - totalExpense),
  });

  // Crear hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [
    { wch: 20 }, // Método de Pago
    { wch: 18 }, // Total Ingresos
    { wch: 18 }, // Total Gastos
    { wch: 18 }, // Balance
  ];

  // Crear libro de trabajo
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Balance por Método');

  // Generar nombre de archivo
  const filename = `Balance_Metodos_Pago_${businessName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('es-CO')}.xlsx`;

  // Descargar archivo
  XLSX.writeFile(workbook, filename);

  return filename;
};

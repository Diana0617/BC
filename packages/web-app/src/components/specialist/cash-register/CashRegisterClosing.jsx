import  { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

/**
 * Formulario para cerrar turno de caja
 * Conteo final, cuadre y generación de reporte
 */
export default function CashRegisterClosing({ 
  shiftId,
  shiftData,
  onSuccess,
  onCancel 
}) {
  const { token, user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [formData, setFormData] = useState({
    closingAmount: '',
    notes: '',
    denominationBreakdown: {
      bills_100000: 0,
      bills_50000: 0,
      bills_20000: 0,
      bills_10000: 0,
      bills_5000: 0,
      bills_2000: 0,
      bills_1000: 0,
      coins_500: 0,
      coins_200: 0,
      coins_100: 0,
      coins_50: 0
    }
  });

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [difference, setDifference] = useState(0);

  const denominations = [
    { key: 'bills_100000', label: '$100,000', value: 100000 },
    { key: 'bills_50000', label: '$50,000', value: 50000 },
    { key: 'bills_20000', label: '$20,000', value: 20000 },
    { key: 'bills_10000', label: '$10,000', value: 10000 },
    { key: 'bills_5000', label: '$5,000', value: 5000 },
    { key: 'bills_2000', label: '$2,000', value: 2000 },
    { key: 'bills_1000', label: '$1,000', value: 1000 },
    { key: 'coins_500', label: '$500', value: 500 },
    { key: 'coins_200', label: '$200', value: 200 },
    { key: 'coins_100', label: '$100', value: 100 },
    { key: 'coins_50', label: '$50', value: 50 }
  ];

  // Definir calculateExpectedAmount antes de usarlo
  const calculateExpectedAmount = useCallback(() => {
    if (!shiftData) return 0;
    
    const opening = parseFloat(shiftData.openingBalance) || 0;
    const income = parseFloat(shiftData.totalIncome) || 0;
    const expenses = parseFloat(shiftData.totalExpenses) || 0;
    
    return opening + income - expenses;
  }, [shiftData]);

  useEffect(() => {
    console.log('CashRegisterClosing - shiftData:', shiftData);
    const closingAmount = parseFloat(formData.closingAmount) || 0;
    const expectedAmount = calculateExpectedAmount();
    setDifference(closingAmount - expectedAmount);
  }, [formData.closingAmount, shiftData, calculateExpectedAmount]);

  // Cargar movimientos del turno
  useEffect(() => {
    const loadMovements = async () => {
      if (!shiftId || !user?.businessId || !token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/cash-register/shift/${shiftId}/movements?businessId=${user.businessId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log('Movements loaded for PDF:', result.data?.movements);
          setMovements(result.data?.movements || []);
        }
      } catch (error) {
        console.error('Error loading movements:', error);
      }
    };

    loadMovements();
  }, [shiftId, user?.businessId, token]);

  const calculateBreakdownTotal = () => {
    return denominations.reduce((total, denom) => {
      return total + (formData.denominationBreakdown[denom.key] * denom.value);
    }, 0);
  };

  const handleDenominationChange = (key, value) => {
    const numValue = parseInt(value) || 0;
    setFormData({
      ...formData,
      denominationBreakdown: {
        ...formData.denominationBreakdown,
        [key]: numValue
      }
    });
  };

  const handleUseBreakdown = () => {
    const total = calculateBreakdownTotal();
    setFormData({ ...formData, closingAmount: total.toString() });
    setShowBreakdown(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const downloadPDF = async () => {
    if (!shiftData) return;

    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');
      const { format } = await import('date-fns');
      const { es } = await import('date-fns/locale');
      
      // Calcular expectedAmount actualizado al momento de generar el PDF
      const expectedAmount = calculateExpectedAmount();
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Título
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Resumen de Cierre de Caja', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const currentDate = format(new Date(), "dd/MM/yyyy, hh:mm a", { locale: es });
      doc.text(`Fecha: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;

      // Información del usuario y fechas del turno
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Informacion del Turno', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      if (shiftData.user) {
        doc.text(`Usuario: ${shiftData.user.firstName} ${shiftData.user.lastName}`, 20, yPos);
        yPos += 6;
      }
      
      if (shiftData.openedAt) {
        const openedDate = format(new Date(shiftData.openedAt), "dd/MM/yyyy, hh:mm a", { locale: es });
        doc.text(`Apertura: ${openedDate}`, 20, yPos);
        yPos += 6;
      }
      
      if (shiftData.closedAt) {
        const closedDate = format(new Date(shiftData.closedAt), "dd/MM/yyyy, hh:mm a", { locale: es });
        doc.text(`Cierre: ${closedDate}`, 20, yPos);
        yPos += 6;
      } else {
        doc.text(`Cierre: En proceso...`, 20, yPos);
        yPos += 6;
      }

      yPos += 5;

      // Información del turno
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Resumen del Turno', 20, yPos);
      
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const lines = [
        `Balance Inicial: ${formatCurrency(shiftData.openingBalance)}`,
        `Total Ingresos: +${formatCurrency(shiftData.totalIncome)}`,
        `Total Egresos: -${formatCurrency(shiftData.totalExpenses)}`,
        `Numero de Movimientos: ${shiftData.movementsCount || 0}`,
        ``,
        `Monto Esperado: ${formatCurrency(expectedAmount)}`
      ];

      lines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });

      if (formData.closingAmount) {
        yPos += 3;
        doc.setFont(undefined, 'bold');
        doc.text(`Monto Real en Caja: ${formatCurrency(parseFloat(formData.closingAmount))}`, 20, yPos);
        yPos += 6;
        
        const diffText = difference > 0 ? 'Sobrante' : difference < 0 ? 'Faltante' : 'Cuadrado';
        doc.text(`Diferencia (${diffText}): ${formatCurrency(Math.abs(difference))}`, 20, yPos);
        yPos += 8;
      }

      // Detalle de Movimientos
      if (movements && movements.length > 0) {
        yPos += 5;
        
        // Verificar si hay espacio para el título, si no, nueva página
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Detalle de Movimientos', 20, yPos);
        yPos += 8;

        doc.setFontSize(9);
        
        // Encabezado de tabla
        doc.setFont(undefined, 'bold');
        doc.text('Tipo', 20, yPos);
        doc.text('Descripcion', 40, yPos);
        doc.text('Especialista', 95, yPos);
        doc.text('Metodo', 130, yPos);
        doc.text('Fecha', 155, yPos);
        doc.text('Monto', 180, yPos);
        yPos += 4;
        
        // Línea divisoria
        doc.setDrawColor(100, 100, 100);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 5;

        doc.setFont(undefined, 'normal');

        // Movimientos
        movements.forEach((movement, index) => {
          // Verificar si necesitamos una nueva página
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
            
            // Repetir encabezado
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.text('Tipo', 20, yPos);
            doc.text('Descripcion', 40, yPos);
            doc.text('Especialista', 95, yPos);
            doc.text('Metodo', 130, yPos);
            doc.text('Fecha', 155, yPos);
            doc.text('Monto', 180, yPos);
            yPos += 4;
            doc.setDrawColor(100, 100, 100);
            doc.line(20, yPos, pageWidth - 20, yPos);
            yPos += 5;
            doc.setFont(undefined, 'normal');
          }

          const tipo = movement.type === 'INCOME' ? 'Ingreso' : 'Egreso';
          const descripcion = movement.description.length > 20 
            ? movement.description.substring(0, 17) + '...' 
            : movement.description;
          const especialista = movement.specialistName 
            ? (movement.specialistName.length > 15 ? movement.specialistName.substring(0, 12) + '...' : movement.specialistName)
            : '-';
          const metodo = movement.paymentMethod 
            ? (movement.paymentMethod === 'CASH' ? 'Efect.' :
               movement.paymentMethod === 'CARD' ? 'Tarj.' :
               movement.paymentMethod === 'TRANSFER' ? 'Transf' :
               movement.paymentMethod === 'WOMPI' ? 'Wompi' :
               movement.paymentMethod)
            : '-';
          const fecha = format(new Date(movement.createdAt), "dd/MM HH:mm", { locale: es });
          const monto = `${movement.type === 'INCOME' ? '+' : '-'}${formatCurrency(movement.amount)}`;

          doc.text(tipo, 20, yPos);
          doc.text(descripcion, 40, yPos);
          doc.text(especialista, 95, yPos);
          doc.text(metodo, 130, yPos);
          doc.text(fecha, 155, yPos);
          doc.text(monto, 180, yPos);
          
          yPos += 6;

          // Línea sutil cada 5 movimientos
          if ((index + 1) % 5 === 0 && (index + 1) < movements.length) {
            doc.setDrawColor(220, 220, 220);
            doc.line(20, yPos - 1, pageWidth - 20, yPos - 1);
            yPos += 2;
          }
        });

        yPos += 5;
      }

      // Notas
      if (formData.notes) {
        // Verificar espacio para notas
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }

        yPos += 5;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Notas:', 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const splitNotes = doc.splitTextToSize(formData.notes, pageWidth - 40);
        doc.text(splitNotes, 20, yPos);
      }

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Pagina ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Guardar PDF
      const fileName = `cierre-caja-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(formData.closingAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Ingresa un monto válido');
      return;
    }

    // Advertencia si hay diferencia significativa
    if (Math.abs(difference) > 10000) {
      const confirm = window.confirm(
        `Hay una diferencia de ${formatCurrency(difference)}. ¿Deseas continuar con el cierre?`
      );
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/close-shift`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId: user.businessId,
            actualClosingBalance: amount,
            closingNotes: formData.notes || null
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error closing shift');
      }

      const data = await response.json();
      alert('Turno de caja cerrado exitosamente');
      onSuccess?.(data);
    } catch (error) {
      console.error('Error closing shift:', error);
      alert('Error al cerrar el turno. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const expectedAmount = calculateExpectedAmount();
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <BanknotesIcon className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Cerrar Turno de Caja
        </h3>
        <p className="text-gray-600">
          Realiza el conteo final y cuadra la caja
        </p>
      </div>

      {/* Resumen del Turno */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-4">Resumen del Turno</h4>
        
        {/* Información del usuario y fechas */}
        {(shiftData?.user || shiftData?.openedAt) && (
          <div className="mb-4 pb-4 border-b border-blue-200">
            {shiftData.user && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Usuario:</span> {shiftData.user.firstName} {shiftData.user.lastName}
              </p>
            )}
            {shiftData.openedAt && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Apertura:</span> {new Date(shiftData.openedAt).toLocaleString('es-CO')}
              </p>
            )}
            {shiftData.closedAt && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Cierre:</span> {new Date(shiftData.closedAt).toLocaleString('es-CO')}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Balance Inicial</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(shiftData?.openingBalance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Ingresos</p>
            <p className="text-xl font-bold text-green-600">
              +{formatCurrency(shiftData?.totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Egresos</p>
            <p className="text-xl font-bold text-red-600">
              -{formatCurrency(shiftData?.totalExpenses)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Movimientos</p>
            <p className="text-xl font-bold text-gray-900">
              {shiftData?.movementsCount || 0}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Monto Esperado:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(expectedAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto de Cierre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto Real en Caja *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              value={formData.closingAmount}
              onChange={(e) => setFormData({ ...formData, closingAmount: e.target.value })}
              min="0"
              step="1000"
              required
              disabled={showBreakdown}
              className="w-full pl-8 pr-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="0"
            />
          </div>
          {formData.closingAmount && (
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(parseFloat(formData.closingAmount) || 0)}
            </p>
          )}
        </div>

        {/* Diferencia */}
        {formData.closingAmount && (
          <div className={`rounded-xl p-4 border-2 ${
            Math.abs(difference) < 1000
              ? 'bg-green-50 border-green-200'
              : Math.abs(difference) < 10000
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalculatorIcon className={`w-6 h-6 ${
                  Math.abs(difference) < 1000
                    ? 'text-green-600'
                    : Math.abs(difference) < 10000
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`} />
                <span className="font-semibold text-gray-900">Diferencia:</span>
              </div>
              <span className={`text-2xl font-bold ${
                difference > 0 ? 'text-green-600' :
                difference < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {difference > 0 && '+'}{formatCurrency(difference)}
              </span>
            </div>
            {Math.abs(difference) > 0 && (
              <p className="text-sm mt-2 text-gray-700">
                {difference > 0 ? '💰 Hay un sobrante' : '⚠️ Hay un faltante'} de {formatCurrency(Math.abs(difference))}
              </p>
            )}
          </div>
        )}

        {/* Botón Desglose */}
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <CurrencyDollarIcon className="w-5 h-5" />
          {showBreakdown ? 'Ocultar Desglose' : 'Agregar Desglose de Denominaciones'}
        </button>

        {/* Desglose de Denominaciones */}
        {showBreakdown && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3">
              Conteo por Denominación
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {denominations.map(denom => (
                <div key={denom.key} className="bg-white rounded-lg p-3 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {denom.label}
                  </label>
                  <input
                    type="number"
                    value={formData.denominationBreakdown[denom.key]}
                    onChange={(e) => handleDenominationChange(denom.key, e.target.value)}
                    min="0"
                    className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {formatCurrency(formData.denominationBreakdown[denom.key] * denom.value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-red-50 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Total Conteo:</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(calculateBreakdownTotal())}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseBreakdown}
                className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Usar este Monto
              </button>
            </div>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas de Cierre (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            placeholder="Observaciones sobre el cierre del turno..."
          />
        </div>

        {/* Advertencia de Diferencia */}
        {Math.abs(difference) > 10000 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Diferencia Significativa</p>
                <p className="text-sm text-red-700 mt-1">
                  La diferencia es mayor a $10,000. Por favor verifica el conteo 
                  y explica la diferencia en las notas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="space-y-3 pt-4">
          {/* Botón Descargar PDF */}
          {shiftData && (
            <button
              type="button"
              onClick={downloadPDF}
              className="w-full px-6 py-3 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              Descargar Resumen PDF
            </button>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XMarkIcon className="w-5 h-5" />
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || !formData.closingAmount}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Cerrando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Cerrar Turno
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

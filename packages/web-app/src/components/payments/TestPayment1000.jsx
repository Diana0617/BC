import React, { useState } from 'react';
import WompiWidgetMinimal from '../subscription/WompiWidgetMinimal';

const TestPayment1000 = () => {
  const [testData] = useState({
    amount: 1000, // 1000 COP
    currency: 'COP',
    reference: `test-1000-${Date.now()}`,
    customerEmail: 'test@example.com',
    customerName: 'Prueba Usuario',
    customerPhone: '3001234567',
    description: 'Prueba de pago 1000 COP'
  });

  const [showWidget, setShowWidget] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Prueba de Pago - 1000 COP
      </h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Detalles de la prueba:</h3>
        <ul className="text-sm space-y-1">
          <li><strong>Monto:</strong> {testData.amount} {testData.currency}</li>
          <li><strong>Referencia:</strong> {testData.reference}</li>
          <li><strong>Email:</strong> {testData.customerEmail}</li>
          <li><strong>Descripción:</strong> {testData.description}</li>
        </ul>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Modo Producción</h3>
        <p className="text-sm text-yellow-700">
          Estás usando claves de producción. Este será un pago real de 1000 COP.
          Usa una tarjeta real (puede ser sin fondos para ver errores específicos).
        </p>
      </div>

      {!showWidget ? (
        <button
          onClick={() => setShowWidget(true)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Iniciar Prueba de Pago
        </button>
      ) : (
        <div>
          <WompiWidgetMinimal 
            {...testData}
          />
          <button
            onClick={() => setShowWidget(false)}
            className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar Prueba
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-800">Consejos para la prueba:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Usa una tarjeta real (débito o crédito)</li>
          <li>• Si no tiene fondos, verás errores específicos de Wompi</li>
          <li>• Observa la consola del navegador para logs</li>
          <li>• El proceso abrirá Wompi en una nueva ventana</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPayment1000;
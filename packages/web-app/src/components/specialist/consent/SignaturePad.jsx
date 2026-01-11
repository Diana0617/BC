import React, { useRef, useState, useEffect } from 'react';
import { 
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Canvas para captura de firma digital
 * Soporta mouse y touch
 */
export default function SignaturePad({ onSave, onClear }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);

      // Ajustar tamaño del canvas
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = 200;

    // Redraw after resize if needed
    if (context) {
      context.strokeStyle = '#000000';
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
  };

  const startDrawing = (e) => {
    if (!context) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    context.lineTo(x, y);
    context.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!context) return;
    setIsDrawing(false);
    context.closePath();

    // Guardar firma automáticamente
    if (hasDrawn) {
      saveSignature();
    }
  };

  const clearSignature = () => {
    if (!context || !canvasRef.current) return;

    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onClear?.();
  };

  const saveSignature = () => {
    if (!canvasRef.current || !hasDrawn) return;

    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSave?.(signatureData);
  };

  return (
    <div className="space-y-3">
      {/* Canvas Container */}
      <div className="relative border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* Placeholder cuando está vacío */}
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <PencilIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Firma aquí</p>
            </div>
          </div>
        )}

        {/* Indicador de dibujando */}
        {isDrawing && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            ✍️ Firmando...
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={clearSignature}
          disabled={!hasDrawn}
          className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Limpiar
        </button>

        {hasDrawn && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircleIcon className="w-5 h-5" />
            Firma Capturada
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          <PencilIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Instrucciones:</strong> Usa el mouse o tu dedo (en pantalla táctil) 
            para firmar en el espacio de arriba. La firma se guardará automáticamente.
          </span>
        </p>
      </div>
    </div>
  );
}

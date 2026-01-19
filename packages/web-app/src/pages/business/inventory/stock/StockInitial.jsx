import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PlusIcon,
  TrashIcon,
  SaveIcon,
  UploadIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  Loader2Icon,
  BuildingIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { fetchProducts, clearProductsError } from "@shared";
import branchApi from "../../../../api/branchApi";
import branchInventoryApi from "../../../../api/branchInventoryApi";

const StockInitial = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    products: productsData,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.products);

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState(null);

  // Cargar sucursales
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        setBranchError(null);
        const response = await branchApi.getBranches(user.businessId);
        const branchesData = response.data || [];

        if (branchesData.length === 0) {
          // Si no hay sucursales, mostrar error indicando que deben completar la configuración inicial
          setBranchError(
            "No hay sucursales configuradas. Por favor, completa la configuración inicial del negocio."
          );
          setBranches([]);
          setSelectedBranch(null);
        } else {
          setBranches(branchesData);
          // Auto-seleccionar la primera sucursal (generalmente la principal)
          setSelectedBranch(branchesData[0].id);
        }
      } catch (err) {
        console.error("Error loading branches:", err);
        setBranchError(
          "Error al cargar las sucursales. Por favor, intenta nuevamente."
        );
        setBranches([]);
        setSelectedBranch(null);
      } finally {
        setLoadingBranches(false);
      }
    };

    if (user?.businessId) {
      loadBranches();
    }
  }, [user?.businessId]);

  useEffect(() => {
    if (selectedBranch) {
      dispatch(
        fetchProducts({
          isActive: true,
          trackInventory: true,
          limit: 1000,
        })
      );
    }
  }, [dispatch, selectedBranch]);

  // Filter products with no stock
  const productsWithoutStock = productsData.filter((p) => p.currentStock === 0);
  const products = productsWithoutStock;
  const loading = productsLoading;
  const error = productsError;

  const handleAddProduct = (product) => {
    if (stockItems.find((item) => item.productId === product.id)) {
      return;
    }

    setStockItems([
      ...stockItems,
      {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unit: product.unit,
        quantity: 1,
        unitCost: product.cost || 0,
      },
    ]);
  };

  const handleRemoveProduct = (productId) => {
    setStockItems(stockItems.filter((item) => item.productId !== productId));
  };

  const handleQuantityChange = (productId, value) => {
    setStockItems(
      stockItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: parseInt(value) || 0 }
          : item
      )
    );
  };

  const handleCostChange = (productId, value) => {
    setStockItems(
      stockItems.map((item) =>
        item.productId === productId
          ? { ...item, unitCost: parseFloat(value) || 0 }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return stockItems.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );
  };

  const handleDownloadTemplate = () => {
    // Crear plantilla CSV con ejemplos actualizados incluyendo Descripción, Barcode y Sucursal
    const headers = [
      "SKU",
      "Nombre Producto",
      "Descripción",
      "Barcode",
      "Categoría",
      "Precio Venta",
      "Costo Unitario",
      "Cantidad",
      "Unidad",
      "Sucursal (ID o Nombre)", // Nueva columna
    ];

    // Generar comentario con sucursales disponibles
    const branchesComment = branches.length > 0 
      ? `# Sucursales disponibles:\n${branches.map(b => `# - ${b.name} (ID: ${b.id})`).join('\n')}\n`
      : '# No hay sucursales disponibles\n';

    const example1 = [
      "PROD001",
      "Shampoo Keratina 500ml",
      "Shampoo reparador con keratina para cabello dañado",
      "7501234567890",
      "Cuidado Capilar",
      "45000",
      "25000",
      "10",
      "unidad",
      branches[0]?.id || "ID_SUCURSAL", // ID de la primera sucursal o placeholder
    ];
    const example2 = [
      "PROD002",
      "Tinte Rubio Ceniza",
      "",
      "",
      "Coloración",
      "35000",
      "18000",
      "5",
      "unidad",
      branches[0]?.name || "NOMBRE_SUCURSAL", // Nombre de la primera sucursal o placeholder
    ];
    const example3 = [
      "PROD003",
      "Crema Hidratante Facial",
      "Crema para piel seca y sensible",
      "",
      "Cuidado Facial",
      "40000",
      "22000",
      "8",
      "unidad",
      branches[1]?.id || branches[0]?.id || "ID_SUCURSAL", // ID de segunda sucursal o primera
    ];

    const csvContent = [
      branchesComment,
      "# Puedes usar el ID o el nombre de la sucursal en la columna 'Sucursal'",
      headers.join(","),
      example1.join(","),
      example2.join(","),
      example3.join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plantilla_stock_inicial.csv";
    link.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setCsvError("El archivo debe ser un CSV (.csv)");
      setCsvFile(null);
      return;
    }

    setCsvFile(file);
    setCsvError(null);

    // Leer y procesar el archivo CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split("\n").filter((line) => line.trim() && !line.startsWith('#')); // Ignorar comentarios

        // Saltar la primera línea (encabezados)
        const dataLines = lines.slice(1);

        const items = [];
        const errors = [];

        dataLines.forEach((line, index) => {
          const parts = line.split(",").map((s) => s.trim());

          // Formato esperado: SKU,Nombre,Descripción,Barcode,Categoría,Precio,Costo,Cantidad,Unidad,Sucursal
          const [
            sku,
            name,
            description,
            barcode,
            category,
            priceStr,
            costStr,
            quantityStr,
            unit,
            branchIdentifier, // Puede ser ID o nombre de sucursal
          ] = parts;

          if (!sku || !name) {
            errors.push(`Línea ${index + 2}: SKU y Nombre son obligatorios`);
            return;
          }

          // Validar y buscar la sucursal
          if (!branchIdentifier) {
            errors.push(`Línea ${index + 2}: Sucursal es obligatoria`);
            return;
          }

          // Normalizar el identificador de sucursal (eliminar espacios múltiples, trim, y minúsculas)
          const normalizedIdentifier = branchIdentifier.replace(/\s+/g, ' ').trim().toLowerCase();

          // Buscar sucursal por ID o nombre (con normalización robusta)
          const branch = branches.find(b => {
            const normalizedBranchId = b.id.toLowerCase();
            const normalizedBranchName = b.name.replace(/\s+/g, ' ').trim().toLowerCase();
            
            console.log('🔍 Comparando:', {
              csv: normalizedIdentifier,
              branchName: normalizedBranchName,
              branchId: normalizedBranchId,
              matchName: normalizedBranchName === normalizedIdentifier,
              matchId: normalizedBranchId === normalizedIdentifier
            });
            
            return normalizedBranchId === normalizedIdentifier || 
                   normalizedBranchName === normalizedIdentifier;
          });

          if (!branch) {
            const availableBranches = branches.map(b => `"${b.name}" (ID: ${b.id})`).join(', ');
            errors.push(`Línea ${index + 2}: Sucursal "${branchIdentifier.trim()}" no encontrada. Verifica que el nombre coincida exactamente. Disponibles: ${availableBranches}`);
            return;
          }

          let product = productsData.find((p) => p.sku === sku);

          // Si el producto no existe, preparar datos para crearlo
          if (!product) {
            const price = parseFloat(priceStr) || 0;
            const cost = parseFloat(costStr) || 0;

            if (price <= 0) {
              errors.push(
                `Línea ${
                  index + 2
                }: Precio de venta debe ser mayor a 0 para productos nuevos`
              );
              return;
            }

            // Marcar que este producto debe crearse
            product = {
              id: `temp_${sku}`, // ID temporal
              name,
              sku,
              category: category || "Sin categoría",
              price,
              cost,
              description: description || null,
              barcode: barcode || null,
              unit: unit || "unidad",
              trackInventory: true,
              isActive: true,
              _isNew: true, // Flag para identificar productos nuevos
            };
          }

          // Verificar duplicados por SKU y sucursal
          if (stockItems.find((item) => item.productSku === sku && item.branchId === branch.id)) {
            errors.push(
              `Línea ${index + 2}: Producto con SKU "${sku}" ya fue agregado para la sucursal "${branch.name}"`
            );
            return;
          }

          const quantity = parseInt(quantityStr) || 0;
          const unitCost = parseFloat(costStr) || product.cost || 0;

          console.log('📝 Procesando línea CSV:', {
            lineNumber: index + 2,
            sku,
            quantityStr,
            quantity,
            costStr,
            unitCost,
            branchName: branch.name
          });

          if (quantity <= 0) {
            errors.push(`Línea ${index + 2}: Cantidad debe ser mayor a 0`);
            return;
          }

          items.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            unit: product.unit,
            quantity,
            unitCost,
            branchId: branch.id, // Agregar branchId
            branchName: branch.name, // Agregar branchName para mostrar en la tabla
            _newProduct: product._isNew
              ? {
                  name: product.name,
                  sku: product.sku,
                  category: product.category,
                  price: product.price,
                  cost: product.cost,
                  unit: product.unit,
                  trackInventory: true,
                  isActive: true,
                }
              : null,
          });
        });

        if (errors.length > 0) {
          setCsvError(errors.join(", "));
        } else {
          setStockItems([...stockItems, ...items]);
          setCsvFile(null);
          e.target.value = ""; // Reset input
        }
      } catch (error) {
        console.error("Error processing CSV:", error);
        setCsvError("Error al procesar el archivo CSV");
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (selectedBranch === null) {
      return;
    }

    try {
      setSubmitting(true);
      setSuccess(null);

      const products = stockItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        ...(item._newProduct && { newProduct: item._newProduct }),
      }));

      console.log('📦 Enviando stock inicial:', {
        businessId: user.businessId,
        selectedBranch,
        products,
        totalItems: products.length
      });

      const result = await branchInventoryApi.loadInitialStock(
        user.businessId,
        selectedBranch,
        products
      );

      if (result.success) {
        const { summary, errors: failedItems } = result.data;
        const branchName =
          branches.find((b) => b.id === selectedBranch)?.name || "Sucursal";
        
        let message = `Stock inicial cargado en ${branchName}: ${summary.successful} exitosos, ${summary.failed} fallidos de ${summary.total} productos`;
        
        // Si hay errores, mostrar detalles
        if (failedItems && failedItems.length > 0) {
          const errorDetails = failedItems.map(err => {
            const item = stockItems.find(s => s.productId === err.productId);
            return `• ${item?.productName || 'Producto'}: ${err.error}`;
          }).join('\n');
          message += `\n\nErrores:\n${errorDetails}`;
        }
        
        setSuccess(message);
        
        // Limpiar solo los items que se cargaron exitosamente
        if (summary.successful > 0) {
          const successfulIds = result.data.results.map(r => r.productId);
          setStockItems(prev => prev.filter(item => !successfulIds.includes(item.productId)));
        }
        
        setConfirmDialog(false);

        // Reload products
        dispatch(
          fetchProducts({
            isActive: true,
            trackInventory: true,
            limit: 1000,
          })
        );
      }
    } catch (error) {
      console.error("Error loading initial stock:", error);
      setSuccess(null);
    } finally {
      setSubmitting(false);
    }
  };

  const availableProducts = products.filter(
    (p) => !stockItems.find((item) => item.productId === p.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {typeof error === "string"
                  ? error
                  : error.message || "Error al procesar la solicitud"}
              </h3>
            </div>
            <button
              onClick={() => dispatch(clearProductsError())}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800 whitespace-pre-line">{success}</h3>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Información */}
      <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <InfoIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Importante</h3>
            <p className="mt-1 text-sm text-blue-700">
              La carga inicial solo se puede realizar una vez por producto. Una
              vez cargado el stock inicial, las modificaciones se deben hacer a
              través de movimientos de inventario (compras, ajustes, etc.).
            </p>
          </div>
        </div>
      </div>

      {/* Carga masiva por CSV */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <UploadIcon className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Carga Masiva por CSV
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Importa múltiples productos desde un archivo CSV
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Descargar Plantilla
            </button>
          </div>

          {csvError && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{csvError}</p>
                </div>
                <button
                  onClick={() => setCsvError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Formato del archivo CSV:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>
                Primera línea: Encabezados (SKU, Nombre Producto, Descripción, Barcode, Categoría,
                Precio Venta, Costo Unitario, Cantidad, Unidad)
              </li>
              <li>Las siguientes líneas: Datos de los productos</li>
              <li>
                <strong>Campos obligatorios:</strong> SKU, Nombre Producto, Precio Venta, Costo Unitario, Cantidad
              </li>
              <li>
                <strong>Campos opcionales:</strong> Descripción, Barcode (dejar vacíos si no aplican)
              </li>
              <li>
                Si el producto NO existe, se creará automáticamente con los
                datos del CSV
              </li>
              <li>El SKU debe ser único para cada producto</li>
              <li>La cantidad debe ser un número entero mayor a 0</li>
              <li>
                El costo unitario y precio de venta deben ser números mayores a
                0
              </li>
            </ul>

            <div className="mt-3 bg-white p-3 rounded border border-gray-300 font-mono text-xs overflow-x-auto">
              <div className="text-gray-500">Ejemplo:</div>
              <div className="mt-1 whitespace-nowrap">
                SKU,Nombre Producto,Descripción,Barcode,Categoría,Precio Venta,Costo Unitario,Cantidad,Unidad,Sucursal (ID o Nombre)
                <br />
                PROD001,Shampoo Keratina 500ml,Shampoo reparador,7501234567890,Cuidado Capilar,45000,25000,10,unidad,{branches[0]?.id || 'ID_SUCURSAL'}
                <br />
                PROD002,Tinte Rubio Ceniza,,,Coloración,35000,18000,5,unidad,{branches[0]?.name || 'NOMBRE_SUCURSAL'}
              </div>
            </div>
          </div>

          <div>
            <label className="block">
              <span className="sr-only">Seleccionar archivo CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={selectedBranch === null}
                className={`block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  ${
                    selectedBranch === null
                      ? "file:bg-gray-200 file:text-gray-400 cursor-not-allowed"
                      : "file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  }
                `}
              />
            </label>
            {selectedBranch === null && (
              <p className="mt-2 text-sm text-amber-600 flex items-center">
                <AlertTriangleIcon className="h-4 w-4 mr-1" />
                Debes seleccionar una sucursal antes de cargar el archivo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Selector de Sucursal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <BuildingIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <label
              htmlFor="branch-select"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Seleccionar Sucursal *
            </label>

            {loadingBranches ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2Icon className="h-5 w-5 animate-spin" />
                <span className="text-sm">Cargando sucursales...</span>
              </div>
            ) : branchError ? (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangleIcon className="h-5 w-5" />
                <span className="text-sm">{branchError}</span>
              </div>
            ) : branches.length === 0 ? (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangleIcon className="h-5 w-5" />
                <span className="text-sm">No hay sucursales disponibles</span>
              </div>
            ) : (
              <select
                id="branch-select"
                value={selectedBranch !== null ? selectedBranch : ""}
                onChange={(e) =>
                  setSelectedBranch(
                    e.target.value !== "" ? e.target.value : null
                  )
                }
                className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">-- Selecciona una sucursal --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.isMain ? " (Principal)" : ""}
                  </option>
                ))}
              </select>
            )}

            {selectedBranch === null &&
              !loadingBranches &&
              branches.length > 0 && (
                <p className="mt-2 text-sm text-amber-600 flex items-center">
                  <AlertTriangleIcon className="h-4 w-4 mr-1" />
                  Debes seleccionar una sucursal antes de agregar productos
                </p>
              )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos disponibles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Productos Disponibles ({availableProducts.length})
              </h3>
            </div>

            <div className="p-4 max-h-[600px] overflow-y-auto">
              {availableProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <PackageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm">No hay productos disponibles</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleAddProduct(product)}
                      disabled={selectedBranch === null}
                      className={`w-full text-left p-3 rounded-lg border transition-colors group ${
                        selectedBranch === null
                          ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.sku && `SKU: ${product.sku} • `}
                            {product.category && `${product.category} • `}
                            {product.unit}
                          </p>
                        </div>
                        <PlusIcon
                          className={`h-5 w-5 flex-shrink-0 ml-2 ${
                            selectedBranch === null
                              ? "text-gray-300"
                              : "text-gray-400 group-hover:text-blue-500"
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de productos seleccionados */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Stock a Cargar ({stockItems.length} productos)
              </h3>
              {stockItems.length > 0 && (
                <button
                  onClick={() => setConfirmDialog(true)}
                  disabled={selectedBranch === null}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedBranch === null
                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  }`}
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Cargar Stock
                </button>
              )}
            </div>

            {stockItems.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg m-4">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  Selecciona productos de la lista
                </h3>
                <p className="text-sm text-gray-500">
                  Haz clic en un producto para agregarlo
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sucursal
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Costo Unit.
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockItems.map((item, index) => (
                        <tr key={`${item.productId}-${item.branchId}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.productName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.productSku && `${item.productSku} • `}
                                {item.unit}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.branchName || branches.find(b => b.id === item.branchId)?.name || 'Sin sucursal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.productId,
                                  e.target.value
                                )
                              }
                              className="w-24 px-3 py-1 text-right border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end">
                              <span className="text-gray-500 mr-1">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitCost}
                                onChange={(e) =>
                                  handleCostChange(
                                    item.productId,
                                    e.target.value
                                  )
                                }
                                className="w-32 px-3 py-1 text-right border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-medium text-gray-900">
                              $
                              {(item.quantity * item.unitCost).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() =>
                                handleRemoveProduct(item.productId)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      Inversión Total en Stock Inicial
                    </span>
                    <span className="text-2xl font-bold">
                      ${calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Carga de Stock Inicial
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de cargar el stock inicial para{" "}
                {stockItems.length} producto(s)?
              </p>

              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Esta acción:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Creará movimientos de inventario tipo INITIAL_STOCK</li>
                  <li>Actualizará el stock de cada producto</li>
                  <li>
                    Registrará una inversión total de{" "}
                    <strong>${calculateTotal().toLocaleString()}</strong>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setConfirmDialog(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Confirmar Carga
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ícono de paquete para el placeholder
const PackageIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

export default StockInitial;

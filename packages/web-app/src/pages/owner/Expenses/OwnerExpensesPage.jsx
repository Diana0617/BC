import React, { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useOwnerExpenses } from '@shared';
import { ownerExpensesApi } from '@shared';

const statusColors = {
  DRAFT: 'default',
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
  PAID: 'blue',
};

const OwnerExpensesPage = () => {
  const {
    expenses,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    createExpense,
    fetchExpenses,
  } = useOwnerExpenses();

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'COP',
    category: '',
    expenseDate: '',
    vendor: '',
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await ownerExpensesApi.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setCategoriesError('Error obteniendo categorías');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);
  const safeCategories = Array.isArray(categories) ? categories : [];
  const [receiptFile, setReceiptFile] = useState(null);
  const [creating, setCreating] = useState(false);



  // Handlers de filtros y búsqueda
  const handleStatusChange = v => updateFilters({ status: v });
  const handleSearchChange = e => updateFilters({ search: e.target.value });
  const handleTableChange = (pagination) => {
    updateFilters({ page: pagination.current, limit: pagination.pageSize });
  };

  // Modal alta gasto
  const openModal = () => {
    setModalVisible(true);
    setFormData({
      description: '',
      amount: '',
      currency: 'COP',
      category: '',
      expenseDate: '',
      vendor: '',
    });
    setReceiptFile(null);
  };
  const closeModal = () => {
    setModalVisible(false);
    setFormData({
      description: '',
      amount: '',
      currency: 'COP',
      category: '',
      expenseDate: '',
      vendor: '',
    });
    setReceiptFile(null);
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      // Validación simple
      if (!formData.description || !formData.amount || !formData.category || !formData.expenseDate) {
        alert('Los campos descripción, monto, categoría y fecha son obligatorios');
        setCreating(false);
        return;
      }
      const formattedValues = ownerExpensesApi.formatExpenseData(formData);
      console.log('Datos enviados al backend:', formattedValues);
      await createExpense(formattedValues, receiptFile);
      alert('Gasto creado correctamente');
      closeModal();
    } catch (err) {
      console.error('Error al crear gasto:', err);
      alert('Error al crear gasto');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gastos del Owner</h1>
      <div className="mb-4 flex gap-4 items-center">
        <select
          className="border rounded px-3 py-2 w-32"
          value={filters.status}
          onChange={e => handleStatusChange(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="DRAFT">Borrador</option>
          <option value="PENDING">Pendiente</option>
          <option value="APPROVED">Aprobado</option>
          <option value="REJECTED">Rechazado</option>
          <option value="PAID">Pagado</option>
        </select>
        <input
          type="text"
          className="border rounded px-3 py-2 w-60"
          placeholder="Buscar descripción, proveedor..."
          value={filters.search}
          onChange={handleSearchChange}
        />
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={openModal}
        >Nuevo gasto</button>
      </div>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
            <span className="text-blue-600 font-semibold animate-pulse">Cargando gastos...</span>
          </div>
        )}
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Monto</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Proveedor</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Comprobante</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses && expenses.length > 0 ? expenses.map(exp => (
                <tr key={exp.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{exp.description}</td>
                  <td className="px-4 py-2">{exp.currency || 'COP'} {exp.amount}</td>
                  <td className="px-4 py-2">{exp.category}</td>
                  <td className="px-4 py-2">{exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString('es-CO') : '-'}</td>
                  <td className="px-4 py-2">{exp.vendor || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      exp.status === 'DRAFT' ? 'bg-gray-200 text-gray-700' :
                      exp.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      exp.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      exp.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      exp.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {exp.receiptUrl ? (
                      <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver</a>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:underline text-sm">Editar</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No hay gastos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación simple */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={pagination.page <= 1}
            onClick={() => updateFilters({ page: pagination.page - 1 })}
          >Anterior</button>
          <span className="text-sm">Página {pagination.page} de {pagination.totalPages}</span>
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateFilters({ page: pagination.page + 1 })}
          >Siguiente</button>
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={closeModal}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Nuevo gasto</h2>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Descripción *</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Monto *</label>
                <input type="number" className="w-full border rounded px-3 py-2" min={0} value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Moneda *</label>
                <select className="w-full border rounded px-3 py-2" value={formData.currency} onChange={e => setFormData(f => ({ ...f, currency: e.target.value }))} required>
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Categoría *</label>
                <select className="w-full border rounded px-3 py-2" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} required>
                  <option value="">Selecciona una categoría</option>
                  {categoriesLoading && <option disabled>Cargando...</option>}
                  {categoriesError && <option disabled>{categoriesError}</option>}
                  {!categoriesLoading && !categoriesError && categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Fecha *</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={formData.expenseDate} onChange={e => setFormData(f => ({ ...f, expenseDate: e.target.value }))} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Proveedor</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={formData.vendor} onChange={e => setFormData(f => ({ ...f, vendor: e.target.value }))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Comprobante</label>
                <input name="receipt" type="file" accept="image/*,.pdf" className="w-full" onChange={e => setReceiptFile(e.target.files[0])} />
                {receiptFile && <span className="text-sm text-gray-600">{receiptFile.name}</span>}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={creating}>{creating ? 'Creando...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerExpensesPage;

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ownerFinancialReportsApi, ownerPaymentsApi, ownerPaymentConfigApi } from '@shared'
import { CreditCardIcon, CurrencyDollarIcon, BanknotesIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const StatCard = ({ icon: Icon, label, value, className }) => (
  <div className={`bg-white rounded-lg shadow p-4 flex items-center justify-between ${className || ''}`}>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-md">
        <Icon className="h-6 w-6 text-gray-600" />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  </div>
)

const OwnerReports = () => {
  const [summary, setSummary] = useState(null)
  const [payments, setPayments] = useState([])
  const [providers, setProviders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRaw, setShowRaw] = useState(false)

  const currentUser = useSelector(s => s.auth?.user)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        const [sumRes, payRes, provRes] = await Promise.all([
          ownerFinancialReportsApi.getFinancialSummary({}),
          ownerPaymentsApi.getAllPayments({ limit: 20 }),
          ownerPaymentConfigApi.getAvailableProviders()
        ])

        if (!mounted) return
        setSummary(sumRes || {})
        // Normalize payments response: backend may return { payments: [] },
        // a paginated { rows: [], count } or directly an array.
        const normalizedPayments = Array.isArray(payRes)
          ? payRes
          : Array.isArray(payRes?.payments)
            ? payRes.payments
            : Array.isArray(payRes?.rows)
              ? payRes.rows
              : [];

        // Normalize providers similarly
        const normalizedProviders = Array.isArray(provRes)
          ? provRes
          : Array.isArray(provRes?.providers)
            ? provRes.providers
            : Array.isArray(provRes?.rows)
              ? provRes.rows
              : [];

        setPayments(normalizedPayments)
        setProviders(normalizedProviders)
      } catch (err) {
        console.error('Error loading owner reports', err)
        if (mounted) setError(err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  if (isLoading) return <div className="p-6">Cargando reportes...</div>
  if (error) return <div className="p-6 text-red-600">Error cargando reportes: {error.message || String(error)}</div>

  const revenue = summary?.totalRevenue ?? summary?.revenue ?? 0
  const expenses = summary?.totalExpenses ?? summary?.expenses ?? 0
  const net = revenue - expenses

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <StatCard icon={CurrencyDollarIcon} label="Ingresos" value={`$${Number(revenue).toLocaleString()}`} />
        <StatCard icon={BanknotesIcon} label="Gastos" value={`$${Number(expenses).toLocaleString()}`} />
        <StatCard icon={ChartBarIcon} label="Neto" value={`$${Number(net).toLocaleString()}`} />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Últimos pagos</h3>
          {payments.length === 0 ? (
            <div className="text-sm text-gray-500">No se encontraron pagos</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase">
                    <th className="py-2">Fecha</th>
                    <th>Negocio</th>
                    <th>Método</th>
                    <th className="text-right">Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id || p.paymentId} className="border-t">
                      <td className="py-2 align-top">{new Date(p.createdAt || p.date || p.paymentDate || Date.now()).toLocaleString()}</td>
                      <td className="align-top">{p.businessName || p.business?.name || p.businessId || '-'}</td>
                      <td className="align-top">{p.method || p.paymentMethod || p.gateway || '-'}</td>
                      <td className="align-top text-right">${Number(p.amount || p.total || 0).toLocaleString()} {p.currency || 'COP'}</td>
                      <td className="align-top">{p.status || p.state || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-2">Proveedores de pago</h4>
          {providers.length === 0 ? (
            <div className="text-sm text-gray-500">No hay proveedores disponibles</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {providers.map((prov) => (
                <li key={prov.id || prov.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium">{prov.name || prov.provider || prov}</div>
                      <div className="text-xs text-gray-500">{prov.environment || prov.env || ''}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{prov.isActive ? 'Activo' : 'Inactivo'}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>

      <section className="bg-white rounded-lg shadow p-4">
        <h4 className="font-semibold mb-3">Resumen financiero detallado</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard icon={CurrencyDollarIcon} label="Ingresos totales" value={`$${Number(summary?.totalRevenue || 0).toLocaleString()}`} />
          <StatCard icon={BanknotesIcon} label="Gastos totales" value={`$${Number(summary?.totalExpenses || 0).toLocaleString()}`} />
          <StatCard icon={ChartBarIcon} label="Margen (estimado)" value={`${Number(summary?.profitMargin || 0).toLocaleString()}%`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500">Ingresos netos</div>
            <div className="text-lg font-semibold">${Number(summary?.netRevenue || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Comisiones totales</div>
            <div className="text-lg font-semibold">${Number(summary?.totalCommissions || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Reembolsos</div>
            <div className="text-lg font-semibold">${Number(summary?.totalRefunds || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setShowRaw(prev => !prev)}
          >
            {showRaw ? 'Ocultar JSON crudo' : 'Mostrar JSON crudo'}
          </button>
        </div>

        {showRaw && (
          <div className="mt-3">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(summary, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  )
}

export default OwnerReports

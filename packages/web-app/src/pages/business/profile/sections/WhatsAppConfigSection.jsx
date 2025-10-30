import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BellIcon,
  DocumentTextIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@shared/api/client'
import toast from 'react-hot-toast'

const WhatsAppConfigSection = () => {
  const { currentBusiness } = useSelector(state => state.business)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    enabled: false,
    phone_number: '',
    business_account_id: '',
    access_token: '',
    webhook_verify_token: '',
    send_receipts: true,
    send_appointments: true,
    send_reminders: true
  })

  // Cargar configuración actual
  useEffect(() => {
    loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusiness?.id])

  const loadConfig = async () => {
    if (!currentBusiness?.id) return

    setLoading(true)
    try {
      const response = await apiClient.get(
        `/api/business/${currentBusiness.id}/config/communications`
      )

      if (response.data.success) {
        const whatsapp = response.data.data.whatsapp
        setConfig({
          enabled: whatsapp.enabled,
          phone_number: whatsapp.phone_number,
          business_account_id: whatsapp.business_account_id,
          access_token: '', // No se devuelve por seguridad
          webhook_verify_token: '', // No se devuelve por seguridad
          send_receipts: whatsapp.send_receipts,
          send_appointments: whatsapp.send_appointments,
          send_reminders: whatsapp.send_reminders,
          has_access_token: whatsapp.has_access_token,
          has_webhook_token: whatsapp.has_webhook_token
        })
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error)
      toast.error('Error al cargar configuración de WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentBusiness?.id) return

    // Validaciones
    if (config.enabled && !config.phone_number) {
      toast.error('El número de teléfono es requerido')
      return
    }

    if (config.enabled && !config.business_account_id) {
      toast.error('El Business Account ID es requerido')
      return
    }

    setSaving(true)
    try {
      const payload = {
        whatsapp: {
          enabled: config.enabled,
          phone_number: config.phone_number,
          business_account_id: config.business_account_id,
          send_receipts: config.send_receipts,
          send_appointments: config.send_appointments,
          send_reminders: config.send_reminders
        }
      }

      // Solo incluir tokens si se proporcionaron nuevos valores
      if (config.access_token) {
        payload.whatsapp.access_token = config.access_token
      }
      if (config.webhook_verify_token) {
        payload.whatsapp.webhook_verify_token = config.webhook_verify_token
      }

      const response = await apiClient.put(
        `/api/business/${currentBusiness.id}/config/communications`,
        payload
      )

      if (response.data.success) {
        toast.success('✅ Configuración de WhatsApp guardada correctamente')
        loadConfig() // Recargar para actualizar indicadores de tokens
      }
    } catch (error) {
      console.error('Error saving WhatsApp config:', error)
      toast.error('Error al guardar configuración de WhatsApp')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
        <span className="text-gray-600">Cargando configuración...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Integración con WhatsApp Business
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configura el envío automático de mensajes a tus clientes
              </p>
            </div>
          </div>
          
          {/* Estado de conexión */}
          <div className="flex items-center space-x-2">
            {config.enabled ? (
              <span className="flex items-center text-sm font-medium text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                Activo
              </span>
            ) : (
              <span className="flex items-center text-sm font-medium text-gray-500">
                <XCircleIcon className="h-5 w-5 mr-1" />
                Inactivo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Requisitos para usar WhatsApp Business API:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Cuenta de Meta Business verificada</li>
              <li>Número de teléfono verificado (no puede estar en WhatsApp personal)</li>
              <li>Business Account ID de Meta</li>
              <li>Token de acceso permanente de la API de WhatsApp Business</li>
            </ul>
            <p className="mt-3">
              <a 
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Ver guía de configuración →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Toggle principal */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Habilitar WhatsApp Business
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Activa el envío de mensajes automáticos por WhatsApp
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {/* Campos de configuración */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Número de teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp Business *
            </label>
            <input
              type="tel"
              value={config.phone_number}
              onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
              placeholder="+573001234567"
              disabled={!config.enabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Incluye el código de país (ej: +57 para Colombia)
            </p>
          </div>

          {/* Business Account ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Account ID *
            </label>
            <input
              type="text"
              value={config.business_account_id}
              onChange={(e) => setConfig({ ...config, business_account_id: e.target.value })}
              placeholder="123456789012345"
              disabled={!config.enabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              ID de tu cuenta de Meta Business
            </p>
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token de Acceso (Access Token)
            </label>
            <input
              type="password"
              value={config.access_token}
              onChange={(e) => setConfig({ ...config, access_token: e.target.value })}
              placeholder={config.has_access_token ? "••••••••••••" : "EAAxxxxxxxxxxxxx"}
              disabled={!config.enabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {config.has_access_token && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Token configurado (dejar vacío para mantener)
              </p>
            )}
          </div>

          {/* Webhook Verify Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token de Verificación (Webhook)
            </label>
            <input
              type="password"
              value={config.webhook_verify_token}
              onChange={(e) => setConfig({ ...config, webhook_verify_token: e.target.value })}
              placeholder={config.has_webhook_token ? "••••••••••••" : "my_webhook_token"}
              disabled={!config.enabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {config.has_webhook_token && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Token configurado (dejar vacío para mantener)
              </p>
            )}
          </div>
        </div>

        {/* Opciones de envío */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            ¿Qué mensajes enviar automáticamente?
          </h4>
          
          <div className="space-y-3">
            {/* Recordatorios de citas */}
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={config.send_reminders}
                onChange={(e) => setConfig({ ...config, send_reminders: e.target.checked })}
                disabled={!config.enabled}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:cursor-not-allowed"
              />
              <div className="ml-3 flex items-center">
                <BellIcon className="h-5 w-5 text-gray-600 mr-2" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Recordatorios de citas</span>
                  <p className="text-xs text-gray-500">Enviar recordatorio 24h antes de la cita</p>
                </div>
              </div>
            </label>

            {/* Confirmaciones de citas */}
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={config.send_appointments}
                onChange={(e) => setConfig({ ...config, send_appointments: e.target.checked })}
                disabled={!config.enabled}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:cursor-not-allowed"
              />
              <div className="ml-3 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 text-gray-600 mr-2" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Confirmaciones de citas</span>
                  <p className="text-xs text-gray-500">Notificar cuando se agende, modifique o cancele una cita</p>
                </div>
              </div>
            </label>

            {/* Recibos de pago */}
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={config.send_receipts}
                onChange={(e) => setConfig({ ...config, send_receipts: e.target.checked })}
                disabled={!config.enabled}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:cursor-not-allowed"
              />
              <div className="ml-3 flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Recibos de pago</span>
                  <p className="text-xs text-gray-500">Enviar recibo automático después de un pago</p>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={loadConfig}
          disabled={saving}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default WhatsAppConfigSection

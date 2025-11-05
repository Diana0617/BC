import React from 'react'
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

/**
 * TemplateStatusBadge Component
 * 
 * Badge visual para mostrar el estado de una plantilla de WhatsApp.
 * Estados posibles: DRAFT, PENDING, APPROVED, REJECTED
 * 
 * @param {string} status - Estado de la plantilla
 * @param {boolean} showIcon - Mostrar ícono (default: true)
 * @param {string} size - Tamaño: 'sm', 'md', 'lg' (default: 'md')
 */
const TemplateStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const configs = {
    DRAFT: {
      label: 'Borrador',
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: DocumentTextIcon
    },
    PENDING: {
      label: 'Pendiente',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: ClockIcon
    },
    APPROVED: {
      label: 'Aprobada',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: CheckCircleIcon
    },
    REJECTED: {
      label: 'Rechazada',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: XCircleIcon
    }
  }

  const config = configs[status] || configs.DRAFT
  const Icon = config.icon

  const sizes = {
    sm: {
      badge: 'px-2 py-0.5 text-xs',
      icon: 'h-3 w-3'
    },
    md: {
      badge: 'px-2.5 py-1 text-sm',
      icon: 'h-4 w-4'
    },
    lg: {
      badge: 'px-3 py-1.5 text-base',
      icon: 'h-5 w-5'
    }
  }

  const sizeConfig = sizes[size] || sizes.md

  return (
    <span 
      className={`inline-flex items-center ${sizeConfig.badge} rounded-full font-medium ${config.bgColor} ${config.textColor}`}
    >
      {showIcon && <Icon className={`${sizeConfig.icon} mr-1.5`} />}
      {config.label}
    </span>
  )
}

export default TemplateStatusBadge

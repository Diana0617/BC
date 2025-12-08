import React from 'react'
import {
  ClockIcon,
  PaperAirplaneIcon,
  CheckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

/**
 * MessageStatusBadge Component
 * 
 * Badge visual para mostrar el estado de un mensaje de WhatsApp.
 * Estados posibles: QUEUED, SENT, DELIVERED, READ, FAILED
 * 
 * @param {string} status - Estado del mensaje
 * @param {boolean} showIcon - Mostrar ícono (default: true)
 * @param {string} size - Tamaño: 'sm', 'md', 'lg' (default: 'md')
 */
const MessageStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const configs = {
    QUEUED: {
      label: 'En Cola',
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: ClockIcon
    },
    SENT: {
      label: 'Enviado',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: PaperAirplaneIcon
    },
    DELIVERED: {
      label: 'Entregado',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: CheckIcon
    },
    READ: {
      label: 'Leído',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: CheckCircleIcon
    },
    FAILED: {
      label: 'Fallido',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: XCircleIcon
    }
  }

  const config = configs[status] || configs.QUEUED
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

export default MessageStatusBadge

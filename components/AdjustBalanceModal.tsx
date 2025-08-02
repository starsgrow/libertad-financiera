'use client'

import { useState } from 'react'
import { X, DollarSign, Plus, Minus } from 'lucide-react'

interface AdjustBalanceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdjust: (amount: number, description: string) => void
  currentBalance: number
}

export default function AdjustBalanceModal({ 
  isOpen, 
  onClose, 
  onAdjust, 
  currentBalance 
}: AdjustBalanceModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor ingresa un monto válido')
      return
    }

    const finalAmount = adjustmentType === 'add' ? numAmount : -numAmount
    const finalDescription = description || `Ajuste de balance (${adjustmentType === 'add' ? '+' : '-'}${numAmount})`
    
    onAdjust(finalAmount, finalDescription)
    handleClose()
  }

  const handleClose = () => {
    setAmount('')
    setDescription('')
    setAdjustmentType('add')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Ajustar Balance</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Balance actual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Balance Actual</p>
            <p className="text-2xl font-bold text-gray-900">
              ${currentBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Tipo de ajuste */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Ajuste
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border-2 transition-colors ${
                  adjustmentType === 'add'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Plus size={16} />
                <span>Agregar</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('subtract')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border-2 transition-colors ${
                  adjustmentType === 'subtract'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Minus size={16} />
                <span>Restar</span>
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Ajuste por error de cálculo"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Nuevo balance proyectado */}
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Nuevo Balance</p>
              <p className={`text-lg font-bold ${
                adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'
              }`}>
                ${(currentBalance + (adjustmentType === 'add' ? parseFloat(amount) : -parseFloat(amount))).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ajustar Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
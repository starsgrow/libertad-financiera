'use client'

import { useState } from 'react'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  onTransfer: (amount: number, description: string) => void
  transferType: 'deposit' | 'withdrawal'
  cashBalance: number
  banksBalance: number
}

export default function TransferModal({ 
  isOpen, 
  onClose, 
  onTransfer, 
  transferType, 
  cashBalance, 
  banksBalance 
}: TransferModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return

    const numAmount = parseFloat(amount)
    if (numAmount <= 0) return

    // Validar que hay suficiente saldo
    if (transferType === 'deposit' && numAmount > cashBalance) {
      alert('No tienes suficiente efectivo para esta consignación')
      return
    }

    if (transferType === 'withdrawal' && numAmount > banksBalance) {
      alert('No tienes suficiente saldo bancario para este retiro')
      return
    }

    onTransfer(numAmount, description)
    setAmount('')
    setDescription('')
  }

  if (!isOpen) return null

  const isDeposit = transferType === 'deposit'
  const maxAmount = isDeposit ? cashBalance : banksBalance
  const sourceBalance = isDeposit ? cashBalance : banksBalance
  const targetBalance = isDeposit ? banksBalance : cashBalance

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isDeposit ? '💰 Consignar a Banco' : '🏧 Retirar de Banco'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Información de saldos */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                {isDeposit ? 'Efectivo disponible:' : 'Saldo bancario:'}
              </span>
              <span className="text-lg font-bold text-gray-900">
                ${sourceBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-center text-gray-400">
              {isDeposit ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                {isDeposit ? 'Saldo bancario:' : 'Efectivo disponible:'}
              </span>
              <span className="text-lg font-bold text-gray-900">
                ${targetBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a {isDeposit ? 'consignar' : 'retirar'}
            </label>
            <input
              type="number"
              step="0.01"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder={`0.00 (máx: $${maxAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })})`}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder={`Ej: ${isDeposit ? 'Consignación para ahorros' : 'Retiro para gastos'}`}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                isDeposit ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isDeposit ? '💰 Consignar' : '🏧 Retirar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
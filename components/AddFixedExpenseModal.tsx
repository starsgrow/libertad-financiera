'use client'

import { useState } from 'react'
import { X, Plus, Calendar } from 'lucide-react'

interface AddFixedExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (expense: any) => void
}

export default function AddFixedExpenseModal({ isOpen, onClose, onAdd }: AddFixedExpenseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDateType: 'specific', // 'first', 'last', 'specific'
    dueDate: '',
    specificDay: '1', // For specific day of month
    category: '',
    description: '',
  })

  const categories = [
    'Vivienda',
    'Servicios',
    'Transporte',
    'Alimentación',
    'Salud',
    'Educación',
    'Entretenimiento',
    'Seguros',
    'Préstamos',
    'Otros'
  ]

  const calculateDueDate = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    switch (formData.dueDateType) {
      case 'first':
        return new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
      case 'last':
        return new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
      case 'specific':
        const day = parseInt(formData.specificDay)
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
        const adjustedDay = Math.min(day, lastDayOfMonth)
        return new Date(currentYear, currentMonth, adjustedDay).toISOString().split('T')[0]
      default:
        return formData.dueDate
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return

    const dueDate = calculateDueDate()
    if (!dueDate) return

    const expense = {
      ...formData,
      amount: parseFloat(formData.amount),
      dueDate,
      isPaid: false,
      createdAt: new Date().toISOString(),
    }

    onAdd(expense)
    setFormData({ 
      name: '', 
      amount: '', 
      dueDateType: 'specific', 
      dueDate: '', 
      specificDay: '1', 
      category: '', 
      description: '' 
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Gasto Fijo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Gasto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Ej: Alquiler, Luz, Internet..."
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Mensual
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field"
              placeholder="0.00"
              required
            />
          </div>

          {/* Due Date Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Vencimiento
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="dueDateType"
                  value="first"
                  checked={formData.dueDateType === 'first'}
                  onChange={(e) => setFormData({ ...formData, dueDateType: e.target.value })}
                  className="text-primary-600"
                />
                <span className="text-sm">Primer día del mes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="dueDateType"
                  value="last"
                  checked={formData.dueDateType === 'last'}
                  onChange={(e) => setFormData({ ...formData, dueDateType: e.target.value })}
                  className="text-primary-600"
                />
                <span className="text-sm">Último día del mes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="dueDateType"
                  value="specific"
                  checked={formData.dueDateType === 'specific'}
                  onChange={(e) => setFormData({ ...formData, dueDateType: e.target.value })}
                  className="text-primary-600"
                />
                <span className="text-sm">Día específico del mes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="dueDateType"
                  value="custom"
                  checked={formData.dueDateType === 'custom'}
                  onChange={(e) => setFormData({ ...formData, dueDateType: e.target.value })}
                  className="text-primary-600"
                />
                <span className="text-sm">Fecha personalizada</span>
              </label>
            </div>
          </div>

          {/* Specific Day Input */}
          {formData.dueDateType === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Día del Mes
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.specificDay}
                onChange={(e) => setFormData({ ...formData, specificDay: e.target.value })}
                className="input-field"
                placeholder="1-31"
                required
              />
            </div>
          )}

          {/* Custom Date Input */}
          {formData.dueDateType === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-field"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Preview of calculated date */}
          {(formData.dueDateType === 'first' || formData.dueDateType === 'last' || formData.dueDateType === 'specific') && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Fecha calculada:</strong> {calculateDueDate() ? new Date(calculateDueDate()).toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Notas adicionales sobre este gasto fijo..."
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
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Plus,
  Calendar,
  DollarSign,
  Bell,
  Edit,
  Trash2
} from 'lucide-react'
import { db } from '@/lib/database'
import AddFixedExpenseModal from '@/components/AddFixedExpenseModal'
import EditFixedExpenseModal from '@/components/EditFixedExpenseModal'

interface FixedExpense {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  isPaid: boolean
  paymentDate?: string
  description?: string
}

export default function FixedExpenses() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFixedExpenses()
  }, [])

  useEffect(() => {
    console.log('fixedExpenses cambió:', fixedExpenses)
  }, [fixedExpenses])

  const loadFixedExpenses = async () => {
    try {
      setIsLoading(true)
      console.log('Cargando gastos fijos...')
      const expenses = await db.getAllFixedExpenses()
      console.log('Gastos fijos cargados:', expenses)
      console.log('Estado actual de fixedExpenses antes de setear:', fixedExpenses)
      setFixedExpenses(expenses)
      console.log('Estado de fixedExpenses después de setear:', expenses)
    } catch (error) {
      console.error('Error cargando gastos fijos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addFixedExpense = async (expense: Omit<FixedExpense, 'id'>) => {
    try {
      console.log('Agregando nuevo gasto fijo:', expense)
      const newExpense = await db.addFixedExpense(expense)
      console.log('Gasto fijo agregado:', newExpense)
      
      // Recargar todos los gastos fijos para asegurar sincronización
      await loadFixedExpenses()
      setShowModal(false)
    } catch (error) {
      console.error('Error agregando gasto fijo:', error)
    }
  }

  const markAsPaid = async (id: string) => {
    try {
      console.log('Marcando como pagado gasto fijo:', id)
      await db.markFixedExpenseAsPaid(id)
      console.log('Gasto fijo marcado como pagado exitosamente')
      
      // Recargar todos los gastos fijos para asegurar sincronización
      await loadFixedExpenses()
    } catch (error) {
      console.error('Error marcando como pagado:', error)
    }
  }

  const editExpense = (expense: FixedExpense) => {
    setEditingExpense(expense)
    setShowEditModal(true)
  }

  const updateExpense = async (id: string, updates: Partial<FixedExpense>) => {
    try {
      console.log('Actualizando gasto fijo:', id, updates)
      const updatedExpense = await db.updateFixedExpense(id, updates)
      console.log('Gasto fijo actualizado:', updatedExpense)
      
      // Recargar todos los gastos fijos para asegurar sincronización
      await loadFixedExpenses()
      
      setShowEditModal(false)
      setEditingExpense(null)
    } catch (error) {
      console.error('Error actualizando gasto fijo:', error)
    }
  }

  const deleteExpense = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto fijo?')) return
    
    try {
      console.log('Eliminando gasto fijo:', id)
      await db.deleteFixedExpense(id)
      console.log('Gasto fijo eliminado exitosamente')
      
      // Recargar todos los gastos fijos para asegurar sincronización
      await loadFixedExpenses()
    } catch (error) {
      console.error('Error eliminando gasto fijo:', error)
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getNotificationColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'text-red-600 bg-red-50 border-red-200'
    if (daysUntilDue === 0) return 'text-red-600 bg-red-50 border-red-200'
    if (daysUntilDue <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (daysUntilDue <= 5) return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getNotificationIcon = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return <AlertTriangle className="h-5 w-5" />
    if (daysUntilDue === 0) return <AlertTriangle className="h-5 w-5" />
    if (daysUntilDue <= 3) return <Bell className="h-5 w-5" />
    if (daysUntilDue <= 5) return <Clock className="h-5 w-5" />
    return <Calendar className="h-5 w-5" />
  }

  const getNotificationText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'Vencido'
    if (daysUntilDue === 0) return 'Vence hoy'
    if (daysUntilDue === 1) return 'Vence mañana'
    return `Vence en ${daysUntilDue} días`
  }

  const unpaidExpenses = fixedExpenses.filter(expense => !expense.isPaid)
  const paidExpenses = fixedExpenses.filter(expense => expense.isPaid)
  
  console.log('Renderizando con:', { fixedExpenses, unpaidExpenses, paidExpenses })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando gastos fijos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gastos Fijos
        </h1>
        <p className="text-gray-600">
          Controla tus gastos mensuales fijos
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Agregar Gasto Fijo
        </button>
      </div>

      {/* Pending Expenses */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Gastos Pendientes
        </h2>
        
        {unpaidExpenses.length === 0 ? (
          <div className="text-center py-8 bg-green-50 rounded-lg">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-700 font-medium">¡Excelente! No tienes gastos fijos pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaidExpenses.map((expense) => {
              const daysUntilDue = getDaysUntilDue(expense.dueDate)
              const notificationColor = getNotificationColor(daysUntilDue)
              const notificationIcon = getNotificationIcon(daysUntilDue)
              const notificationText = getNotificationText(daysUntilDue)

              return (
                <div key={expense.id} className={`card border-2 ${notificationColor}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.name}</h3>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {notificationIcon}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monto:</span>
                      <span className="font-semibold text-lg">
                        ${expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vence:</span>
                      <span className="text-sm font-medium">
                        {new Date(expense.dueDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${notificationColor.replace('text-', 'bg-').replace('border-', '')}`}>
                        {notificationText}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editExpense(expense)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="flex-1 btn-danger flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                  <button
                    onClick={() => markAsPaid(expense.id)}
                    className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
                  >
                    <CheckCircle size={16} />
                    Marcar como Pagado
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Paid Expenses */}
      {paidExpenses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Gastos Pagados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidExpenses.map((expense) => (
              <div key={expense.id} className="card bg-green-50 border-green-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{expense.name}</h3>
                    <p className="text-sm text-gray-600">{expense.category}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monto:</span>
                    <span className="font-semibold text-lg">
                      ${expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pagado:</span>
                    <span className="text-sm font-medium">
                      {expense.paymentDate ? new Date(expense.paymentDate).toLocaleDateString('es-ES') : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => editExpense(expense)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="flex-1 btn-danger flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
                <div className="text-xs text-green-600 font-medium mt-2">
                  ✅ Pagado
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddFixedExpenseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addFixedExpense}
      />

      <EditFixedExpenseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingExpense(null)
        }}
        onUpdate={updateExpense}
        expense={editingExpense}
      />
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  Plus,
  Filter
} from 'lucide-react'
import { db } from '@/lib/database'
import AddTransactionModal from '@/components/AddTransactionModal'
import TransactionList from '@/components/TransactionList'

interface DailyTransactions {
  date: string
  transactions: any[]
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  netAmount: number
}

export default function DailyPage() {
  const [dailyData, setDailyData] = useState<DailyTransactions[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'savings'>('all')

  useEffect(() => {
    loadDailyData()
  }, [])

  const loadDailyData = async () => {
    try {
      setIsLoading(true)
      const allTransactions = await db.getAllTransactions()
      
      // Agrupar transacciones por fecha
      const grouped = groupTransactionsByDate(allTransactions)
      setDailyData(grouped)
    } catch (error) {
      console.error('Error cargando datos diarios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupTransactionsByDate = (transactions: any[]): DailyTransactions[] => {
    const grouped: { [key: string]: any[] } = {}
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(transaction)
    })

    return Object.entries(grouped)
      .map(([date, transactions]) => {
        // Solo contar ingresos y gastos reales (excluir transferencias)
        const totalIncome = transactions
          .filter(t => t.type === 'income' && t.category !== 'Transferencia')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const totalExpenses = transactions
          .filter(t => t.type === 'expense' && t.category !== 'Transferencia')
          .reduce((sum, t) => sum + t.amount, 0)
        
        const totalSavings = transactions
          .filter(t => t.type === 'savings')
          .reduce((sum, t) => sum + t.amount, 0)
        
        return {
          date,
          transactions,
          totalIncome,
          totalExpenses,
          totalSavings,
          netAmount: totalIncome - totalExpenses
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const addTransaction = async (transaction: any) => {
    try {
      const newTransaction = await db.addTransaction(transaction)
      await loadDailyData() // Recargar datos
      setShowModal(false)
    } catch (error) {
      console.error('Error agregando transacción:', error)
    }
  }

  const onDelete = async (id: number) => {
    try {
      await db.deleteTransaction(id)
      await loadDailyData() // Recargar datos
    } catch (error) {
      console.error('Error eliminando transacción:', error)
    }
  }

  const getDateDisplay = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) return 'Hoy'
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
    
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  const getFilteredTransactions = (transactions: any[]) => {
    if (filterType === 'all') return transactions
    return transactions.filter(t => t.type === filterType)
  }

  const getFilteredDailyData = () => {
    if (filterType === 'all') return dailyData
    
    return dailyData.map(day => {
      // Filtrar transacciones por tipo, excluyendo transferencias
      const filteredTransactions = day.transactions.filter(t => {
        if (t.category === 'Transferencia') return false // Excluir transferencias de los filtros
        return t.type === filterType
      })
      
      // Recalcular totales solo con las transacciones filtradas
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income' && t.category !== 'Transferencia')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense' && t.category !== 'Transferencia')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalSavings = filteredTransactions
        .filter(t => t.type === 'savings')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        ...day,
        transactions: filteredTransactions,
        totalIncome,
        totalExpenses,
        totalSavings,
        netAmount: totalIncome - totalExpenses
      }
    }).filter(day => day.transactions.length > 0)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos diarios...</p>
          </div>
        </div>
      </div>
    )
  }

  const filteredData = getFilteredDailyData()

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Día a Día</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          </div>
          
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Todo', icon: Calendar },
              { key: 'income', label: 'Ingresos', icon: TrendingUp },
              { key: 'expense', label: 'Gastos', icon: TrendingDown },
              { key: 'savings', label: 'Ahorros', icon: PiggyBank }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilterType(key as any)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterType === key
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de días */}
      <div className="space-y-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay transacciones
            </h3>
            <p className="text-gray-600">
              {filterType === 'all' 
                ? 'Agrega tu primera transacción para comenzar'
                : `No hay ${filterType === 'income' ? 'ingresos' : filterType === 'expense' ? 'gastos' : 'ahorros'} registrados`
              }
            </p>
          </div>
        ) : (
          filteredData.map((day) => (
            <div key={day.date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header del día */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getDateDisplay(day.date)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      day.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${day.netAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">Neto del día</p>
                  </div>
                </div>
                
                {/* Resumen del día */}
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ingresos</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${day.totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Gastos</p>
                    <p className="text-lg font-semibold text-red-600">
                      ${day.totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ahorros</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ${day.totalSavings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transacciones del día */}
              <div className="p-6">
                <TransactionList 
                  transactions={day.transactions}
                  onDelete={onDelete}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para agregar transacción */}
      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addTransaction}
      />
    </div>
  )
} 
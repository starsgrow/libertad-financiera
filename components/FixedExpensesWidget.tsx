'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, Calendar, CheckCircle } from 'lucide-react'
import { db } from '@/lib/database'
import Link from 'next/link'

interface FixedExpense {
  id: number
  name: string
  amount: number
  dueDate: string
  category: string
  isPaid: boolean
}

export default function FixedExpensesWidget() {
  const [upcomingExpenses, setUpcomingExpenses] = useState<FixedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUpcomingExpenses()
  }, [])

  const loadUpcomingExpenses = async () => {
    try {
      setIsLoading(true)
      const expenses = await db.getUpcomingFixedExpenses()
      setUpcomingExpenses(expenses)
    } catch (error) {
      console.error('Error cargando gastos próximos:', error)
    } finally {
      setIsLoading(false)
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
    if (daysUntilDue < 0) return <AlertTriangle className="h-4 w-4" />
    if (daysUntilDue === 0) return <AlertTriangle className="h-4 w-4" />
    if (daysUntilDue <= 3) return <Clock className="h-4 w-4" />
    return <Calendar className="h-4 w-4" />
  }

  const getNotificationText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'Vencido'
    if (daysUntilDue === 0) return 'Vence hoy'
    if (daysUntilDue === 1) return 'Vence mañana'
    return `Vence en ${daysUntilDue} días`
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (upcomingExpenses.length === 0) {
    return (
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Gastos Fijos
          </h2>
          <Link 
            href="/fixed-expenses"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todos
          </Link>
        </div>
        <div className="text-center py-4">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-green-700 font-medium">No tienes gastos fijos próximos a vencer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Gastos Fijos Próximos
        </h2>
        <Link 
          href="/fixed-expenses"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Ver todos
        </Link>
      </div>

      <div className="space-y-3">
        {upcomingExpenses.slice(0, 3).map((expense) => {
          const daysUntilDue = getDaysUntilDue(expense.dueDate)
          const notificationColor = getNotificationColor(daysUntilDue)
          const notificationIcon = getNotificationIcon(daysUntilDue)
          const notificationText = getNotificationText(daysUntilDue)

          return (
            <div key={expense.id} className={`p-3 rounded-lg border ${notificationColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{expense.name}</h3>
                  <p className="text-sm text-gray-600">{expense.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    ${expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                  {notificationIcon}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(expense.dueDate).toLocaleDateString('es-ES')}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${notificationColor.replace('text-', 'bg-').replace('border-', '')}`}>
                  {notificationText}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {upcomingExpenses.length > 3 && (
        <div className="mt-4 text-center">
          <Link 
            href="/fixed-expenses"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver {upcomingExpenses.length - 3} más...
          </Link>
        </div>
      )}
    </div>
  )
} 
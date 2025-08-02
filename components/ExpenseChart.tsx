'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense' | 'savings'
  category: string
  date: string
}

interface ExpenseChartProps {
  transactions: Transaction[]
}

const COLORS = [
  '#3b82f6', // primary
  '#ef4444', // danger
  '#22c55e', // success
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
]

export default function ExpenseChart({ transactions }: ExpenseChartProps) {
  // Filtrar solo gastos
  const expenses = transactions.filter(t => t.type === 'expense')
  
  // Agrupar por categoría
  const categoryData = expenses.reduce((acc, transaction) => {
    const category = transaction.category || 'Sin categoría'
    if (acc[category]) {
      acc[category] += transaction.amount
    } else {
      acc[category] = transaction.amount
    }
    return acc
  }, {} as Record<string, number>)

  // Convertir a formato para Recharts
  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No hay datos de gastos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 'Monto']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 
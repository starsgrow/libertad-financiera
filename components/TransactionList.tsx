import { Trash2, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'

interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense' | 'savings'
  category: string
  date: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: number) => void
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-5 w-5 text-success-600" />
      case 'expense':
        return <TrendingDown className="h-5 w-5 text-danger-600" />
      case 'savings':
        return <PiggyBank className="h-5 w-5 text-primary-600" />
      default:
        return null
    }
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-success-600'
      case 'expense':
        return 'text-danger-600'
      case 'savings':
        return 'text-primary-600'
      default:
        return 'text-gray-600'
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay transacciones recientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-full shadow-sm">
              {getIcon(transaction.type)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{transaction.description}</p>
              <p className="text-sm text-gray-500">{transaction.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${getAmountColor(transaction.type)}`}>
              {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 
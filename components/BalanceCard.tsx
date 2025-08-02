import { LucideIcon } from 'lucide-react'

interface BalanceCardProps {
  title: string
  amount: number
  icon: LucideIcon
  color: 'primary' | 'success' | 'danger'
}

export default function BalanceCard({ title, amount, icon: Icon, color }: BalanceCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    success: 'bg-success-50 border-success-200 text-success-700',
    danger: 'bg-danger-50 border-danger-200 text-danger-700',
  }

  const iconColorClasses = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    danger: 'text-danger-600',
  }

  return (
    <div className={`card border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">
            ${amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`p-3 rounded-full bg-white/50 ${iconColorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
} 
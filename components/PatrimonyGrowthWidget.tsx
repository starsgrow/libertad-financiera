'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Plus, Calendar, DollarSign, BarChart3 } from 'lucide-react'
import { 
  calculateGrowthRate, 
  getNewAssetsInPeriod, 
  savePatrimonySnapshot,
  getPatrimonyHistory 
} from '@/lib/database'

type Period = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

interface GrowthData {
  currentValue: number
  previousValue: number
  growthAmount: number
  growthPercentage: number
  period: string
}

interface NewAssetsData {
  newAssetsValue: number
  newAssetsCount: number
  period: string
}

export default function PatrimonyGrowthWidget() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly')
  const [growthData, setGrowthData] = useState<GrowthData | null>(null)
  const [newAssetsData, setNewAssetsData] = useState<NewAssetsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    loadGrowthData()
  }, [selectedPeriod])

  const loadGrowthData = async () => {
    try {
      setIsLoading(true)
      
      // Guardar snapshot actual si no existe
      await savePatrimonySnapshot(selectedPeriod)
      
      // Cargar datos de crecimiento
      const growth = await calculateGrowthRate(selectedPeriod)
      const newAssets = await getNewAssetsInPeriod(selectedPeriod)
      const historyData = await getPatrimonyHistory(selectedPeriod, 6)
      
      setGrowthData(growth)
      setNewAssetsData(newAssets)
      setHistory(historyData)
    } catch (error) {
      console.error('Error cargando datos de crecimiento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGrowthColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600'
    if (percentage < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="h-4 w-4" />
    if (percentage < 0) return <TrendingDown className="h-4 w-4" />
    return <BarChart3 className="h-4 w-4" />
  }

  const periods = [
    { value: 'monthly', label: 'Mensual', icon: Calendar },
    { value: 'quarterly', label: 'Trimestral', icon: BarChart3 },
    { value: 'semiannual', label: 'Semestral', icon: TrendingUp },
    { value: 'annual', label: 'Anual', icon: DollarSign }
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Crecimiento Patrimonio</h3>
          <div className="animate-pulse">
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Crecimiento Patrimonio</h3>
        <div className="flex space-x-1">
          {periods.map((period) => {
            const Icon = period.icon
            return (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as Period)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={period.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>
      </div>

      {growthData && (
        <div className="space-y-4">
          {/* Crecimiento del período */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Crecimiento {growthData.period}
              </span>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(growthData.growthPercentage)}
                <span className={`text-sm font-medium ${getGrowthColor(growthData.growthPercentage)}`}>
                  {growthData.growthPercentage > 0 ? '+' : ''}{growthData.growthPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Valor Actual:</span>
                <span className="ml-2 font-medium">
                  ${growthData.currentValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Valor Anterior:</span>
                <span className="ml-2 font-medium">
                  ${growthData.previousValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-sm">Diferencia:</span>
              <span className={`ml-2 font-medium ${getGrowthColor(growthData.growthAmount)}`}>
                {growthData.growthAmount > 0 ? '+' : ''}${growthData.growthAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Nuevos activos */}
          {newAssetsData && newAssetsData.newAssetsValue > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">
                  Nuevos Activos {newAssetsData.period}
                </span>
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Valor:</span>
                  <span className="ml-2 font-medium text-blue-700">
                    ${newAssetsData.newAssetsValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600">Cantidad:</span>
                  <span className="ml-2 font-medium text-blue-700">
                    {newAssetsData.newAssetsCount} activos
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Historial reciente */}
          {history.length > 1 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Historial Reciente</h4>
              <div className="space-y-2">
                {history.slice(0, 3).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {new Date(item.date).toLocaleDateString('es-ES', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="font-medium">
                      ${item.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!growthData && (
        <div className="text-center py-6">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            No hay datos suficientes para calcular el crecimiento {selectedPeriod === 'monthly' ? 'mensual' : 
            selectedPeriod === 'quarterly' ? 'trimestral' : 
            selectedPeriod === 'semiannual' ? 'semestral' : 'anual'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Agrega más activos y espera al menos un período completo
          </p>
        </div>
      )}
    </div>
  )
} 
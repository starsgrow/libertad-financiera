'use client'

import { useState, useEffect } from 'react'
import { Building2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { getPatrimonyTotal, getAllPatrimony } from '@/lib/database'

export default function PatrimonyWidget() {
  const [totalValue, setTotalValue] = useState(0)
  const [totalPurchaseValue, setTotalPurchaseValue] = useState(0)
  const [totalVariation, setTotalVariation] = useState(0)
  const [totalVariationPercentage, setTotalVariationPercentage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPatrimonyData()
  }, [])

  const loadPatrimonyData = async () => {
    try {
      setIsLoading(true)
      const items = await getAllPatrimony()
      const total = await getPatrimonyTotal()
      
      const totalPurchase = items.reduce((sum, item) => sum + item.purchaseValue, 0)
      const totalVariationAmount = total - totalPurchase
      const totalVariationPercent = totalPurchase > 0 ? (totalVariationAmount / totalPurchase) * 100 : 0

      setTotalValue(total)
      setTotalPurchaseValue(totalPurchase)
      setTotalVariation(totalVariationAmount)
      setTotalVariationPercentage(totalVariationPercent)
    } catch (error) {
      console.error('Error cargando datos de patrimonio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getVariationColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600'
    if (percentage < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getVariationIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="h-4 w-4" />
    if (percentage < 0) return <TrendingDown className="h-4 w-4" />
    return <DollarSign className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Patrimonio</h3>
          <Building2 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Patrimonio</h3>
        <Building2 className="h-5 w-5 text-primary-600" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Valor Actual:</span>
          <span className="text-sm font-medium text-gray-900">
            ${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Valor Compra:</span>
          <span className="text-sm font-medium text-gray-900">
            ${totalPurchaseValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Variación:</span>
          <div className="flex items-center space-x-1">
            {getVariationIcon(totalVariationPercentage)}
            <span className={`text-sm font-medium ${getVariationColor(totalVariationPercentage)}`}>
              {totalVariationPercentage > 0 ? '+' : ''}{totalVariationPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Diferencia:</span>
            <span className={`text-xs font-medium ${getVariationColor(totalVariationPercentage)}`}>
              {totalVariation > 0 ? '+' : ''}${totalVariation.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Car, 
  Home, 
  Gem, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { db, getAllPatrimony, addPatrimonyItem, updatePatrimonyItem, deletePatrimonyItem, getPatrimonyTotal, getPatrimonyByCategory } from '@/lib/database'
import PatrimonyGrowthWidget from '@/components/PatrimonyGrowthWidget'

interface PatrimonyItem {
  id: string
  name: string
  description?: string
  category: string
  purchaseValue: number
  currentValue: number
  purchaseDate: string
  lastUpdate: string
  notes?: string
}

interface AddPatrimonyModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: Omit<PatrimonyItem, 'id' | 'lastUpdate'>) => void
}

function AddPatrimonyModal({ isOpen, onClose, onAdd }: AddPatrimonyModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [purchaseValue, setPurchaseValue] = useState('')
  const [currentValue, setCurrentValue] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [notes, setNotes] = useState('')

  const categories = [
    { value: 'inmueble', label: 'Inmueble', icon: Home },
    { value: 'vehiculo', label: 'Vehículo', icon: Car },
    { value: 'joyas', label: 'Joyas', icon: Gem },
    { value: 'otros', label: 'Otros', icon: Building2 }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const purchaseValueNum = parseFloat(purchaseValue)
    const currentValueNum = parseFloat(currentValue)
    
    if (isNaN(purchaseValueNum) || isNaN(currentValueNum)) {
      alert('Por favor ingresa valores válidos')
      return
    }

    onAdd({
      name,
      description,
      category,
      purchaseValue: purchaseValueNum,
      currentValue: currentValueNum,
      purchaseDate,
      notes
    })

    handleClose()
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setCategory('')
    setPurchaseValue('')
    setCurrentValue('')
    setPurchaseDate('')
    setNotes('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Agregar Objeto de Valor</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Objeto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Casa en el centro"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              placeholder="Descripción opcional"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Valor de compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor de Compra *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={purchaseValue}
                onChange={(e) => setPurchaseValue(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Valor actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Actual *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Fecha de compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Compra *
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PatrimonyPage() {
  const [patrimonyItems, setPatrimonyItems] = useState<PatrimonyItem[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalPurchaseValue, setTotalPurchaseValue] = useState(0)
  const [totalVariation, setTotalVariation] = useState(0)
  const [totalVariationPercentage, setTotalVariationPercentage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpdateReminder, setShowUpdateReminder] = useState(false)

  useEffect(() => {
    loadPatrimony()
  }, [])

  const loadPatrimony = async () => {
    try {
      setIsLoading(true)
      const items = await getAllPatrimony()
      setPatrimonyItems(items)
      
      const total = await getPatrimonyTotal()
      setTotalValue(total)

      // Calcular valores totales de compra y variación
      const totalPurchase = items.reduce((sum, item) => sum + item.purchaseValue, 0)
      const totalVariationAmount = total - totalPurchase
      const totalVariationPercent = totalPurchase > 0 ? (totalVariationAmount / totalPurchase) * 100 : 0

      setTotalPurchaseValue(totalPurchase)
      setTotalVariation(totalVariationAmount)
      setTotalVariationPercentage(totalVariationPercent)

      // Verificar si hay items que necesitan actualización (más de 30 días)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const needsUpdate = items.some(item => {
        const lastUpdate = new Date(item.lastUpdate)
        return lastUpdate < thirtyDaysAgo
      })
      
      setShowUpdateReminder(needsUpdate)
    } catch (error) {
      console.error('Error cargando patrimonio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (item: Omit<PatrimonyItem, 'id' | 'lastUpdate'>) => {
    try {
      const newItem = await addPatrimonyItem(item)
      setPatrimonyItems([newItem, ...patrimonyItems])
      await loadPatrimony() // Recargar totales
    } catch (error) {
      console.error('Error agregando item:', error)
    }
  }

  const updateItem = async (id: string, updates: Partial<PatrimonyItem>) => {
    try {
      const updatedItem = await updatePatrimonyItem(id, updates)
      setPatrimonyItems(items => 
        items.map(item => item.id === id ? updatedItem : item)
      )
      await loadPatrimony() // Recargar totales
    } catch (error) {
      console.error('Error actualizando item:', error)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este objeto?')) return
    
    try {
      await deletePatrimonyItem(id)
      setPatrimonyItems(items => items.filter(item => item.id !== id))
      await loadPatrimony() // Recargar totales
    } catch (error) {
      console.error('Error eliminando item:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inmueble': return <Home className="h-5 w-5" />
      case 'vehiculo': return <Car className="h-5 w-5" />
      case 'joyas': return <Gem className="h-5 w-5" />
      default: return <Building2 className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inmueble': return 'bg-blue-100 text-blue-800'
      case 'vehiculo': return 'bg-green-100 text-green-800'
      case 'joyas': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'inmueble': return 'Inmueble'
      case 'vehiculo': return 'Vehículo'
      case 'joyas': return 'Joyas'
      default: return 'Otros'
    }
  }

  // Función para calcular el porcentaje de variación de un item
  const getItemVariationPercentage = (purchaseValue: number, currentValue: number) => {
    if (purchaseValue === 0) return 0
    return ((currentValue - purchaseValue) / purchaseValue) * 100
  }

  // Función para obtener el color del porcentaje de variación
  const getVariationColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600'
    if (percentage < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  // Función para obtener el icono de variación
  const getVariationIcon = (percentage: number) => {
    if (percentage > 0) return '↗️'
    if (percentage < 0) return '↘️'
    return '→'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando patrimonio...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Patrimonio</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total Actual</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total Compra</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalPurchaseValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Variación Total</p>
                <p className={`text-2xl font-bold ${getVariationColor(totalVariationPercentage)}`}>
                  {getVariationIcon(totalVariationPercentage)} ${totalVariation.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-sm font-medium ${getVariationColor(totalVariationPercentage)}`}>
                  {totalVariationPercentage > 0 ? '+' : ''}{totalVariationPercentage.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Objetos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patrimonyItems.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recordatorio de actualización */}
        {showUpdateReminder && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Recordatorio de Actualización
                </p>
                <p className="text-sm text-yellow-700">
                  Algunos objetos no han sido actualizados en más de 30 días. 
                  Considera revisar sus valores actuales.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Widget de crecimiento */}
        <div className="mb-6">
          <PatrimonyGrowthWidget />
        </div>
      </div>

      {/* Lista de objetos */}
      <div className="space-y-4">
        {patrimonyItems.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay objetos registrados
            </h3>
            <p className="text-gray-600">
              Agrega tu primer objeto de valor para comenzar a registrar tu patrimonio
            </p>
          </div>
        ) : (
          patrimonyItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-sm text-gray-500">{getCategoryLabel(item.category)}</span>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-gray-600 mb-3">{item.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Valor de Compra</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${item.purchaseValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valor Actual</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${item.currentValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Diferencia</p>
                      <p className={`text-sm font-medium ${
                        item.currentValue > item.purchaseValue ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${(item.currentValue - item.purchaseValue).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Variación %</p>
                      <p className={`text-sm font-medium ${getVariationColor(getItemVariationPercentage(item.purchaseValue, item.currentValue))}`}>
                        {getVariationIcon(getItemVariationPercentage(item.purchaseValue, item.currentValue))} {getItemVariationPercentage(item.purchaseValue, item.currentValue).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Última Actualización</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(item.lastUpdate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">{item.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      const newValue = prompt('Ingresa el nuevo valor actual:', item.currentValue.toString())
                      if (newValue && !isNaN(parseFloat(newValue))) {
                        updateItem(item.id, { currentValue: parseFloat(newValue) })
                      }
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Actualizar valor"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para agregar objeto */}
      <AddPatrimonyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addItem}
      />
    </div>
  )
} 
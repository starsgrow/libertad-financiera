'use client'

import { useState } from 'react'
import { X, Download, Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { exportAllData, importAllData } from '@/lib/database'
import { db } from '@/lib/database'

interface DataBackupModalProps {
  isOpen: boolean
  onClose: () => void
  onDataChange: () => void
}

export default function DataBackupModal({ isOpen, onClose, onDataChange }: DataBackupModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [cleanedData, setCleanedData] = useState<any>(null)
  const [isClearing, setIsClearing] = useState(false)

  const cleanJSONData = (data: any) => {
    console.log('Limpiando datos JSON...')
    
    // Limpiar transacciones duplicadas (por ID)
    const originalTransactions = data.transactions?.length || 0
    const uniqueTransactions = data.transactions?.filter((transaction: any, index: number, self: any[]) => 
      index === self.findIndex(t => t.id === transaction.id)
    ) || []
    
    // Limpiar gastos fijos duplicados (por ID)
    const originalFixedExpenses = data.fixedExpenses?.length || 0
    const uniqueFixedExpenses = data.fixedExpenses?.filter((expense: any, index: number, self: any[]) => 
      index === self.findIndex(e => e.id === expense.id)
    ) || []
    
    // Limpiar patrimonio duplicado (por ID)
    const originalPatrimony = data.patrimony?.length || 0
    const uniquePatrimony = data.patrimony?.filter((item: any, index: number, self: any[]) => 
      index === self.findIndex(p => p.id === item.id)
    ) || []
    
    // Limpiar historial duplicado (por fecha + período)
    const originalHistory = data.patrimonyHistory?.length || 0
    const uniqueHistory = data.patrimonyHistory?.filter((history: any, index: number, self: any[]) => {
      const key = `${history.date}_${history.period}`
      return index === self.findIndex(h => `${h.date}_${h.period}` === key)
    }) || []
    
    const cleaned = {
      transactions: uniqueTransactions,
      fixedExpenses: uniqueFixedExpenses,
      patrimony: uniquePatrimony,
      patrimonyHistory: uniqueHistory,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const duplicatesRemoved = {
      transactions: originalTransactions - uniqueTransactions.length,
      fixedExpenses: originalFixedExpenses - uniqueFixedExpenses.length,
      patrimony: originalPatrimony - uniquePatrimony.length,
      patrimonyHistory: originalHistory - uniqueHistory.length
    }
    
    console.log('Datos limpiados:', {
      original: {
        transactions: originalTransactions,
        fixedExpenses: originalFixedExpenses,
        patrimony: originalPatrimony,
        patrimonyHistory: originalHistory
      },
      cleaned: {
        transactions: uniqueTransactions.length,
        fixedExpenses: uniqueFixedExpenses.length,
        patrimony: uniquePatrimony.length,
        patrimonyHistory: uniqueHistory.length
      },
      duplicatesRemoved
    })
    
    return cleaned
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setMessage(null)
      
      const data = await exportAllData()
      
      // Limpiar los datos antes de exportar
      const cleanedData = cleanJSONData(data)
      
      const blob = new Blob([JSON.stringify(cleanedData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `libertad-financiera-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setMessage({ 
        type: 'success', 
        text: `Datos exportados exitosamente (${cleanedData.transactions.length} transacciones, ${cleanedData.fixedExpenses.length} gastos fijos, ${cleanedData.patrimony.length} patrimonio, ${cleanedData.patrimonyHistory.length} historial)` 
      })
    } catch (error) {
      console.error('Error exportando datos:', error)
      setMessage({ type: 'error', text: 'Error al exportar los datos' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleCleanCurrentData = async () => {
    try {
      setIsCleaning(true)
      setMessage(null)
      
      console.log('Limpiando datos actuales de la aplicación...')
      const data = await exportAllData()
      const cleaned = cleanJSONData(data)
      
      // Reimportar los datos limpios
      await importAllData(cleaned)
      onDataChange() // Recargar datos en la aplicación
      
      const duplicatesRemoved = {
        transactions: (data.transactions?.length || 0) - cleaned.transactions.length,
        fixedExpenses: (data.fixedExpenses?.length || 0) - cleaned.fixedExpenses.length,
        patrimony: (data.patrimony?.length || 0) - cleaned.patrimony.length,
        patrimonyHistory: (data.patrimonyHistory?.length || 0) - cleaned.patrimonyHistory.length
      }
      
      const totalDuplicates = duplicatesRemoved.transactions + duplicatesRemoved.fixedExpenses + duplicatesRemoved.patrimony + duplicatesRemoved.patrimonyHistory
      
      setMessage({ 
        type: 'success', 
        text: `Datos actuales limpiados: ${cleaned.transactions.length} transacciones, ${cleaned.fixedExpenses.length} gastos fijos, ${cleaned.patrimony.length} patrimonio, ${cleaned.patrimonyHistory.length} historial. ${totalDuplicates} duplicados eliminados.` 
      })
    } catch (error) {
      console.error('Error limpiando datos actuales:', error)
      setMessage({ type: 'error', text: 'Error al limpiar los datos actuales' })
    } finally {
      setIsCleaning(false)
    }
  }

  const handleClearAllData = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODOS los datos de la aplicación? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setIsClearing(true)
      setMessage(null)
      
      console.log('Eliminando todos los datos de la aplicación...')
      
      // Limpiar completamente la base de datos
      await db.forceClearDatabase()
      
      // Recargar datos en la aplicación
      onDataChange()
      
      setMessage({ 
        type: 'success', 
        text: 'Todos los datos han sido eliminados exitosamente. La aplicación está ahora vacía.' 
      })
    } catch (error) {
      console.error('Error eliminando todos los datos:', error)
      setMessage({ type: 'error', text: 'Error al eliminar todos los datos' })
    } finally {
      setIsClearing(false)
    }
  }

  const handleCleanJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsCleaning(true)
      setMessage(null)
      
      console.log('Leyendo archivo para limpieza:', file.name)
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Validar estructura básica
      if (!data.transactions || !data.fixedExpenses || !data.patrimony || !data.patrimonyHistory) {
        throw new Error('El archivo no tiene la estructura correcta de backup')
      }
      
      // Limpiar datos
      const cleaned = cleanJSONData(data)
      setCleanedData(cleaned)
      
      const duplicatesRemoved = {
        transactions: (data.transactions?.length || 0) - cleaned.transactions.length,
        fixedExpenses: (data.fixedExpenses?.length || 0) - cleaned.fixedExpenses.length,
        patrimony: (data.patrimony?.length || 0) - cleaned.patrimony.length,
        patrimonyHistory: (data.patrimonyHistory?.length || 0) - cleaned.patrimonyHistory.length
      }
      
      const totalDuplicates = duplicatesRemoved.transactions + duplicatesRemoved.fixedExpenses + duplicatesRemoved.patrimony + duplicatesRemoved.patrimonyHistory
      
      setMessage({ 
        type: 'success', 
        text: `JSON limpiado exitosamente. ${totalDuplicates} duplicados eliminados.` 
      })
    } catch (error) {
      console.error('Error limpiando JSON:', error)
      let errorMessage = 'Error al limpiar el archivo.'
      
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorMessage = 'El archivo no es un JSON válido.'
        } else if (error.message.includes('estructura')) {
          errorMessage = 'El archivo no tiene el formato correcto de backup.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsCleaning(false)
      // Limpiar el input
      event.target.value = ''
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      setMessage(null)
      
      console.log('Leyendo archivo:', file.name)
      const text = await file.text()
      console.log('Archivo leído, parseando JSON...')
      
      const data = JSON.parse(text)
      console.log('JSON parseado, validando estructura...')
      
      // Validar que el archivo tiene la estructura correcta
      if (!data.transactions || !data.fixedExpenses || !data.patrimony || !data.patrimonyHistory) {
        console.error('Estructura de archivo inválida:', {
          hasTransactions: !!data.transactions,
          hasFixedExpenses: !!data.fixedExpenses,
          hasPatrimony: !!data.patrimony,
          hasPatrimonyHistory: !!data.patrimonyHistory
        })
        throw new Error('El archivo no tiene la estructura correcta de backup')
      }
      
      console.log('Estructura válida, iniciando importación...')
      // Usar datos limpios si están disponibles, sino limpiar automáticamente
      const dataToImport = cleanedData || cleanJSONData(data)
      await importAllData(dataToImport)
      onDataChange() // Recargar datos en la aplicación
      
      setMessage({ type: 'success', text: 'Datos importados exitosamente' })
      setCleanedData(null) // Limpiar datos procesados
    } catch (error) {
      console.error('Error importando datos:', error)
      let errorMessage = 'Error al importar los datos.'
      
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorMessage = 'El archivo no es un JSON válido.'
        } else if (error.message.includes('estructura')) {
          errorMessage = 'El archivo no tiene el formato correcto de backup.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsImporting(false)
      // Limpiar el input
      event.target.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Respaldo de Datos</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mensaje de estado */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Exportar datos */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Exportar Datos</h3>
                <p className="text-sm text-gray-600">
                  Descarga una copia de todos tus datos financieros
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Descargar Backup</span>
                </>
              )}
            </button>
          </div>

          {/* Limpiar JSON */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Limpiar JSON</h3>
                <p className="text-sm text-gray-600">
                  Elimina duplicados del archivo antes de importar
                </p>
              </div>
            </div>
            <label className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer">
              {isCleaning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Limpiando...</span>
                </>
              ) : (
                <>
                  <FileText size={16} />
                  <span>Limpiar Archivo</span>
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleCleanJSON}
                disabled={isCleaning}
                className="hidden"
              />
            </label>
            {cleanedData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>JSON limpiado:</strong> {cleanedData.transactions?.length || 0} transacciones, {cleanedData.fixedExpenses?.length || 0} gastos fijos, {cleanedData.patrimony?.length || 0} items de patrimonio, {cleanedData.patrimonyHistory?.length || 0} registros de historial
                </p>
              </div>
            )}
          </div>

          {/* Limpiar datos actuales */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Limpiar Datos Actuales</h3>
                <p className="text-sm text-gray-600">
                  Elimina duplicados de los datos actuales de la aplicación
                </p>
              </div>
            </div>
            <button
              onClick={handleCleanCurrentData}
              disabled={isCleaning}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isCleaning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Limpiando datos actuales...</span>
                </>
              ) : (
                <>
                  <FileText size={16} />
                  <span>Limpiar Datos Actuales</span>
                </>
              )}
            </button>
          </div>

          {/* Eliminar todos los datos */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Eliminar Todos los Datos</h3>
                <p className="text-sm text-gray-600">
                  Elimina todos los datos de la aplicación, incluyendo transacciones, gastos fijos, patrimonio y historial.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearAllData}
              disabled={isClearing}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isClearing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} />
                  <span>Eliminar Todos los Datos</span>
                </>
              )}
            </button>
          </div>

          {/* Importar datos */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Importar Datos</h3>
                <p className="text-sm text-gray-600">
                  Restaura datos desde un archivo de backup
                  {cleanedData && <span className="text-green-600 font-medium"> (usará datos limpios)</span>}
                </p>
              </div>
            </div>
            <label className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer">
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Seleccionar Archivo</span>
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">¿Qué incluye el backup?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Todas las transacciones (ingresos, gastos, ahorros)</li>
                  <li>• Gastos fijos y sus fechas de vencimiento</li>
                  <li>• Patrimonio y valores actuales</li>
                  <li>• Historial de crecimiento del patrimonio</li>
                  <li>• Balances de Cash y Banks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">Importante:</p>
                <p className="text-xs">
                  Al importar datos, se reemplazarán todos los datos existentes. 
                  Asegúrate de hacer un backup antes de importar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
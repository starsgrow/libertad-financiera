'use client'

import { useState, useEffect } from 'react'
import { Database, HardDrive, Trash2 } from 'lucide-react'

export default function StorageInfo() {
  const [storageInfo, setStorageInfo] = useState({
    indexedDB: false,
    localStorage: false,
    totalTransactions: 0,
    storageUsed: '0 KB'
  })

  useEffect(() => {
    checkStorage()
  }, [])

  const checkStorage = async () => {
    try {
      // Verificar IndexedDB
      const db = indexedDB.open('LibertadFinancieraDB')
      db.onsuccess = () => {
        setStorageInfo(prev => ({ ...prev, indexedDB: true }))
      }
      db.onerror = () => {
        setStorageInfo(prev => ({ ...prev, indexedDB: false }))
      }

      // Verificar localStorage
      const hasLocalStorage = !!localStorage.getItem('transactions')
      setStorageInfo(prev => ({ ...prev, localStorage: hasLocalStorage }))

      // Contar transacciones (aproximado)
      const transactions = localStorage.getItem('transactions')
      if (transactions) {
        const parsed = JSON.parse(transactions)
        setStorageInfo(prev => ({ 
          ...prev, 
          totalTransactions: parsed.length,
          storageUsed: `${(transactions.length / 1024).toFixed(1)} KB`
        }))
      }
    } catch (error) {
      console.error('Error checking storage:', error)
    }
  }

  const clearAllData = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        localStorage.removeItem('transactions')
        // También limpiar IndexedDB si está disponible
        const db = indexedDB.open('LibertadFinancieraDB')
        db.onsuccess = () => {
          const transaction = db.result.transaction(['transactions'], 'readwrite')
          const store = transaction.objectStore('transactions')
          store.clear()
        }
        
        setStorageInfo({
          indexedDB: false,
          localStorage: false,
          totalTransactions: 0,
          storageUsed: '0 KB'
        })
        
        alert('Datos eliminados correctamente')
      } catch (error) {
        console.error('Error clearing data:', error)
        alert('Error al eliminar datos')
      }
    }
  }

  return (
    <div className="card bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Información de Almacenamiento</h3>
        <button
          onClick={clearAllData}
          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          title="Eliminar todos los datos"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-primary-600" />
            <span className="text-sm text-gray-700">IndexedDB</span>
          </div>
          <span className={`text-sm font-medium ${storageInfo.indexedDB ? 'text-success-600' : 'text-gray-500'}`}>
            {storageInfo.indexedDB ? 'Disponible' : 'No disponible'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-primary-600" />
            <span className="text-sm text-gray-700">localStorage</span>
          </div>
          <span className={`text-sm font-medium ${storageInfo.localStorage ? 'text-success-600' : 'text-gray-500'}`}>
            {storageInfo.localStorage ? 'En uso' : 'No usado'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Transacciones</span>
          <span className="text-sm font-medium text-gray-900">
            {storageInfo.totalTransactions}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Espacio usado</span>
          <span className="text-sm font-medium text-gray-900">
            {storageInfo.storageUsed}
          </span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>IndexedDB:</strong> Base de datos local más robusta que localStorage. 
          Mejor rendimiento y más espacio de almacenamiento.
        </p>
      </div>
    </div>
  )
} 
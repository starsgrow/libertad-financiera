// Database service using IndexedDB
const DB_NAME = 'LibertadFinancieraDB'
const DB_VERSION = 5
const TRANSACTIONS_STORE = 'transactions'
const FIXED_EXPENSES_STORE = 'fixedExpenses'
const PATRIMONY_STORE = 'patrimony'
const PATRIMONY_HISTORY_STORE = 'patrimonyHistory'

export interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense' | 'savings' | 'transfer'
  category: string
  date: string
  accountType?: 'cash' | 'banks'
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  description?: string
  isPaid: boolean
  createdAt?: string
}

export interface PatrimonyItem {
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

export interface PatrimonyHistory {
  id: string
  date: string
  totalValue: number
  totalPurchaseValue: number
  totalVariation: number
  totalVariationPercentage: number
  itemsCount: number
  period: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
}

class DatabaseService {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Crear store de transacciones si no existe
        if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
          const transactionsStore = db.createObjectStore(TRANSACTIONS_STORE, { keyPath: 'id', autoIncrement: true })
          transactionsStore.createIndex('type', 'type', { unique: false })
          transactionsStore.createIndex('date', 'date', { unique: false })
          transactionsStore.createIndex('category', 'category', { unique: false })
        }

        // Crear store de gastos fijos si no existe
        if (!db.objectStoreNames.contains(FIXED_EXPENSES_STORE)) {
          const fixedExpensesStore = db.createObjectStore(FIXED_EXPENSES_STORE, { keyPath: 'id' })
          fixedExpensesStore.createIndex('isPaid', 'isPaid', { unique: false })
          fixedExpensesStore.createIndex('category', 'category', { unique: false })
          fixedExpensesStore.createIndex('dueDate', 'dueDate', { unique: false })
        }

        // Crear store de patrimonio si no existe
        if (!db.objectStoreNames.contains(PATRIMONY_STORE)) {
          const patrimonyStore = db.createObjectStore(PATRIMONY_STORE, { keyPath: 'id' })
          patrimonyStore.createIndex('category', 'category', { unique: false })
          patrimonyStore.createIndex('lastUpdate', 'lastUpdate', { unique: false })
        }

        // Crear store de historial de patrimonio si no existe
        if (!db.objectStoreNames.contains(PATRIMONY_HISTORY_STORE)) {
          const patrimonyHistoryStore = db.createObjectStore(PATRIMONY_HISTORY_STORE, { keyPath: 'id' })
          patrimonyHistoryStore.createIndex('date', 'date', { unique: false })
          patrimonyHistoryStore.createIndex('period', 'period', { unique: false })
        }
      }
    })
  }

  async getAllTransactions(): Promise<Transaction[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRANSACTIONS_STORE], 'readonly')
      const store = transaction.objectStore(TRANSACTIONS_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const transactions = request.result.sort((a, b) => b.id - a.id)
        resolve(transactions)
      }
    })
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    if (!this.db) await this.init()
    
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now(),
      accountType: transaction.accountType || 'cash' // Default to cash if not specified
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite')
      const store = transaction.objectStore(TRANSACTIONS_STORE)
      const request = store.add(newTransaction)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(newTransaction)
    })
  }

  async deleteTransaction(id: number): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite')
      const store = transaction.objectStore(TRANSACTIONS_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite')
      const store = transaction.objectStore(TRANSACTIONS_STORE)
      const request = store.put(transaction)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getTransactionsByType(type: 'income' | 'expense' | 'savings'): Promise<Transaction[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRANSACTIONS_STORE], 'readonly')
      const store = transaction.objectStore(TRANSACTIONS_STORE)
      const index = store.index('type')
      const request = index.getAll(type)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TRANSACTIONS_STORE], 'readonly')
      const store = transaction.objectStore(TRANSACTIONS_STORE)
      const index = store.index('category')
      const request = index.getAll(category)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([
        TRANSACTIONS_STORE, 
        FIXED_EXPENSES_STORE, 
        PATRIMONY_STORE, 
        PATRIMONY_HISTORY_STORE
      ], 'readwrite')
      
      const transactionsStore = transaction.objectStore(TRANSACTIONS_STORE)
      const fixedExpensesStore = transaction.objectStore(FIXED_EXPENSES_STORE)
      const patrimonyStore = transaction.objectStore(PATRIMONY_STORE)
      const patrimonyHistoryStore = transaction.objectStore(PATRIMONY_HISTORY_STORE)
      
      let completed = 0
      const totalStores = 4
      
      const checkComplete = () => {
        completed++
        if (completed === totalStores) {
          console.log('Todos los stores limpiados exitosamente')
          resolve()
        }
      }
      
      transactionsStore.clear().onsuccess = checkComplete
      fixedExpensesStore.clear().onsuccess = checkComplete
      patrimonyStore.clear().onsuccess = checkComplete
      patrimonyHistoryStore.clear().onsuccess = checkComplete
      
      transaction.onerror = () => {
        console.error('Error limpiando datos:', transaction.error)
        reject(transaction.error)
      }
    })
  }

  // Método para forzar la limpieza completa de la base de datos
  async forceClearDatabase(): Promise<void> {
    console.log('Forzando limpieza completa de la base de datos...')
    
    // Cerrar la conexión actual
    if (this.db) {
      this.db.close()
      this.db = null
    }
    
    // Eliminar la base de datos completamente
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME)
      
      deleteRequest.onerror = () => {
        console.error('Error eliminando base de datos:', deleteRequest.error)
        reject(deleteRequest.error)
      }
      
      deleteRequest.onsuccess = () => {
        console.log('Base de datos eliminada completamente')
        // Recrear la base de datos
        this.init().then(() => {
          console.log('Base de datos recreada exitosamente')
          resolve()
        }).catch(reject)
      }
    })
  }

  // Método para migrar datos de localStorage a IndexedDB
  async migrateFromLocalStorage(): Promise<void> {
    const storedData = localStorage.getItem('transactions')
    if (storedData) {
      try {
        const transactions = JSON.parse(storedData)
        for (const transaction of transactions) {
          await this.addTransaction(transaction)
        }
        localStorage.removeItem('transactions') // Limpiar localStorage
        console.log('Migración completada')
      } catch (error) {
        console.error('Error en migración:', error)
      }
    }
  }

  // Métodos para gastos fijos
  async getAllFixedExpenses(): Promise<FixedExpense[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FIXED_EXPENSES_STORE], 'readonly')
      const store = transaction.objectStore(FIXED_EXPENSES_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const expenses = request.result.sort((a, b) => {
          // Ordenar por fecha de creación si existe, sino por ID
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          // Si no tienen createdAt, ordenar por ID (más reciente primero)
          return parseInt(b.id) - parseInt(a.id)
        })
        resolve(expenses)
      }
    })
  }

  async addFixedExpense(expense: Omit<FixedExpense, 'id'>): Promise<FixedExpense> {
    if (!this.db) await this.init()
    
    const newExpense: FixedExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FIXED_EXPENSES_STORE], 'readwrite')
      const store = transaction.objectStore(FIXED_EXPENSES_STORE)
      const request = store.add(newExpense)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(newExpense)
    })
  }

  async markFixedExpenseAsPaid(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    console.log('DB: Marcando como pagado gasto fijo con ID:', id)
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FIXED_EXPENSES_STORE], 'readwrite')
      const store = transaction.objectStore(FIXED_EXPENSES_STORE)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const expense = getRequest.result
        console.log('DB: Gasto fijo encontrado para marcar como pagado:', expense)
        if (expense) {
          expense.isPaid = true
          expense.paymentDate = new Date().toISOString()
          
          const putRequest = store.put(expense)
          putRequest.onerror = () => {
            console.error('DB: Error marcando como pagado:', putRequest.error)
            reject(putRequest.error)
          }
          putRequest.onsuccess = () => {
            console.log('DB: Gasto fijo marcado como pagado exitosamente')
            resolve()
          }
        } else {
          console.error('DB: Gasto fijo no encontrado para marcar como pagado con ID:', id)
          reject(new Error('Gasto fijo no encontrado'))
        }
      }
      getRequest.onerror = () => {
        console.error('DB: Error obteniendo gasto fijo para marcar como pagado:', getRequest.error)
        reject(getRequest.error)
      }
    })
  }

  async getUpcomingFixedExpenses(): Promise<FixedExpense[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FIXED_EXPENSES_STORE], 'readonly')
      const store = transaction.objectStore(FIXED_EXPENSES_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const today = new Date()
        const upcomingExpenses = request.result.filter((expense: FixedExpense) => {
          if (expense.isPaid) return false
          const dueDate = new Date(expense.dueDate)
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          return daysUntilDue <= 5 && daysUntilDue >= -1 // Incluye vencidos y próximos a vencer
        })
        resolve(upcomingExpenses.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
      }
    })
  }

  async updateFixedExpense(id: string, updates: Partial<Omit<FixedExpense, 'id'>>): Promise<FixedExpense> {
    if (!this.db) await this.init()
    
    console.log('DB: Actualizando gasto fijo con ID:', id)
    console.log('DB: Updates:', updates)
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FIXED_EXPENSES_STORE], 'readwrite')
      const store = transaction.objectStore(FIXED_EXPENSES_STORE)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const expense = getRequest.result
        console.log('DB: Gasto fijo encontrado:', expense)
        if (expense) {
          const updatedExpense = { ...expense, ...updates }
          console.log('DB: Gasto fijo actualizado:', updatedExpense)
          const putRequest = store.put(updatedExpense)
          putRequest.onerror = () => {
            console.error('DB: Error en put:', putRequest.error)
            reject(putRequest.error)
          }
          putRequest.onsuccess = () => {
            console.log('DB: Gasto fijo guardado exitosamente')
            resolve(updatedExpense)
          }
        } else {
          console.error('DB: Gasto fijo no encontrado con ID:', id)
          reject(new Error('Gasto fijo no encontrado'))
        }
      }
      getRequest.onerror = () => {
        console.error('DB: Error en get:', getRequest.error)
        reject(getRequest.error)
      }
    })
  }

  async deleteFixedExpense(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FIXED_EXPENSES_STORE], 'readwrite')
      const store = transaction.objectStore(FIXED_EXPENSES_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// Instancia singleton
export const db = new DatabaseService() 

// Funciones para Patrimonio
export async function getAllPatrimony(): Promise<PatrimonyItem[]> {
  const db = await getDB()
  const transaction = db.transaction([PATRIMONY_STORE], 'readonly')
  const store = transaction.objectStore(PATRIMONY_STORE)
  
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addPatrimonyItem(item: Omit<PatrimonyItem, 'id' | 'lastUpdate'>): Promise<PatrimonyItem> {
  const db = await getDB()
  const transaction = db.transaction([PATRIMONY_STORE], 'readwrite')
  const store = transaction.objectStore(PATRIMONY_STORE)
  
  const newItem: PatrimonyItem = {
    ...item,
    id: Date.now().toString(),
    lastUpdate: new Date().toISOString()
  }
  
  return new Promise((resolve, reject) => {
    const request = store.add(newItem)
    request.onsuccess = () => resolve(newItem)
    request.onerror = () => reject(request.error)
  })
}

export async function updatePatrimonyItem(id: string, updates: Partial<Omit<PatrimonyItem, 'id'>>): Promise<PatrimonyItem> {
  const db = await getDB()
  const transaction = db.transaction([PATRIMONY_STORE], 'readwrite')
  const store = transaction.objectStore(PATRIMONY_STORE)
  
  return new Promise((resolve, reject) => {
    const getRequest = store.get(id)
    getRequest.onsuccess = () => {
      const item = getRequest.result
      if (!item) {
        reject(new Error('Item not found'))
        return
      }
      
      const updatedItem: PatrimonyItem = {
        ...item,
        ...updates,
        id, // Mantener el ID original
        lastUpdate: new Date().toISOString()
      }
      
      const putRequest = store.put(updatedItem)
      putRequest.onsuccess = () => resolve(updatedItem)
      putRequest.onerror = () => reject(putRequest.error)
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

export async function deletePatrimonyItem(id: string): Promise<void> {
  const db = await getDB()
  const transaction = db.transaction([PATRIMONY_STORE], 'readwrite')
  const store = transaction.objectStore(PATRIMONY_STORE)
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getPatrimonyTotal(): Promise<number> {
  const items = await getAllPatrimony()
  return items.reduce((total, item) => total + item.currentValue, 0)
}

export async function getPatrimonyByCategory(): Promise<{ [category: string]: number }> {
  const items = await getAllPatrimony()
  return items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.currentValue
    return acc
  }, {} as { [category: string]: number })
} 

// Funciones para Historial de Patrimonio
export async function savePatrimonySnapshot(period: 'monthly' | 'quarterly' | 'semiannual' | 'annual'): Promise<PatrimonyHistory> {
  try {
    const items = await getAllPatrimony()
    const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0)
    const totalPurchaseValue = items.reduce((sum, item) => sum + item.purchaseValue, 0)
    const totalVariation = totalValue - totalPurchaseValue
    const totalVariationPercentage = totalPurchaseValue > 0 ? (totalVariation / totalPurchaseValue) * 100 : 0
    
    // Verificar si ya existe un snapshot para este período en el mismo día
    const today = new Date()
    const todayString = today.toISOString().split('T')[0] // Solo la fecha, sin hora
    
    const existingHistory = await getPatrimonyHistory(period, 100)
    const todaySnapshot = existingHistory.find(h => {
      const snapshotDate = new Date(h.date).toISOString().split('T')[0]
      return snapshotDate === todayString
    })
    
    if (todaySnapshot) {
      console.log(`Ya existe un snapshot para ${period} hoy, actualizando...`)
      // Actualizar el snapshot existente
      const updatedSnapshot: PatrimonyHistory = {
        ...todaySnapshot,
        totalValue,
        totalPurchaseValue,
        totalVariation,
        totalVariationPercentage,
        itemsCount: items.length,
        date: new Date().toISOString()
      }
      
      const db = await getDB()
      const transaction = db.transaction([PATRIMONY_HISTORY_STORE], 'readwrite')
      const store = transaction.objectStore(PATRIMONY_HISTORY_STORE)
      
      return new Promise((resolve, reject) => {
        const request = store.put(updatedSnapshot)
        request.onsuccess = () => resolve(updatedSnapshot)
        request.onerror = () => reject(request.error)
      })
    }
    
    // Crear nuevo snapshot
    const snapshot: PatrimonyHistory = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // ID más único
      date: new Date().toISOString(),
      totalValue,
      totalPurchaseValue,
      totalVariation,
      totalVariationPercentage,
      itemsCount: items.length,
      period
    }
    
    const db = await getDB()
    const transaction = db.transaction([PATRIMONY_HISTORY_STORE], 'readwrite')
    const store = transaction.objectStore(PATRIMONY_HISTORY_STORE)
    
    return new Promise((resolve, reject) => {
      const request = store.add(snapshot)
      request.onsuccess = () => resolve(snapshot)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error guardando snapshot de patrimonio:', error)
    throw error
  }
}

export async function getPatrimonyHistory(period: 'monthly' | 'quarterly' | 'semiannual' | 'annual', limit: number = 12): Promise<PatrimonyHistory[]> {
  const db = await getDB()
  const transaction = db.transaction([PATRIMONY_HISTORY_STORE], 'readonly')
  const store = transaction.objectStore(PATRIMONY_HISTORY_STORE)
  
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => {
      const allHistory = request.result
      const filteredHistory = allHistory
        .filter((item: PatrimonyHistory) => item.period === period)
        .sort((a: PatrimonyHistory, b: PatrimonyHistory) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)
      resolve(filteredHistory)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function calculateGrowthRate(period: 'monthly' | 'quarterly' | 'semiannual' | 'annual'): Promise<{
  currentValue: number
  previousValue: number
  growthAmount: number
  growthPercentage: number
  period: string
}> {
  const history = await getPatrimonyHistory(period, 2)
  
  if (history.length < 2) {
    return {
      currentValue: 0,
      previousValue: 0,
      growthAmount: 0,
      growthPercentage: 0,
      period: getPeriodLabel(period)
    }
  }
  
  const current = history[0]
  const previous = history[1]
  
  const growthAmount = current.totalValue - previous.totalValue
  const growthPercentage = previous.totalValue > 0 ? (growthAmount / previous.totalValue) * 100 : 0
  
  return {
    currentValue: current.totalValue,
    previousValue: previous.totalValue,
    growthAmount,
    growthPercentage,
    period: getPeriodLabel(period)
  }
}

function getPeriodLabel(period: 'monthly' | 'quarterly' | 'semiannual' | 'annual'): string {
  switch (period) {
    case 'monthly': return 'Mensual'
    case 'quarterly': return 'Trimestral'
    case 'semiannual': return 'Semestral'
    case 'annual': return 'Anual'
    default: return 'Mensual'
  }
}

export async function getNewAssetsInPeriod(period: 'monthly' | 'quarterly' | 'semiannual' | 'annual'): Promise<{
  newAssetsValue: number
  newAssetsCount: number
  period: string
}> {
  const history = await getPatrimonyHistory(period, 2)
  
  if (history.length < 2) {
    return {
      newAssetsValue: 0,
      newAssetsCount: 0,
      period: getPeriodLabel(period)
    }
  }
  
  const current = history[0]
  const previous = history[1]
  
  // Estimación de nuevos activos basada en el incremento de valor de compra
  const newAssetsValue = Math.max(0, current.totalPurchaseValue - previous.totalPurchaseValue)
  const newAssetsCount = Math.max(0, current.itemsCount - previous.itemsCount)
  
  return {
    newAssetsValue,
    newAssetsCount,
    period: getPeriodLabel(period)
  }
}

// Función helper para obtener la base de datos
async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Crear store de transacciones si no existe
      if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
        const transactionsStore = db.createObjectStore(TRANSACTIONS_STORE, { keyPath: 'id', autoIncrement: true })
        transactionsStore.createIndex('type', 'type', { unique: false })
        transactionsStore.createIndex('date', 'date', { unique: false })
        transactionsStore.createIndex('category', 'category', { unique: false })
      }

      // Crear store de gastos fijos si no existe
      if (!db.objectStoreNames.contains(FIXED_EXPENSES_STORE)) {
        const fixedExpensesStore = db.createObjectStore(FIXED_EXPENSES_STORE, { keyPath: 'id' })
        fixedExpensesStore.createIndex('isPaid', 'isPaid', { unique: false })
        fixedExpensesStore.createIndex('category', 'category', { unique: false })
        fixedExpensesStore.createIndex('dueDate', 'dueDate', { unique: false })
      }

      // Crear store de patrimonio si no existe
      if (!db.objectStoreNames.contains(PATRIMONY_STORE)) {
        const patrimonyStore = db.createObjectStore(PATRIMONY_STORE, { keyPath: 'id' })
        patrimonyStore.createIndex('category', 'category', { unique: false })
        patrimonyStore.createIndex('lastUpdate', 'lastUpdate', { unique: false })
      }

      // Crear store de historial de patrimonio si no existe
      if (!db.objectStoreNames.contains(PATRIMONY_HISTORY_STORE)) {
        const patrimonyHistoryStore = db.createObjectStore(PATRIMONY_HISTORY_STORE, { keyPath: 'id' })
        patrimonyHistoryStore.createIndex('date', 'date', { unique: false })
        patrimonyHistoryStore.createIndex('period', 'period', { unique: false })
      }
    }
  })
} 

// Función para exportar todos los datos como JSON
export async function exportAllData(): Promise<{
  transactions: Transaction[]
  fixedExpenses: FixedExpense[]
  patrimony: PatrimonyItem[]
  patrimonyHistory: PatrimonyHistory[]
  exportDate: string
  version: string
}> {
  try {
    const transactions = await db.getAllTransactions()
    const fixedExpenses = await db.getAllFixedExpenses()
    const patrimony = await getAllPatrimony()
    
    // Obtener todo el historial y filtrar duplicados
    const allHistory = await getPatrimonyHistory('monthly', 1000)
    const uniqueHistory = allHistory.filter((history, index, self) => {
      const key = `${history.date}_${history.period}`
      return index === self.findIndex(h => `${h.date}_${h.period}` === key)
    })
    
    console.log(`Exportando ${allHistory.length} registros de historial, ${uniqueHistory.length} únicos`)
    
    const exportData = {
      transactions,
      fixedExpenses,
      patrimony,
      patrimonyHistory: uniqueHistory,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    return exportData
  } catch (error) {
    console.error('Error exportando datos:', error)
    throw error
  }
}

// Función para importar datos desde JSON
export async function importAllData(data: {
  transactions: Transaction[]
  fixedExpenses: FixedExpense[]
  patrimony: PatrimonyItem[]
  patrimonyHistory: PatrimonyHistory[]
}): Promise<void> {
  try {
    console.log('Iniciando importación de datos...')
    
    // Limpiar datos existentes de forma forzada
    await db.forceClearDatabase()
    console.log('Base de datos limpiada completamente')
    
      // Importar transacciones con nuevos IDs
  console.log(`Importando ${data.transactions.length} transacciones...`)
  for (const transaction of data.transactions) {
    // Crear nueva transacción sin ID para que se genere automáticamente
    const { id, ...transactionWithoutId } = transaction
    await db.addTransaction(transactionWithoutId)
  }
  console.log('Transacciones importadas')
    
      // Importar gastos fijos con nuevos IDs
  console.log(`Importando ${data.fixedExpenses.length} gastos fijos...`)
  for (const expense of data.fixedExpenses) {
    // Crear nuevo gasto fijo sin ID para que se genere automáticamente
    const { id, ...expenseWithoutId } = expense
    await db.addFixedExpense(expenseWithoutId)
  }
  console.log('Gastos fijos importados')
  
  // Importar patrimonio con nuevos IDs
  console.log(`Importando ${data.patrimony.length} items de patrimonio...`)
  for (const item of data.patrimony) {
    // Crear nuevo item de patrimonio sin ID para que se genere automáticamente
    const { id, ...itemWithoutId } = item
    await addPatrimonyItem(itemWithoutId)
  }
  console.log('Patrimonio importado')
    
    // Importar historial de patrimonio con manejo robusto de errores
    console.log(`Importando ${data.patrimonyHistory.length} registros de historial...`)
    const dbInstance = await getDB()
    
    // Filtrar registros duplicados basándose en fecha y período
    const uniqueHistory = data.patrimonyHistory.filter((history, index, self) => {
      const key = `${history.date}_${history.period}`
      return index === self.findIndex(h => `${h.date}_${h.period}` === key)
    })
    
    console.log(`Registros únicos de historial: ${uniqueHistory.length}`)
    
         // Importar historial con manejo de errores individual
     let importedCount = 0
     for (const history of uniqueHistory) {
       try {
         const transaction = dbInstance.transaction([PATRIMONY_HISTORY_STORE], 'readwrite')
         const store = transaction.objectStore(PATRIMONY_HISTORY_STORE)
         
         // Generar un nuevo ID único con timestamp más específico
         const timestamp = Date.now() + Math.random()
         const historyWithNewId = {
           ...history,
           id: timestamp.toString() + Math.random().toString(36).substr(2, 9)
         }
         
         await new Promise((resolve, reject) => {
           const request = store.add(historyWithNewId)
           request.onsuccess = () => {
             importedCount++
             resolve(undefined)
           }
           request.onerror = (event) => {
             console.error('Error importando registro de historial:', event)
             // Si hay error de clave duplicada, intentar con otro ID
             if (request.error?.name === 'ConstraintError') {
               console.log('Clave duplicada detectada, intentando con nuevo ID...')
               const retryHistory = {
                 ...history,
                 id: (Date.now() + Math.random() * 1000).toString() + Math.random().toString(36).substr(2, 9)
               }
               const retryRequest = store.add(retryHistory)
               retryRequest.onsuccess = () => {
                 importedCount++
                 resolve(undefined)
               }
               retryRequest.onerror = () => {
                 console.error('Error en retry:', retryRequest.error)
                 // Si falla el retry, simplemente continuar
                 resolve(undefined)
               }
             } else {
               console.error('Error no relacionado con clave duplicada:', request.error)
               // Si no es un error de clave duplicada, continuar
               resolve(undefined)
             }
           }
           transaction.onerror = () => {
             console.error('Error en transacción:', transaction.error)
             // Si hay error en la transacción, continuar
             resolve(undefined)
           }
         })
       } catch (error) {
         console.error(`Error importando registro de historial ${importedCount + 1}:`, error)
         // Continuar con el siguiente registro en lugar de fallar completamente
       }
     }
    console.log(`Historial importado: ${importedCount}/${uniqueHistory.length} registros`)
    
    console.log('Datos importados exitosamente')
  } catch (error) {
    console.error('Error importando datos:', error)
    throw error
  }
} 
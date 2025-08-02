'use client'

import { useState, useEffect } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  Plus,
  Minus,
  Database,
  Cloud,
  Smartphone,
  Settings,
  Building2,
  Download
} from 'lucide-react'
import BalanceCard from '@/components/BalanceCard'
import TransactionList from '@/components/TransactionList'
import AddTransactionModal from '@/components/AddTransactionModal'
import AdjustBalanceModal from '@/components/AdjustBalanceModal'
import TransferModal from '@/components/TransferModal'
import DataBackupModal from '@/components/DataBackupModal'
import ExpenseChart from '@/components/ExpenseChart'
import StorageInfo from '@/components/StorageInfo'
import GoogleDriveSync from '@/components/GoogleDriveSync'
import GoogleCredentialsStatus from '@/components/GoogleCredentialsStatus'

import FixedExpensesWidget from '@/components/FixedExpensesWidget'
import PatrimonyWidget from '@/components/PatrimonyWidget'
import PatrimonyGrowthWidget from '@/components/PatrimonyGrowthWidget'
import { db, getPatrimonyTotal } from '@/lib/database'
import { useGoogleAuth } from '@/components/GoogleAuthProvider'

export default function Dashboard() {
  const { isAuthenticated, isInitializing, isRedirecting, authMode } = useGoogleAuth()
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [savings, setSavings] = useState(0)
  const [patrimonyTotal, setPatrimonyTotal] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'cash' | 'banks'>('cash')
  const [cashBalance, setCashBalance] = useState(0)
  const [banksBalance, setBanksBalance] = useState(0)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferType, setTransferType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [showBackupModal, setShowBackupModal] = useState(false)

  useEffect(() => {
    // Solo cargar transacciones si está autenticado
    if (isAuthenticated) {
      loadTransactions()
      loadPatrimony()
    }
  }, [isAuthenticated])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      // Migrar datos de localStorage si existen
      await db.migrateFromLocalStorage()
      
      // Cargar transacciones de IndexedDB
      const loadedTransactions = await db.getAllTransactions()
      setTransactions(loadedTransactions)
      calculateTotals(loadedTransactions)
    } catch (error) {
      console.error('Error cargando transacciones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPatrimony = async () => {
    try {
      const total = await getPatrimonyTotal()
      setPatrimonyTotal(total)
    } catch (error) {
      console.error('Error cargando patrimonio:', error)
    }
  }

  const calculateTotals = (transactions: any[]) => {
    // Solo contar ingresos y gastos reales (excluir transferencias)
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.category !== 'Transferencia')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && t.category !== 'Transferencia')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalSavings = transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0)
    
    // Calcular balances por tipo de cuenta (incluir transferencias)
    const cashTransactions = transactions.filter(t => t.accountType === 'cash')
    const banksTransactions = transactions.filter(t => t.accountType === 'banks')
    
    const cashBalance = cashTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) -
      cashTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    
    const banksBalance = banksTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) -
      banksTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    
    setIncome(totalIncome)
    setExpenses(totalExpenses)
    setSavings(totalSavings)
    setCashBalance(cashBalance)
    setBanksBalance(banksBalance)
    setBalance(cashBalance + banksBalance)
  }

  const addTransaction = async (transaction: any) => {
    try {
      const newTransaction = await db.addTransaction(transaction)
      const newTransactions = [newTransaction, ...transactions]
      setTransactions(newTransactions)
      calculateTotals(newTransactions)
      setShowModal(false)
    } catch (error) {
      console.error('Error agregando transacción:', error)
    }
  }

  const adjustBalance = async (amount: number, description: string) => {
    try {
      // Crear una transacción de ajuste
      const adjustmentTransaction = {
        description,
        amount: Math.abs(amount),
        type: (amount > 0 ? 'income' : 'expense') as 'income' | 'expense',
        category: 'Ajuste',
        date: new Date().toISOString(),
        accountType: 'cash' as 'cash'
      }
      
      const newTransaction = await db.addTransaction(adjustmentTransaction)
      const newTransactions = [newTransaction, ...transactions]
      setTransactions(newTransactions)
      calculateTotals(newTransactions)
    } catch (error) {
      console.error('Error ajustando balance:', error)
    }
  }

  const handleTransfer = async (amount: number, description: string) => {
    try {
      if (transferType === 'deposit') {
        // Consignación: Cash -> Banks
        const cashTransaction = {
          description: `Consignación: ${description}`,
          amount: amount,
          type: 'expense' as 'expense',
          category: 'Transferencia',
          date: new Date().toISOString(),
          accountType: 'cash' as 'cash'
        }
        
        const banksTransaction = {
          description: `Consignación: ${description}`,
          amount: amount,
          type: 'income' as 'income',
          category: 'Transferencia',
          date: new Date().toISOString(),
          accountType: 'banks' as 'banks'
        }

        await db.addTransaction(cashTransaction)
        await db.addTransaction(banksTransaction)
      } else {
        // Retiro: Banks -> Cash
        const banksTransaction = {
          description: `Retiro: ${description}`,
          amount: amount,
          type: 'expense' as 'expense',
          category: 'Transferencia',
          date: new Date().toISOString(),
          accountType: 'banks' as 'banks'
        }
        
        const cashTransaction = {
          description: `Retiro: ${description}`,
          amount: amount,
          type: 'income' as 'income',
          category: 'Transferencia',
          date: new Date().toISOString(),
          accountType: 'cash' as 'cash'
        }

        await db.addTransaction(banksTransaction)
        await db.addTransaction(cashTransaction)
      }

      await loadTransactions()
      setShowTransferModal(false)
    } catch (error) {
      console.error('Error en transferencia:', error)
    }
  }

  const onDelete = async (id: number) => {
    try {
      await db.deleteTransaction(id)
      const newTransactions = transactions.filter(t => t.id !== id)
      setTransactions(newTransactions)
      calculateTotals(newTransactions)
    } catch (error) {
      console.error('Error eliminando transacción:', error)
    }
  }

  // No mostrar el dashboard si aún se está inicializando, redirigiendo o no está autenticado
  if (isInitializing || isRedirecting || !isAuthenticated) {
    return null // El GoogleAuthScreen se encargará de mostrar la UI apropiada
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </div>
    )
  }

  const getAuthModeIcon = () => {
    switch (authMode) {
      case 'local':
        return <Database className="h-4 w-4 text-green-600" />
      case 'google':
        return <Cloud className="h-4 w-4 text-blue-600" />
      case 'hybrid':
        return <Smartphone className="h-4 w-4 text-purple-600" />
      default:
        return <Database className="h-4 w-4 text-gray-600" />
    }
  }

  const getAuthModeText = () => {
    switch (authMode) {
      case 'local':
        return 'Modo Local'
      case 'google':
        return 'Google Drive'
      case 'hybrid':
        return 'Modo Híbrido'
      default:
        return 'Desconocido'
    }
  }

  const getAuthModeColor = () => {
    switch (authMode) {
      case 'local':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'google':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'hybrid':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header con información del modo */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getAuthModeColor()}`}>
            {getAuthModeIcon()}
            <span className="text-sm font-medium">{getAuthModeText()}</span>
          </div>
        </div>
        
        {authMode === 'local' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-700">
              <strong>Modo Local:</strong> Tus datos se guardan solo en tu dispositivo. 
              Rápido y privado, pero no se sincronizan con otros dispositivos.
            </p>
          </div>
        )}
        
        {authMode === 'google' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Google Drive:</strong> Tus datos se sincronizan con Google Drive. 
              Puedes acceder desde cualquier dispositivo conectado a tu cuenta de Google.
            </p>
          </div>
        )}
        
        {authMode === 'hybrid' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-700">
              <strong>Modo Híbrido:</strong> Funciona offline y puedes sincronizar cuando quieras. 
              Combina la velocidad del modo local con la flexibilidad de la sincronización.
            </p>
          </div>
        )}
      </div>

      {/* Tarjetas de balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="relative">
          <BalanceCard
            title="Balance Total"
            amount={balance}
            icon={Wallet}
            color={balance >= 0 ? 'success' : 'danger'}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={() => setShowBackupModal(true)}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Backup de datos"
            >
              <Download className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Ajustar balance"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
        <BalanceCard
          title="Ingresos"
          amount={income}
          icon={TrendingUp}
          color="success"
        />
        <BalanceCard
          title="Gastos"
          amount={expenses}
          icon={TrendingDown}
          color="danger"
        />
        <BalanceCard
          title="Ahorros"
          amount={savings}
          icon={PiggyBank}
          color="success"
        />
        <BalanceCard
          title="Patrimonio"
          amount={patrimonyTotal}
          icon={Building2}
          color="primary"
        />
      </div>

      {/* Subpestañas Cash y Banks - pegadas debajo del balance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('cash')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'cash' 
                ? 'text-gray-700 bg-white shadow-sm border border-gray-200' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cash: ${cashBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </button>
          <button 
            onClick={() => setActiveTab('banks')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'banks' 
                ? 'text-gray-700 bg-white shadow-sm border border-gray-200' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Banks: ${banksBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </button>
        </div>
        
        {/* Botones de transferencia */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              setTransferType('deposit')
              setShowTransferModal(true)
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
          >
            💰 Consignar
          </button>
          <button
            onClick={() => {
              setTransferType('withdrawal')
              setShowTransferModal(true)
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
          >
            🏧 Retirar
          </button>
        </div>
      </div>

      {/* Widgets principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Transacciones Recientes</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar</span>
              </button>
            </div>
            <TransactionList 
              transactions={transactions.slice(-5)} 
              onDelete={onDelete}
            />
          </div>
        </div>
        <div className="space-y-6">
          <FixedExpensesWidget />
          <PatrimonyWidget />
          <PatrimonyGrowthWidget />
        </div>
      </div>

      {/* Gráficos y widgets adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gastos por Categoría</h2>
          <ExpenseChart transactions={transactions} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Almacenamiento</h2>
          <StorageInfo />
        </div>
      </div>

      {/* Componentes de Google Drive (solo mostrar si está en modo Google o Híbrido) */}
      {(authMode === 'google' || authMode === 'hybrid') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sincronización Google Drive</h2>
            <GoogleDriveSync 
              transactions={transactions}
              onSync={(syncedTransactions) => {
                setTransactions(syncedTransactions)
                calculateTotals(syncedTransactions)
              }}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de Credenciales</h2>
            <GoogleCredentialsStatus />
          </div>
        </div>
      )}



      {/* Modal para agregar transacción */}
      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addTransaction}
      />

      {/* Modal para ajustar balance */}
      <AdjustBalanceModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onAdjust={adjustBalance}
        currentBalance={balance}
      />

                {/* Modal para transferencias */}
          <TransferModal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            onTransfer={handleTransfer}
            transferType={transferType}
            cashBalance={cashBalance}
            banksBalance={banksBalance}
          />

          {/* Modal para backup de datos */}
          <DataBackupModal
            isOpen={showBackupModal}
            onClose={() => setShowBackupModal(false)}
            onDataChange={() => {
              loadTransactions()
              loadPatrimony()
            }}
          />
        </div>
      )
    } 
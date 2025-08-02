'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudOff, RefreshCw, Download, Upload } from 'lucide-react'
import { googleDrive } from '@/lib/googleDrive'

interface GoogleDriveSyncProps {
  transactions: any[]
  onSync: (transactions: any[]) => void
}

export default function GoogleDriveSync({ transactions, onSync }: GoogleDriveSyncProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<'not-authenticated' | 'authenticating' | 'authenticated' | 'error'>('not-authenticated')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setAuthStatus('authenticating')
      const connected = await googleDrive.checkConnection()
      setIsConnected(connected)
      
      if (connected) {
        setAuthStatus('authenticated')
        const info = await googleDrive.getFileInfo()
        setFileInfo(info)
        setLastSync(info?.lastModified || null)
      } else {
        setAuthStatus('not-authenticated')
      }
    } catch (error) {
      console.error('Error verificando conexión:', error)
      setIsConnected(false)
      setAuthStatus('error')
    }
  }

  const connectToGoogleDrive = async () => {
    try {
      setIsLoading(true)
      setAuthStatus('authenticating')
      console.log('🔄 Iniciando conexión con Google Drive...')
      
      const success = await googleDrive.init()
      setIsConnected(success)
      
      if (success) {
        console.log('✅ Conexión exitosa con Google Drive')
        setAuthStatus('authenticated')
        await checkConnection()
        // Sincronizar datos existentes
        await syncData()
      } else {
        console.log('❌ Falló la conexión con Google Drive')
        setAuthStatus('error')
      }
    } catch (error) {
      console.error('❌ Error conectando a Google Drive:', error)
      setAuthStatus('error')
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'Error conectando a Google Drive.'
      
      if (error instanceof Error) {
        if (error.message.includes('API Key')) {
          errorMessage = 'Google API Key no configurada. Verifica el archivo .env.local'
        } else if (error.message.includes('Client ID')) {
          errorMessage = 'Google Client ID no configurado. Verifica el archivo .env.local'
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de red. Verifica tu conexión a internet'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const syncData = async () => {
    try {
      setIsLoading(true)
      const syncedTransactions = await googleDrive.syncData(transactions)
      onSync(syncedTransactions)
      await checkConnection()
    } catch (error) {
      console.error('Error sincronizando datos:', error)
      alert('Error sincronizando datos. Verifica tu conexión.')
    } finally {
      setIsLoading(false)
    }
  }

  const uploadToDrive = async () => {
    try {
      setIsLoading(true)
      await googleDrive.saveData(transactions)
      await checkConnection()
      alert('Datos subidos a Google Drive correctamente')
    } catch (error) {
      console.error('Error subiendo datos:', error)
      alert('Error subiendo datos a Google Drive')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFromDrive = async () => {
    try {
      setIsLoading(true)
      const driveTransactions = await googleDrive.loadData()
      onSync(driveTransactions)
      await checkConnection()
      alert('Datos descargados de Google Drive correctamente')
    } catch (error) {
      console.error('Error descargando datos:', error)
      alert('Error descargando datos de Google Drive')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sincronización con Google Drive</h3>
        <div className="flex items-center gap-2">
          {authStatus === 'authenticated' ? (
            <Cloud className="h-5 w-5 text-green-600" />
          ) : authStatus === 'authenticating' ? (
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
          ) : authStatus === 'error' ? (
            <CloudOff className="h-5 w-5 text-red-500" />
          ) : (
            <CloudOff className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {authStatus === 'not-authenticated' ? (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              <strong>🔐 Autenticación requerida:</strong> Para sincronizar tus datos con Google Drive, necesitas autenticarte con tu cuenta de Google.
            </p>
            <p className="text-xs text-blue-600">
              • Tus datos se guardarán en un archivo privado en tu Google Drive<br/>
              • Solo tú tendrás acceso a estos datos<br/>
              • La sincronización es automática y segura
            </p>
          </div>
          <button
            onClick={connectToGoogleDrive}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2 w-full"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            {isLoading ? 'Conectando...' : 'Conectar con Google Drive'}
          </button>
        </div>
      ) : authStatus === 'authenticating' ? (
        <div className="space-y-4">
          <div className="text-center py-4">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Autenticando con Google Drive...</p>
            <p className="text-xs text-gray-500 mt-1">Se abrirá una ventana de Google para autorizar la aplicación</p>
          </div>
        </div>
      ) : authStatus === 'error' ? (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700 mb-2">
              <strong>❌ Error de conexión:</strong> No se pudo conectar con Google Drive.
            </p>
            <p className="text-xs text-red-600">
              • Verifica tu conexión a internet<br/>
              • Asegúrate de que las credenciales de Google estén configuradas<br/>
              • Revisa que el archivo .env.local tenga las claves correctas
            </p>
          </div>
          <button
            onClick={connectToGoogleDrive}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2 w-full"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar Conexión
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={uploadToDrive}
              disabled={isLoading}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Subir a Drive
            </button>
            <button
              onClick={downloadFromDrive}
              disabled={isLoading}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar de Drive
            </button>
          </div>

          <button
            onClick={syncData}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2 w-full"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sincronizar Datos
          </button>

          {fileInfo && (
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Archivo:</strong> libertad-financiera-data.json</p>
              <p><strong>Tamaño:</strong> {(fileInfo.size / 1024).toFixed(1)} KB</p>
              {lastSync && (
                <p><strong>Última sincronización:</strong> {new Date(lastSync).toLocaleString()}</p>
              )}
            </div>
          )}

          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700">
              <strong>✅ Autenticado y conectado:</strong> Tu cuenta de Google Drive está autenticada y tus datos se sincronizan automáticamente.
              Puedes acceder a ellos desde cualquier dispositivo.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 
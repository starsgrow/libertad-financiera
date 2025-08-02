'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react'

export default function GoogleCredentialsStatus() {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'missing' | 'invalid'>('checking')
  const [clientIdStatus, setClientIdStatus] = useState<'checking' | 'valid' | 'missing' | 'invalid'>('checking')

  useEffect(() => {
    checkCredentials()
  }, [])

  const checkCredentials = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    // Verificar API Key
    if (!apiKey || apiKey === 'your-google-api-key') {
      setApiKeyStatus('missing')
    } else if (apiKey.length < 20) {
      setApiKeyStatus('invalid')
    } else {
      setApiKeyStatus('valid')
    }

    // Verificar Client ID
    if (!clientId || clientId === 'your-google-client-id') {
      setClientIdStatus('missing')
    } else if (!clientId.includes('.apps.googleusercontent.com')) {
      setClientIdStatus('invalid')
    } else {
      setClientIdStatus('valid')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Settings className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Configurado correctamente'
      case 'missing':
        return 'No configurado'
      case 'invalid':
        return 'Formato inválido'
      default:
        return 'Verificando...'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'missing':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'invalid':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const allValid = apiKeyStatus === 'valid' && clientIdStatus === 'valid'

  return (
    <div className="card bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Estado de Credenciales Google</h3>
        {allValid ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        )}
      </div>

      <div className="space-y-3">
        <div className={`p-3 rounded-lg border ${getStatusColor(apiKeyStatus)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Google API Key</p>
              <p className="text-xs opacity-75">{getStatusText(apiKeyStatus)}</p>
            </div>
            {getStatusIcon(apiKeyStatus)}
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${getStatusColor(clientIdStatus)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Google Client ID</p>
              <p className="text-xs opacity-75">{getStatusText(clientIdStatus)}</p>
            </div>
            {getStatusIcon(clientIdStatus)}
          </div>
        </div>

        {!allValid && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-2">
              <strong>📝 Configuración requerida:</strong> Para usar Google Drive, necesitas configurar las credenciales.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p><strong>1.</strong> Ve a <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
              <p><strong>2.</strong> Crea un proyecto y habilita Google Drive API</p>
              <p><strong>3.</strong> Crea credenciales (API Key y OAuth 2.0 Client ID)</p>
              <p><strong>4.</strong> Agrega las credenciales en el archivo <code className="bg-blue-100 px-1 rounded">.env.local</code></p>
            </div>
          </div>
        )}

        {allValid && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              <strong>✅ Credenciales configuradas:</strong> Todas las credenciales de Google están correctamente configuradas.
              Puedes proceder con la autenticación de Google Drive.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Loader2, Shield, AlertTriangle, CheckCircle, Database, Cloud, Smartphone } from 'lucide-react'
import { googleDrive } from '@/lib/googleDrive'

type AuthMode = 'local' | 'google' | 'hybrid'

interface GoogleAuthContextType {
  isAuthenticated: boolean
  isInitializing: boolean
  isRedirecting: boolean
  authMode: AuthMode
  error: string | null
  authenticate: (mode: AuthMode) => Promise<void>
  setAuthMode: (mode: AuthMode) => void
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined)

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext)
  if (!context) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider')
  }
  return context
}

interface GoogleAuthProviderProps {
  children: React.ReactNode
}

export default function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('local')
  const [error, setError] = useState<string | null>(null)

  const authenticate = async (mode: AuthMode) => {
    try {
      setIsInitializing(true)
      setError(null)
      setAuthMode(mode)
      
      console.log(`🔐 Iniciando autenticación en modo: ${mode}`)
      
      if (mode === 'local') {
        // Modo local: solo usar IndexedDB
        console.log('✅ Modo local activado')
        setIsAuthenticated(true)
      } else if (mode === 'google') {
        // Modo Google: conectar con Google Drive
        await googleDrive.init()
        console.log('✅ Autenticación con Google Drive exitosa')
        setIsAuthenticated(true)
      } else if (mode === 'hybrid') {
        // Modo híbrido: local por defecto, con opción de sincronizar
        console.log('✅ Modo híbrido activado')
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error('❌ Error en autenticación:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      
      // Si es un error de redirección, marcar como redirigiendo
      if (errorMessage.includes('Redirigiendo a Google')) {
        console.log('🔄 Redirigiendo a Google para autenticación...')
        setIsRedirecting(true)
        return
      }
      
      setError(errorMessage)
      setIsAuthenticated(false)
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    // Verificar si hay un token en la URL (después del redirect)
    const hash = window.location.hash.substring(1)
    const urlParams = new URLSearchParams(hash)
    const accessToken = urlParams.get('access_token')
    const error = urlParams.get('error')

    if (accessToken || error) {
      // Hay un token o error en la URL, intentar autenticación con Google
      authenticate('google')
    }
    // Si no hay token, no hacer nada automáticamente - el usuario debe seleccionar
  }, [])

  const value: GoogleAuthContextType = {
    isAuthenticated,
    isInitializing,
    isRedirecting,
    authMode,
    error,
    authenticate,
    setAuthMode
  }

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  )
}

// Componente de selección de modo de autenticación
export function AuthModeSelector() {
  const { authenticate, isInitializing, isRedirecting, error } = useGoogleAuth()

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="mb-6">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Libertad Financiera
            </h1>
            <p className="text-gray-600">
              Inicializando...
            </p>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="mb-6">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Libertad Financiera
            </h1>
            <p className="text-gray-600">
              Redirigiendo a Google...
            </p>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Abriendo página de Google...</p>
            <p>• Esperando autenticación...</p>
            <p>• Redirigiendo de vuelta...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error de Conexión
            </h1>
            <p className="text-gray-600 mb-4">
              No se pudo conectar con Google Drive
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 mb-2">
              <strong>Error:</strong>
            </p>
            <p className="text-xs text-red-600">
              {error}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => authenticate('google')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Reintentar Conexión
            </button>
            
            <button
              onClick={() => authenticate('local')}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Usar Modo Local
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
        <div className="mb-8">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Libertad Financiera
          </h1>
          <p className="text-gray-600">
            Selecciona cómo quieres usar la aplicación
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Modo Local */}
          <button
            onClick={() => authenticate('local')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Database className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Modo Local
                </h3>
                <p className="text-sm text-gray-600">
                  Tus datos se guardan solo en tu dispositivo. Rápido y privado.
                </p>
              </div>
            </div>
          </button>

          {/* Modo Google Drive */}
          <button
            onClick={() => authenticate('google')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Cloud className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Con Google Drive
                </h3>
                <p className="text-sm text-gray-600">
                  Sincroniza tus datos con Google Drive. Accede desde cualquier dispositivo.
                </p>
              </div>
            </div>
          </button>

          {/* Modo Híbrido */}
          <button
            onClick={() => authenticate('hybrid')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Smartphone className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Modo Híbrido
                </h3>
                <p className="text-sm text-gray-600">
                  Funciona offline y puedes sincronizar cuando quieras.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-xs text-gray-500 space-y-1">
          <p><strong>Recomendación:</strong></p>
          <p>• <strong>Modo Local:</strong> Para uso personal y privado</p>
          <p>• <strong>Google Drive:</strong> Para sincronización entre dispositivos</p>
          <p>• <strong>Híbrido:</strong> Para máxima flexibilidad</p>
        </div>
      </div>
    </div>
  )
}

// Componente de pantalla de carga/autenticación (mantiene compatibilidad)
export function GoogleAuthScreen() {
  const { isAuthenticated, isInitializing, isRedirecting, error } = useGoogleAuth()

  // Si está autenticado, no mostrar nada
  if (isAuthenticated) {
    return null
  }

  // Si está inicializando o redirigiendo, mostrar pantalla de carga
  if (isInitializing || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="mb-6">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Libertad Financiera
            </h1>
            <p className="text-gray-600">
              {isRedirecting ? 'Redirigiendo a Google...' : 'Conectando...'}
            </p>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  // Si hay error, mostrar pantalla de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error de Conexión
            </h1>
            <p className="text-gray-600 mb-4">
              No se pudo conectar con Google Drive
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 mb-2">
              <strong>Error:</strong>
            </p>
            <p className="text-xs text-red-600">
              {error}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Si no está autenticado y no hay errores, mostrar selector de modo
  return <AuthModeSelector />
} 
'use client'

import { useState, useEffect } from 'react'
import { Bug, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface DiagnosticResult {
  test: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

export default function GoogleDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results: DiagnosticResult[] = []

    // Test 1: Verificar variables de entorno
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!apiKey || apiKey === 'your-google-api-key') {
      results.push({
        test: 'Google API Key',
        status: 'fail',
        message: 'No configurada',
        details: 'La API Key no está configurada en .env.local'
      })
    } else if (apiKey.length < 20) {
      results.push({
        test: 'Google API Key',
        status: 'warning',
        message: 'Formato sospechoso',
        details: 'La API Key parece ser muy corta'
      })
    } else {
      results.push({
        test: 'Google API Key',
        status: 'pass',
        message: 'Configurada correctamente'
      })
    }

    if (!clientId || clientId === 'your-google-client-id') {
      results.push({
        test: 'Google Client ID',
        status: 'fail',
        message: 'No configurado',
        details: 'El Client ID no está configurado en .env.local'
      })
    } else if (!clientId.includes('.apps.googleusercontent.com')) {
      results.push({
        test: 'Google Client ID',
        status: 'warning',
        message: 'Formato sospechoso',
        details: 'El Client ID no tiene el formato correcto de Google'
      })
    } else {
      results.push({
        test: 'Google Client ID',
        status: 'pass',
        message: 'Configurado correctamente'
      })
    }

    // Test 2: Verificar conexión a internet
    try {
      const response = await fetch('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest')
      if (response.ok) {
        results.push({
          test: 'Conexión a Google APIs',
          status: 'pass',
          message: 'Conexión exitosa'
        })
      } else {
        results.push({
          test: 'Conexión a Google APIs',
          status: 'fail',
          message: 'Error de conexión',
          details: `Status: ${response.status}`
        })
      }
    } catch (error) {
      results.push({
        test: 'Conexión a Google APIs',
        status: 'fail',
        message: 'Sin conexión',
        details: 'No se puede conectar a las APIs de Google'
      })
    }

         // Test 3: Verificar si Google Identity Services está disponible
     if (typeof window !== 'undefined' && window.google && window.google.accounts) {
       results.push({
         test: 'Google Identity Services',
         status: 'pass',
         message: 'Disponible'
       })
     } else {
       results.push({
         test: 'Google Identity Services',
         status: 'warning',
         message: 'No cargado',
         details: 'Google Identity Services no está cargado. Esto es normal en la primera carga.'
       })
     }

     // Test 4: Verificar si el script de Google Identity Services se está cargando
     try {
       const scriptElement = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
       if (scriptElement) {
         results.push({
           test: 'Script de Google Identity Services',
           status: 'pass',
           message: 'Cargado correctamente'
         })
       } else {
         results.push({
           test: 'Script de Google Identity Services',
           status: 'warning',
           message: 'No detectado',
           details: 'El script de Google Identity Services no se ha cargado aún'
         })
       }
     } catch (error) {
       results.push({
         test: 'Script de Google Identity Services',
         status: 'fail',
         message: 'Error al verificar',
         details: 'No se pudo verificar el script de Google Identity Services'
       })
     }

         // Test 5: Verificar dominio
     const currentDomain = window.location.hostname
     if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
       results.push({
         test: 'Dominio de desarrollo',
         status: 'pass',
         message: 'Dominio local válido'
       })
     } else {
       results.push({
         test: 'Dominio de desarrollo',
         status: 'warning',
         message: 'Dominio de producción',
         details: 'Asegúrate de que el dominio esté autorizado en Google Cloud Console'
       })
     }

           // Test 6: Verificar configuración de OAuth
      if (clientId && (clientId.includes('localhost') || clientId.includes('127.0.0.1'))) {
        results.push({
          test: 'Configuración OAuth',
          status: 'pass',
          message: 'Client ID configurado para desarrollo'
        })
      } else {
        results.push({
          test: 'Configuración OAuth',
          status: 'warning',
          message: 'Verificar URIs de redirección',
          details: 'Asegúrate de que las URIs de redirección incluyan localhost:3000'
        })
      }

    setDiagnostics(results)
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'fail':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const hasFailures = diagnostics.some(d => d.status === 'fail')
  const hasWarnings = diagnostics.some(d => d.status === 'warning')

  return (
    <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bug className="h-5 w-5 text-orange-600" />
          Diagnóstico de Google Drive
        </h3>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="btn-secondary flex items-center gap-2"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRunning ? 'Ejecutando...' : 'Ejecutar'}
        </button>
      </div>

      <div className="space-y-3">
        {diagnostics.map((diagnostic, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getStatusColor(diagnostic.status)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(diagnostic.status)}
                  <span className="font-medium">{diagnostic.test}</span>
                </div>
                <p className="text-sm opacity-90">{diagnostic.message}</p>
                {diagnostic.details && (
                  <p className="text-xs opacity-75 mt-1">{diagnostic.details}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasFailures && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-700 mb-2">
            <strong>❌ Problemas detectados:</strong> Hay errores que impiden la conexión con Google Drive.
          </p>
          <div className="text-xs text-red-600 space-y-1">
            <p><strong>Soluciones:</strong></p>
            <p>• Verifica que el archivo .env.local tenga las credenciales correctas</p>
            <p>• Asegúrate de que Google Drive API esté habilitada en Google Cloud Console</p>
            <p>• Verifica que las URIs de redirección incluyan tu dominio</p>
            <p>• Revisa la consola del navegador para más detalles</p>
          </div>
        </div>
      )}

      {!hasFailures && hasWarnings && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-2">
            <strong>⚠️ Advertencias:</strong> Hay configuraciones que podrían causar problemas.
          </p>
          <div className="text-xs text-yellow-600 space-y-1">
            <p>• Revisa las credenciales de Google</p>
            <p>• Verifica que el dominio esté autorizado</p>
          </div>
        </div>
      )}

      {!hasFailures && !hasWarnings && diagnostics.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-700">
            <strong>✅ Todo correcto:</strong> Todas las verificaciones pasaron. Si aún tienes problemas, revisa la consola del navegador.
          </p>
        </div>
      )}
    </div>
  )
} 
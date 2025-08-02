'use client'

import { useState } from 'react'
import { TestTube, CheckCircle, XCircle } from 'lucide-react'

export default function GoogleTest() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const results: string[] = []

    // Test 1: Verificar variables de entorno
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (apiKey && apiKey !== 'your-google-api-key') {
      results.push('✅ API Key configurada')
    } else {
      results.push('❌ API Key no configurada')
    }

    if (clientId && clientId !== 'your-google-client-id') {
      results.push('✅ Client ID configurado')
    } else {
      results.push('❌ Client ID no configurado')
    }

    // Test 2: Verificar dominio
    const domain = window.location.hostname
    if (domain === 'localhost' || domain === '127.0.0.1') {
      results.push('✅ Dominio local válido')
    } else {
      results.push('⚠️ Dominio de producción')
    }

    // Test 3: Verificar conexión a internet
    try {
      const response = await fetch('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest')
      if (response.ok) {
        results.push('✅ Conexión a Google APIs')
      } else {
        results.push(`❌ Error de conexión: ${response.status}`)
      }
    } catch (error) {
      results.push('❌ Sin conexión a Google APIs')
    }

         // Test 4: Verificar si Google Identity Services está disponible
     if (typeof window !== 'undefined' && window.google && window.google.accounts) {
       results.push('✅ Google Identity Services disponible')
     } else {
       results.push('⚠️ Google Identity Services no cargado')
     }

    setTestResults(results)
    setIsRunning(false)
  }

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <TestTube className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold">Test de Google API</h3>
      </div>
      
      <button
        onClick={runTests}
        disabled={isRunning}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {isRunning ? 'Ejecutando...' : 'Ejecutar Tests'}
      </button>
      
      {testResults.length > 0 && (
        <div className="mt-3 space-y-1">
          {testResults.map((result, index) => (
            <div key={index} className="text-xs flex items-center gap-2">
              {result.startsWith('✅') ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : result.startsWith('❌') ? (
                <XCircle className="h-3 w-3 text-red-600" />
              ) : (
                <span className="text-yellow-600">⚠️</span>
              )}
              <span className={result.startsWith('❌') ? 'text-red-600' : 'text-gray-700'}>
                {result}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
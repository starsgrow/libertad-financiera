'use client'

import { useState, useEffect } from 'react'
import { useGoogleAuth } from './GoogleAuthProvider'

export default function GoogleAuthDebugger() {
  const { isAuthenticated, isInitializing, isRedirecting, error } = useGoogleAuth()
  const [showDebug, setShowDebug] = useState(false)
  const [urlInfo, setUrlInfo] = useState({
    href: '',
    hash: '',
    search: ''
  })

  useEffect(() => {
    setUrlInfo({
      href: window.location.href,
      hash: window.location.hash,
      search: window.location.search
    })
  }, [])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full text-xs z-50"
        title="Debug Info"
      >
        🔧
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Estado:</strong>
          <div className="ml-2">
            <div>Autenticado: {isAuthenticated ? '✅' : '❌'}</div>
            <div>Inicializando: {isInitializing ? '✅' : '❌'}</div>
            <div>Redirigiendo: {isRedirecting ? '✅' : '❌'}</div>
          </div>
        </div>
        
        {error && (
          <div>
            <strong>Error:</strong>
            <div className="ml-2 text-red-600">{error}</div>
          </div>
        )}
        
        <div>
          <strong>URL Info:</strong>
          <div className="ml-2">
            <div>Hash: {urlInfo.hash || 'vacío'}</div>
            <div>Search: {urlInfo.search || 'vacío'}</div>
          </div>
        </div>
        
        <div>
          <strong>Variables de entorno:</strong>
          <div className="ml-2">
            <div>API Key: {process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? '✅' : '❌'}</div>
            <div>Client ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅' : '❌'}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  BarChart3, 
  Calendar, 
  Settings,
  AlertTriangle,
  Database,
  Cloud,
  Smartphone,
  Clock,
  Building2
} from 'lucide-react'
import { db } from '@/lib/database'
import { useGoogleAuth } from './GoogleAuthProvider'

interface NavigationItem {
  name: string
  href: string
  icon: any
  notifications?: number
}

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { authMode } = useGoogleAuth()
  const [upcomingExpenses, setUpcomingExpenses] = useState(0)

  useEffect(() => {
    loadUpcomingExpenses()
  }, [])

  const loadUpcomingExpenses = async () => {
    try {
      const expenses = await db.getUpcomingFixedExpenses()
      setUpcomingExpenses(expenses.length)
    } catch (error) {
      console.error('Error cargando gastos próximos:', error)
    }
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
        return 'Local'
      case 'google':
        return 'Google'
      case 'hybrid':
        return 'Híbrido'
      default:
        return 'Desconocido'
    }
  }

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Día a Día', href: '/daily', icon: Clock },
    { name: 'Patrimonio', href: '/patrimony', icon: Building2 },
    { name: 'Gastos Fijos', href: '/fixed-expenses', icon: Calendar, notifications: upcomingExpenses },
  ]

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Libertad Financiera</h1>
            <div className="flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
              {getAuthModeIcon()}
              <span className="font-medium">{getAuthModeText()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors relative ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.notifications && item.notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.notifications}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
} 
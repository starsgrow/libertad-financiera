// Google Drive API service for data storage
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3'
const FINANCE_FILE_NAME = 'libertad-financiera-data.json'

interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense' | 'savings'
  category: string
  date: string
}

interface FinanceData {
  transactions: Transaction[]
  lastSync: string
  version: string
}

class GoogleDriveService {
  private accessToken: string | null = null
  private fileId: string | null = null
  private googleAuth: any = null

  // Inicializar Google Drive API
  async init(): Promise<boolean> {
    try {
      console.log('🔧 Iniciando Google Drive API...')
      console.log('🔧 URL actual:', window.location.href)
      console.log('🔧 Hash de URL:', window.location.hash)
      
      // Verificar credenciales
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      
      if (!apiKey || apiKey === 'your-google-api-key') {
        throw new Error('Google API Key no configurada')
      }
      
      if (!clientId || clientId === 'your-google-client-id') {
        throw new Error('Google Client ID no configurado')
      }
      
      console.log('✅ Credenciales verificadas')
      console.log('📋 API Key:', apiKey.substring(0, 10) + '...')
      console.log('📋 Client ID:', clientId.substring(0, 20) + '...')
      
      // Cargar Google Identity Services
      await this.loadGoogleIdentityServices()
      console.log('✅ Google Identity Services cargado')
      
      // Autenticar usuario
      await this.authenticate()
      console.log('✅ Usuario autenticado')
      
      // Buscar o crear archivo de datos
      await this.findOrCreateDataFile()
      console.log('✅ Archivo de datos configurado')
      
      return true
    } catch (error: unknown) {
      console.error('❌ Error inicializando Google Drive:', error)
      if (error instanceof Error) {
        throw new Error(`Error inicializando Google Drive: ${error.message}`)
      }
      throw new Error('Error desconocido inicializando Google Drive')
    }
  }

  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📡 Cargando Google Identity Services...')
      
      // Verificar si ya está cargado
      if (window.google && window.google.accounts) {
        console.log('✅ Google Identity Services ya está cargado')
        resolve()
        return
      }
      
      // Cargar Google Identity Services
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('📡 Google Identity Services script cargado')
        
        // Esperar un poco para que se inicialice
        setTimeout(() => {
          if (window.google && window.google.accounts) {
            console.log('✅ Google Identity Services inicializado')
            resolve()
          } else {
            reject(new Error('Google Identity Services no se cargó correctamente'))
          }
        }, 2000)
      }
      
      script.onerror = () => {
        console.error('❌ Error cargando Google Identity Services script')
        reject(new Error('No se pudo cargar el script de Google Identity Services'))
      }
      
      document.head.appendChild(script)
    })
  }

  private async authenticate(): Promise<void> {
    try {
      console.log('🔐 Iniciando proceso de autenticación...')
      
      // Verificar si ya tenemos un token válido en el fragmento de la URL (después del redirect)
      const hash = window.location.hash.substring(1) // Remover el #
      console.log('🔍 Verificando hash de URL:', hash)
      
      const urlParams = new URLSearchParams(hash)
      const accessToken = urlParams.get('access_token')
      const error = urlParams.get('error')
      
      console.log('🔍 Parámetros encontrados:', { accessToken: accessToken ? 'SÍ' : 'NO', error })
      
      if (error) {
        throw new Error(`Error de autenticación: ${error}`)
      }
      
      if (accessToken) {
        this.accessToken = accessToken
        console.log('✅ Token de acceso obtenido del redirect')
        
        // Limpiar la URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        console.log('✅ Usuario autenticado exitosamente')
        return
      }
      
      // Si no hay token, iniciar el flujo de autenticación
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
      const redirectUri = window.location.origin
      const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file')
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scope}&` +
        `response_type=token&` +
        `include_granted_scopes=true&` +
        `prompt=select_account`
      
      console.log('🔗 Redirigiendo a Google para autenticación...')
      console.log('🔗 URL de autenticación:', authUrl)
      
      // Redirigir al usuario
      window.location.href = authUrl
      
      // No esperar aquí, el usuario será redirigido
      throw new Error('Redirigiendo a Google para autenticación')
    } catch (error) {
      console.error('❌ Error en autenticación:', error)
      if (error && typeof error === 'object' && 'error' in error) {
        const authError = error as any
        throw new Error(`Error de autenticación: ${authError.error || 'Error desconocido'}`)
      }
      throw new Error(`Error de autenticación: ${error}`)
    }
  }

  private async findOrCreateDataFile(): Promise<void> {
    try {
      // Buscar archivo existente usando la API REST de Google Drive
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${FINANCE_FILE_NAME}' and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error buscando archivo: ${response.status}`)
      }

      const data = await response.json()
      const files = data.files

      if (files && files.length > 0) {
        this.fileId = files[0].id
        console.log('Archivo encontrado:', this.fileId)
      } else {
        // Crear nuevo archivo
        await this.createDataFile()
      }
    } catch (error) {
      console.error('Error buscando archivo:', error)
      throw error
    }
  }

  private async createDataFile(): Promise<void> {
    const initialData: FinanceData = {
      transactions: [],
      lastSync: new Date().toISOString(),
      version: '1.0.0'
    }

    const fileMetadata = {
      name: FINANCE_FILE_NAME,
      mimeType: 'application/json'
    }

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...fileMetadata,
          media: {
            mimeType: 'application/json',
            body: JSON.stringify(initialData, null, 2)
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Error creando archivo: ${response.status}`)
      }

      const data = await response.json()
      this.fileId = data.id
      console.log('Archivo creado:', this.fileId)
    } catch (error) {
      console.error('Error creando archivo:', error)
      throw error
    }
  }

  // Cargar datos desde Google Drive
  async loadData(): Promise<Transaction[]> {
    if (!this.fileId) {
      throw new Error('No se ha inicializado Google Drive')
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${this.fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error cargando datos: ${response.status}`)
      }

      const data: FinanceData = await response.json()
      return data.transactions || []
    } catch (error) {
      console.error('Error cargando datos:', error)
      return []
    }
  }

  // Guardar datos en Google Drive
  async saveData(transactions: Transaction[]): Promise<void> {
    if (!this.fileId) {
      throw new Error('No se ha inicializado Google Drive')
    }

    const data: FinanceData = {
      transactions,
      lastSync: new Date().toISOString(),
      version: '1.0.0'
    }

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${this.fileId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media: {
            mimeType: 'application/json',
            body: JSON.stringify(data, null, 2)
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Error guardando datos: ${response.status}`)
      }

      console.log('Datos guardados en Google Drive')
    } catch (error) {
      console.error('Error guardando datos:', error)
      throw error
    }
  }

  // Sincronizar datos (cargar y guardar)
  async syncData(localTransactions: Transaction[]): Promise<Transaction[]> {
    try {
      // Cargar datos remotos
      const remoteTransactions = await this.loadData()
      
      // Combinar datos (estrategia simple: usar los más recientes)
      const allTransactions = [...localTransactions, ...remoteTransactions]
      const uniqueTransactions = this.removeDuplicates(allTransactions)
      
      // Guardar datos combinados
      await this.saveData(uniqueTransactions)
      
      return uniqueTransactions
    } catch (error) {
      console.error('Error sincronizando datos:', error)
      return localTransactions
    }
  }

  private removeDuplicates(transactions: Transaction[]): Transaction[] {
    const seen = new Set()
    return transactions.filter(transaction => {
      const duplicate = seen.has(transaction.id)
      seen.add(transaction.id)
      return !duplicate
    })
  }

  // Verificar estado de conexión
  async checkConnection(): Promise<boolean> {
    try {
      await this.loadData()
      return true
    } catch (error) {
      return false
    }
  }

  // Obtener información del archivo
  async getFileInfo(): Promise<{ lastModified: string; size: number } | null> {
    if (!this.fileId) return null

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${this.fileId}?fields=modifiedTime,size`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Error obteniendo información del archivo: ${response.status}`)
      }

      const data = await response.json()
      return {
        lastModified: data.modifiedTime,
        size: parseInt(data.size || '0')
      }
    } catch (error) {
      console.error('Error obteniendo información del archivo:', error)
      return null
    }
  }
}

// Instancia singleton
export const googleDrive = new GoogleDriveService() 
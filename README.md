# Libertad Financiera

Una aplicación PWA (Progressive Web App) para el control de finanzas personales, desarrollada con Next.js 14 y React.

## Características

- 📊 **Dashboard completo** con resumen de finanzas
- 💰 **Gestión de transacciones** (ingresos, gastos, ahorros)
- 📅 **Gastos fijos** con alertas de vencimiento
- 🏦 **Gestión de cuentas** (Cash y Banks)
- 💱 **Transferencias** entre cuentas
- 📈 **Patrimonio** con seguimiento de crecimiento
- 📱 **PWA** - Instalable en móviles
- ☁️ **Persistencia local** con IndexedDB
- 🔄 **Backup/Importación** de datos

## Tecnologías

- **Next.js 14** - Framework de React
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **IndexedDB** - Base de datos local
- **Lucide React** - Iconos
- **Recharts** - Gráficos

## Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPO]

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## Uso

1. **Acceder a la aplicación** en tu navegador
2. **Seleccionar modo de autenticación** (Local, Google Drive, o Híbrido)
3. **Configurar tu balance inicial** usando el botón "Ajustar Balance"
4. **Agregar transacciones** usando el botón "+"
5. **Gestionar gastos fijos** en la pestaña correspondiente
6. **Configurar patrimonio** en la pestaña "Patrimonio"
7. **Instalar como PWA** en tu móvil para acceso rápido

## Funcionalidades Principales

### Dashboard
- Resumen de balance total
- Subdivisión en Cash y Banks
- Transferencias entre cuentas
- Widgets de patrimonio y crecimiento

### Transacciones
- Agregar ingresos, gastos y ahorros
- Especificar cuenta (Cash o Banks)
- Categorización automática
- Filtros por tipo y fecha

### Gastos Fijos
- Configuración de fechas de vencimiento
- Alertas automáticas (3, 5 días, mismo día)
- Marcado como pagado
- Edición y eliminación

### Patrimonio
- Registro de bienes de valor
- Seguimiento de apreciación/depreciación
- Métricas de crecimiento (mensual, trimestral, etc.)
- Historial de cambios

### Backup y Restauración
- Exportar todos los datos
- Importar desde archivo JSON
- Limpieza de duplicados
- Eliminación completa de datos

## PWA (Progressive Web App)

La aplicación está configurada como PWA, lo que permite:

- **Instalación en móviles** como app nativa
- **Funcionamiento offline** (con datos locales)
- **Acceso rápido** desde la pantalla de inicio
- **Notificaciones** de gastos fijos próximos a vencer

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Dashboard
│   ├── daily/             # Vista día a día
│   ├── fixed-expenses/    # Gastos fijos
│   └── patrimony/         # Patrimonio
├── components/            # Componentes React
├── lib/                  # Utilidades y base de datos
├── public/               # Archivos estáticos
│   ├── manifest.json     # Configuración PWA
│   └── icon.svg          # Icono de la app
└── package.json          # Dependencias
```

## Variables de Entorno

Crear archivo `.env.local`:

```env
# Google Drive API (opcional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key
```

## Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno si es necesario
3. Desplegar automáticamente

### Otros

- **Netlify**: Compatible con Next.js
- **Railway**: Plataforma de despliegue
- **VPS**: Construir con `npm run build` y servir con `npm start`

## Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas, crear un issue en el repositorio. 
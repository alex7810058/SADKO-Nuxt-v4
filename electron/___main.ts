import { app, BrowserWindow, protocol } from 'electron'
import { readFileSync } from 'fs'
import { join } from 'path'

const isDev = process.env.NODE_ENV === 'development' || !!process.env.VITE_DEV_SERVER_URL

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: true
    }
  }
])

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadURL('app://./')
  }
}

function setupProtocol() {
  protocol.handle('app', (request) => {
    const url = new URL(request.url)
    let pathname = url.pathname

    console.log('Request:', request.url)

    // Убираем начальный слеш
    if (pathname.startsWith('/')) {
      pathname = pathname.substring(1)
    }

    // Если путь пустой - index.html
    if (!pathname || pathname === '') {
      pathname = 'index.html'
    }

    // Путь к файлу в корне архива
    const filePath = join(process.resourcesPath, 'app.asar', pathname)
    console.log('Looking for file:', filePath)

    try {
      const file = readFileSync(filePath)

      // Определяем MIME-тип
      const ext = pathname.split('.').pop()?.toLowerCase() || ''
      const mimeTypes: Record<string, string> = {
        'html': 'text/html; charset=utf-8',
        'js': 'application/javascript; charset=utf-8',
        'css': 'text/css; charset=utf-8',
        'json': 'application/json; charset=utf-8',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf'
      }

      const contentType = mimeTypes[ext] || 'application/octet-stream'

      console.log(`✓ Serving: ${pathname} as ${contentType}`)

      return new Response(file, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': ext === 'html' ? 'no-cache' : 'public, max-age=31536000'
        }
      })
    } catch (error) {
      console.error('File not found, falling back to index.html')
      // Возвращаем index.html для маршрутов приложения
      const indexPath = join(process.resourcesPath, 'app.asar', 'index.html')
      try {
        const file = readFileSync(indexPath)
        return new Response(file, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
      } catch (e) {
        return new Response('Not Found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        })
      }
    }
  })
}

app.whenReady().then(() => {
  setupProtocol()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

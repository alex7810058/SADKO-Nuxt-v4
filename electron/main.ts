import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Получаем имя приложения
const getAppName = () => {
  const appArg = process.argv.find(arg => arg.startsWith('--app='))
  if (appArg) return appArg.split('=')[1]
  if (process.env.APP_NAME) return process.env.APP_NAME

  // Определяем по имени исполняемого файла
  if (process.env.NODE_ENV === 'production') {
    const exeName = process.execPath.toLowerCase()
    if (exeName.includes('designer')) return 'designer'
    if (exeName.includes('vk-pult') || exeName.includes('vkpult')) return 'vk-pult'
    if (exeName.includes('client')) return 'client'
    if (exeName.includes('diaes')) return 'diaes'
  }

  return 'designer'
}

const appName = getAppName()
const isDev = process.env.NODE_ENV === 'development'

// Конфигурация для каждого приложения
const appConfigs = {
  designer: {
    title: 'Sadko Designer',
    width: 1400,
    height: 900,
    port: 3001
  },
  'vk-pult': {
    title: 'Sadko VkPult',
    width: 1200,
    height: 800,
    port: 3002
  },
  client: {
    title: 'Sadko Client',
    width: 1000,
    height: 700,
    port: 3003
  },
  diaes: {
    title: 'Sadko Diaes',
    width: 1300,
    height: 850,
    port: 3004
  }
}

const config = appConfigs[appName] || appConfigs.designer

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    title: config.title,
    icon: join(__dirname, `../../shared/assets/icons/${appName}.ico`),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: false
    },
    show: false,
    backgroundColor: '#1a1a1a'
  })

  // Создание меню
  createAppMenu(appName)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  loadApp(mainWindow, appName, isDev)
}

function loadApp(window, appName, isDevMode) {
  if (isDevMode) {
    // Режим разработки
    const port = config.port
    const url = `http://localhost:${port}`

    console.log(`📡 Dev-режим: подключение к ${url}`)
    window.loadURL(url).catch(err => {
      console.error(`❌ Ошибка загрузки: ${err.message}`)
      showErrorPage(window, `Dev-сервер не запущен. Запустите: npm run dev:${appName}`)
    })
  } else {
    // Production режим
    const appPath = join(process.resourcesPath, 'app.asar.unpacked', 'apps', appName, '.output', 'public')
    const indexPath = join(appPath, 'index.html')

    console.log(`🏗️ Production: поиск файла по пути ${indexPath}`)

    if (fs.existsSync(indexPath)) {
      window.loadFile(indexPath).catch(err => {
        console.error('❌ Ошибка загрузки index.html:', err)
        showErrorPage(window, `Файл не найден: ${indexPath}`)
      })
    } else {
      showErrorPage(window, `Приложение ${appName} не собрано. Запустите сборку.`)
    }
  }
}

function createAppMenu(appName) {
  const template = [
    {
      label: appName.charAt(0).toUpperCase() + appName.slice(1),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Приложения',
      submenu: [
        {
          label: 'Designer',
          click: () => restartApp('designer')
        },
        {
          label: 'VkPult',
          click: () => restartApp('vk-pult')
        },
        {
          label: 'Client',
          click: () => restartApp('client')
        },
        {
          label: 'Diaes',
          click: () => restartApp('diaes')
        }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function restartApp(newAppName) {
  app.relaunch({
    args: process.argv.slice(1).concat([`--app=${newAppName}`])
  })
  app.exit()
}

function showErrorPage(window, message) {
  window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial; padding: 40px; text-align: center; background: #f0f0f0; }
      .error-box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
      code { background: #f5f5f5; padding: 5px 10px; border-radius: 4px; }
    </style></head>
    <body>
      <div class="error-box">
        <h1>Ошибка загрузки</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `)}`)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('get-app-info', () => ({
  name: appName,
  version: app.getVersion(),
  platform: process.platform,
  isDev: isDev
}))

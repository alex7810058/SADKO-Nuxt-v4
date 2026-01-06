import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Получаем имя приложения из аргументов или переменной окружения
const getAppName = () => {
  // 1. Из аргументов командной строки (--app=designer)
  const appArg = process.argv.find(arg => arg.startsWith('--app='))
  if (appArg) {
    return appArg.split('=')[1]
  }

  // 2. Из переменной окружения
  if (process.env.APP_NAME) {
    return process.env.APP_NAME
  }

  // 3. Если запускаем из собранного .exe, проверяем имя исполняемого файла
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    const exeName = process.execPath.split(/[\\/]/).pop().toLowerCase()

    const appMap = {
      'designer': 'designer',
      'vkpult': 'vk-pult',
      'client': 'client',
      'diaes': 'diaes'
    }

    for (const [key, value] of Object.entries(appMap)) {
      if (exeName.includes(key)) {
        return value
      }
    }
  }

  // 4. По умолчанию
  return 'designer'
}

const appName = getAppName()
console.log(`🚀 Запуск приложения: ${appName}`)

// Порты для dev-режима
const devPorts = {
  'designer': 3001,
  'vk-pult': 3002,
  'client': 3003,
  'diaes': 3004
}

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  // Настройки окна для каждого приложения
  const windowConfigs = {
    'designer': {
      width: 1400,
      height: 900,
      title: 'Sadko Designer',
      icon: join(__dirname, `../../shared/assets/icons/designer.ico`)
    },
    'vk-pult': {
      width: 1200,
      height: 800,
      title: 'Sadko VkPult',
      icon: join(__dirname, `../../shared/assets/icons/vk-pult.ico`)
    },
    'client': {
      width: 1000,
      height: 700,
      title: 'Sadko Client',
      icon: join(__dirname, `../../shared/assets/icons/client.ico`)
    },
    'diaes': {
      width: 1300,
      height: 850,
      title: 'Sadko Diaes',
      icon: join(__dirname, `../../shared/assets/icons/diaes.ico`)
    }
  }

  const config = windowConfigs[appName] || windowConfigs.designer

  const mainWindow = new BrowserWindow({
    ...config,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Для локальных файлов
      allowRunningInsecureContent: false
    },
    show: false, // Не показывать окно до полной загрузки
    backgroundColor: '#1a1a1a'
  })

  // Создаем меню с названием текущего приложения
  createAppMenu(appName)

  // Обработчики событий окна
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow.destroy()
  })

  // Загрузка приложения
  loadApp(mainWindow, appName, isDev)
}

// Функция загрузки приложения (dev или production)
function loadApp(window, appName, isDevMode) {
  if (isDevMode) {
    // Режим разработки: подключаемся к dev-серверу Nuxt
    const port = devPorts[appName] || 3001
    const url = `http://localhost:${port}`

    console.log(`📡 Dev-режим: подключение к ${url}`)

    window.loadURL(url).catch(err => {
      console.error(`❌ Не удалось загрузить ${url}:`, err)

      // Показать страницу с ошибкой
      window.loadFile(join(__dirname, 'error.html')).then(() => {
        window.webContents.executeJavaScript(`
          document.getElementById('error-message').textContent = 'Dev-сервер не запущен. Запустите: npm run dev:${appName}';
        `)
      })
    })
  } else {
    // Production: загружаем из папки сборки
    const appPath = join(process.resourcesPath, 'app.asar.unpacked', 'apps', appName, '.output', 'public')
    const indexPath = join(appPath, 'index.html')

    console.log(`🏗️ Production: поиск файла по пути ${indexPath}`)

    // Проверяем существование файла
    if (fs.existsSync(indexPath)) {
      window.loadFile(indexPath).catch(err => {
        console.error('❌ Ошибка загрузки index.html:', err)
        showErrorPage(window, `Файл index.html не найден: ${indexPath}`)
      })
    } else {
      // Альтернативный путь (для разных конфигураций сборки)
      const altPaths = [
        join(process.resourcesPath, 'index.html'),
        join(__dirname, '..', 'apps', appName, '.output', 'public', 'index.html'),
        join(process.cwd(), 'index.html')
      ]

      let loaded = false
      for (const path of altPaths) {
        if (fs.existsSync(path)) {
          window.loadFile(path).catch(err => {
            console.error(`❌ Ошибка загрузки из ${path}:`, err)
          })
          loaded = true
          break
        }
      }

      if (!loaded) {
        showErrorPage(window, `Не найден файл index.html для приложения ${appName}`)
      }
    }
  }
}

// Создание меню приложения
function createAppMenu(appName) {
  const appNames = {
    'designer': 'Designer',
    'vk-pult': 'VkPult',
    'client': 'Client',
    'diaes': 'Diaes'
  }

  const currentAppName = appNames[appName] || 'Sadko'

  const template = [
    {
      label: currentAppName,
      submenu: [
        {
          label: `О ${currentAppName}`,
          click: () => {
            require('electron').dialog.showMessageBox({
              type: 'info',
              title: `О ${currentAppName}`,
              message: `${currentAppName} v${app.getVersion()}`,
              detail: 'Sadko Software\n© 2024 Все права защищены'
            })
          }
        },
        { type: 'separator' },
        {
          label: 'Перезапустить',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          label: 'Отладка',
          accelerator: isDev ? 'F12' : 'CmdOrCtrl+Shift+I',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        },
        { type: 'separator' },
        {
          label: 'Выход',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Приложения',
      submenu: [
        {
          label: 'Designer',
          type: 'checkbox',
          checked: appName === 'designer',
          click: () => restartApp('designer')
        },
        {
          label: 'VkPult',
          type: 'checkbox',
          checked: appName === 'vk-pult',
          click: () => restartApp('vk-pult')
        },
        {
          label: 'Client',
          type: 'checkbox',
          checked: appName === 'client',
          click: () => restartApp('client')
        },
        {
          label: 'Diaes',
          type: 'checkbox',
          checked: appName === 'diaes',
          click: () => restartApp('diaes')
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Перезапуск приложения с другим именем
function restartApp(newAppName) {
  if (newAppName === appName) return

  console.log(`🔄 Перезапуск с приложением: ${newAppName}`)

  app.relaunch({
    args: process.argv.slice(1).concat(['--app=' + newAppName])
  })
  app.exit(0)
}

// Показать страницу с ошибкой
function showErrorPage(window, message) {
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }
        .error-container {
          background: rgba(0,0,0,0.8);
          padding: 40px;
          border-radius: 20px;
          max-width: 600px;
        }
        h1 {
          font-size: 2.5em;
          margin-bottom: 20px;
        }
        .error-message {
          font-size: 1.2em;
          margin: 20px 0;
          padding: 15px;
          background: rgba(255,0,0,0.2);
          border-radius: 10px;
          border-left: 4px solid #ff4757;
        }
        .solution {
          margin-top: 30px;
          font-size: 0.9em;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>😕 Ошибка загрузки</h1>
        <div class="error-message" id="error-message">${message}</div>
        <div class="solution">
          <p>Запустите приложение в режиме разработки:</p>
          <code>npm run dev:${appName}</code>
        </div>
      </div>
    </body>
    </html>
  `

  window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`)
}

// Обработка событий приложения
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  console.error('💥 Необработанное исключение:', error)
})

ipcMain.handle('get-app-info', () => {
  return {
    name: appName,
    version: app.getVersion(),
    platform: process.platform,
    isDev: isDev
  }
})

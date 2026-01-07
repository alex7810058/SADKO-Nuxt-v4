// main.js - финальная версия
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Sadko Designer',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false  // Разрешаем file:// протокол
    },
    show: false
  })

  // Простое меню
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // Всегда открываем DevTools для отладки
    mainWindow.webContents.openDevTools()
  })

  loadApp(mainWindow)
}

function loadApp(window) {
  if (isDev) {
    // Dev режим
    window.loadURL('http://localhost:3001')
      .catch(err => console.error('Dev load error:', err))
  } else {
    // Production - используем __dirname вместо process.resourcesPath
    const indexPath = path.join(__dirname, 'apps', 'Designer', '.output', 'public', 'index.html')

    console.log('Loading from:', indexPath)
    console.log('File exists:', fs.existsSync(indexPath))

    if (fs.existsSync(indexPath)) {
      // Важно: добавляем file:// для абсолютных путей
      window.loadFile(indexPath).catch(err => {
        console.error('Load error:', err)
        // Альтернативный способ
        window.loadURL(`file://${indexPath}`)
      })
    } else {
      // Отладочная информация
      console.log('Current __dirname:', __dirname)
      console.log('Directory contents:', fs.readdirSync(__dirname))

      // Если есть папка apps
      if (fs.existsSync(path.join(__dirname, 'apps'))) {
        console.log('Apps folder contents:', fs.readdirSync(path.join(__dirname, 'apps')))
      }

      window.loadURL(`data:text/html,<h1>Debug Info</h1>
        <p>__dirname: ${__dirname}</p>
        <p>Path tested: ${indexPath}</p>`)
    }
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

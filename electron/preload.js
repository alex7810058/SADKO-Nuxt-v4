import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  platform: process.platform,

  sendMessage: (channel, data) => {
    const validChannels = ['to-main']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  onMessage: (channel, func) => {
    const validChannels = ['from-main']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})

contextBridge.exposeInMainWorld('appInfo', {
  name: 'Sadko App',
  version: process.env.npm_package_version || '0.0.1'
})

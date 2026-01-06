import { contextBridge } from 'electron'

// Экспортируем безопасные API в renderer процесс
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: process.versions
})

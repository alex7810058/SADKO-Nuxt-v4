import { app } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'

console.log('=== DEBUG PATHS ===')
console.log('App path:', app.getAppPath())
console.log('Resources path:', process.resourcesPath)

const checkPaths = [
  join(app.getAppPath(), '.output/public/index.html'),
  join(process.resourcesPath, 'app.asar/.output/public/index.html'),
  join(process.resourcesPath, 'app.asar.unpacked/.output/public/index.html'),
  join(app.getAppPath(), 'index.html')
]

checkPaths.forEach(path => {
  console.log(`${existsSync(path) ? '+' : '-'} ${path}`)
})

const { app, BrowserWindow, ipcMain, Notification, dialog } = require('electron/main')
const path = require('node:path')
const fs = require('fs')
const ElectronStore = require('electron-store')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')

log.transports.file.level = 'info'
log.transports.console.level = 'debug'

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
})

const store = new ElectronStore({
  name: 'taskmaster-data',
  defaults: {
    todos: []
  }
})

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  })

  mainWindow.loadFile('index.html')
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  createWindow()
  
  autoUpdater.checkForUpdatesAndNotify()

  ipcMain.handle('store:get', (event, key) => {
    return store.get(key)
  })
  
  ipcMain.handle('store:set', (event, key, value) => {
    store.set(key, value)
    return true
  })
  
  ipcMain.handle('store:delete', (event, key) => {
    store.delete(key)
    return true
  })
  
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })
  
  ipcMain.on('app:quit', () => {
    app.quit()
  })
  
  ipcMain.on('notification:show', (event, title, body) => {
    new Notification({ title, body }).show()
  })
  
  ipcMain.handle('data:exportTodos', async () => {
    try {
      const todos = store.get('todos', [])
      
      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Tasks',
        defaultPath: path.join(app.getPath('documents'), 'taskmaster-backup.json'),
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      })
      
      if (!filePath) return { success: false, message: 'Export cancelled' }
      
      const data = JSON.stringify(todos, null, 2)
      fs.writeFileSync(filePath, data)
      
      return { success: true, message: 'Tasks exported successfully' }
    } catch (error) {
      log.error('Error exporting todos:', error)
      return { success: false, message: `Export failed: ${error.message}` }
    }
  })
  
  ipcMain.handle('data:importTodos', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Tasks',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
      })
      
      if (!filePaths || filePaths.length === 0) {
        return { success: false, message: 'Import cancelled' }
      }
      
      const data = fs.readFileSync(filePaths[0], 'utf-8')
      const todos = JSON.parse(data)
      
      if (!Array.isArray(todos)) {
        return { success: false, message: 'Invalid task data format' }
      }
      
      store.set('todos', todos)
      return { success: true, message: 'Tasks imported successfully' }
    } catch (error) {
      log.error('Error importing todos:', error)
      return { success: false, message: `Import failed: ${error.message}` }
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

autoUpdater.on('update-available', () => {
  log.info('Update available')
  if (mainWindow) {
    mainWindow.webContents.send('update-available')
  }
})

autoUpdater.on('update-downloaded', () => {
  log.info('Update downloaded')
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded')
  }
})
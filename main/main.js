// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain, desktopCapturer } = require('electron')
require('electron-debug')({ showDevTools: false })
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let pickWindow

function storeMainPosition() {
  global.MAIN_POSITION = mainWindow.getPosition()
}

function createWindow () {
  global.myGlobalVariable = {}
  // Create the browser window.
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  ipcMain.on('mutation-global', function (event, arg) {
    global.myGlobalVariable[arg.name] = arg.value;
  })

  ipcMain.on('hide-main', function(e, arg) {
    mainWindow.hide()
    global.MAIN_POSITION = mainWindow.getPosition()
    mainWindow.setPosition(arg.x, arg.y)
  })

  ipcMain.on('create-pick-window', function(e, arg) {
    pickWindow = new BrowserWindow({
      width: arg.w, 
      height: arg.h, 
      fullscreen: true, 
      resizable: false, 
      skipTaskbar: true, 
      frame: false, 
      alwaysOnTop: true
    })
    mainWindow.loadFile('pick.html')
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

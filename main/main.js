// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain, desktopCapturer } = require('electron')
const { changeShort } = require('../utils/db')

require('electron-debug')({ showDevTools: false })
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let pickWindow

function createWindow () {
  // Create the browser window.
  global.myGlobalVariable = {}
  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  pickWindow = new BrowserWindow({
    width: 100, 
    height: 100, 
    fullscreen: true, 
    resizable: false, 
    skipTaskbar: true, 
    hasShadow: false,
    frame: false, 
    alwaysOnTop: true,
    transparent: true,
    show: false
  })
  pickWindow.loadFile('pick.html')
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  //add shortcut
  // globalShortcut.register('ctrl+shift+q', function () {
  //   mainWindow.webContents.send('global-shortcut-capture', 1);
  // });

  mainWindow.on('closed', function () {
    app.quit()
  })

  ipcMain.on('mutation-global', function (event, arg) {
    global.myGlobalVariable[arg.name] = arg.value;
  })

  ipcMain.on('hide-main', function(event, arg) {
    global.MAIN_POSITION = mainWindow.getPosition()
    mainWindow.setPosition(arg.width, arg.height)
    mainWindow.hide()
    let timer = setInterval(() => {
      if (!mainWindow.isVisible()) {
        event.sender.send('async-hided')
        clearInterval(timer)
      }
    }, 10)
  })

  ipcMain.on('show-pick-window', function(e, arg) {
    pickWindow.setSize(arg.width, arg.height)
    pickWindow.show()
    e.sender.send('pick-img-init')
  })

  ipcMain.on('close-pick-window', function(e, arg) {
    pickWindow.hide()
    mainWindow.setPosition(200, 400)
    mainWindow.show()
  })
}

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

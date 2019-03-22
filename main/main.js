// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const setShortcut = require('../utils/setKeys')
require('electron-debug')({ showDevTools: false })


let mainWindow
let pickWindow

// set global shortcut function


function createWindow () {
  // Create the browser window.
  global.myGlobalVariable = {}
  Menu.setApplicationMenu(null)

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // and bind default shortcut keys by db.
  setShortcut(false, function() {
    mainWindow.webContents.send('shortcut-show');
  });

  mainWindow.on('closed', function () {
    app.quit()
  })

  ipcMain.on('mutation-global', function (event, arg) {
    global.myGlobalVariable[arg.name] = arg.value;
  })

  ipcMain.on('hide-main', function(event, arg) {
    mainWindow.setPosition(arg.width, arg.height)
    mainWindow.hide()
    setTimeout(() => {
      event.sender.send('async-hided')
    }, 10)
  })

  ipcMain.on('create-pick-window', function(event, arg) {
    pickWindow = new BrowserWindow({
      width: arg.width, 
      height: arg.height,
      fullscreenable:true,
      fullscreen: true,
      simpleFullscreen:true,
      resizable: false, 
      skipTaskbar: true, 
      hasShadow: true,
      frame: false, 
      alwaysOnTop: true,
      transparent: true,
      titleBarStyle: 'hidden'
    })
    pickWindow.loadFile('pick.html')
  })

  ipcMain.on('close-pick-window', function(e, arg) {
    pickWindow.hide()
    mainWindow.center()
    mainWindow.show()
  })

  ipcMain.on('reset-short-key', function(event, arg) {
    setShortcut(arg, function() {
      mainWindow.webContents.send('shortcut-show');
    });
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

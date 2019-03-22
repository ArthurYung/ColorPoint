// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray } = require('electron')
const { resolve } = require('path')
const { createMenu, menuBuild } = require('./menur')
const setShortcut = require('../utils/setKeys')

require('electron-debug')({ showDevTools: false })

const ASSETS_PATH = resolve(__dirname, '../assets')
const APP_ICON = resolve(ASSETS_PATH, 'icon_app.png')
const WHILTE_ICON = resolve(ASSETS_PATH, 'icon_tray.png')


let mainWindow
let pickWindow
let trayApp

function createtTray(icon) {
  trayApp = new Tray(icon)
  trayApp.setContextMenu(menuBuild)
}

function ipcMessager(main) {
  ipcMain.on('mutation-global', function (event, arg) {
    global.myGlobalVariable[arg.name] = arg.value;
  })

  ipcMain.on('hide-main', function(event, arg) {
    main.setPosition(arg.width, arg.height)
    main.hide()
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
    main.center()
    main.show()
  })

  ipcMain.on('reset-short-key', function(event, arg) {
    setShortcut(arg, function() {
      mainWindow.webContents.send('shortcut-show');
    });
  })

}


async function createWindow () {
  // Create the browser window.
  global.myGlobalVariable = {}

  mainWindow = new BrowserWindow({
    width: 400,
    height: 540,
    resizable: false,
    title: 'Color Point',
    icon: APP_ICON,
    webPreferences: {
      nodeIntegration: true
    },
    darkTheme: true,
    show: false
  })

  ipcMessager(mainWindow)
  createMenu()
  createtTray(WHILTE_ICON)
  setShortcut(false, function() {
    mainWindow.webContents.send('shortcut-show');
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // and bind default shortcut keys by db.

  mainWindow.on('closed', function () {
    app.quit()
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
app.setName('Color Point')
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

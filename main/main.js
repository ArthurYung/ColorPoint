// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray, globalShortcut } = require('electron')
const { resolve } = require('path')
const { createMenu, menuBuild } = require('./menur')
const { changeShort, pushColor } = require('./db')
const { actions, PREVIEW_IMAGE, DEFAULTE_KEYS, HISTORY_COLOR } = require('./store')

require('electron-debug')({ showDevTools: false })

const ASSETS_PATH = resolve(__dirname, '../assets')
const APP_ICON = resolve(ASSETS_PATH,  'image/icon_app.png')
const WHILTE_ICON = resolve(ASSETS_PATH, 'image/icon_tray.png')
const MAIN_HTML = resolve(ASSETS_PATH, 'index.html')
const PICK_HTML = resolve(ASSETS_PATH, 'pick.html')

const isMac = process.platform === 'darwin'

let mainWindow
let pickWindow
let trayApp

const appliction = (action, event) => {
  switch (action.type) {
    case DEFAULTE_KEYS:
      changeShort('keys', action.payload)
      let keys = action.payload.toLowerCase()
      setShortCut(keys)
      break

    case HISTORY_COLOR:
      pushColor(action.payload)
      break

    default:
      break
  }
}

function setShortCut(shortcut) {
  shortcut = shortcut.toLowerCase()
  if (!shortcut || shortcut.indexOf('+') < 0) {
    return
  }
  globalShortcut.unregisterAll()
  globalShortcut.register(shortcut, startByShort);
}

function createStore (actions) {
  global.Store = {}
  actions.forEach(action => {
    global.Store[action.type] = action.default
  })
}

function connect (appliction) {
  ipcMain.on('connct-store-context', (event, action) => {
    appliction(action)
    global.Store[action.type] = action.payload
    mainWindow && mainWindow.webContents.send('connct-store-provider', action)
    pickWindow && pickWindow.webContents.send('connct-store-provider', action)
  })
}

function createtTray(icon) {
  let trayMenu = menuBuild(startByShort)
  trayApp = new Tray(icon)
  trayApp.setContextMenu(trayMenu)
}

function startByShort() {
  mainWindow.webContents.send('shortcut-show');
}

function ipcMessager(main) {

  ipcMain.on('start-point', function(event, arg) {
    main.setPosition(arg.width, arg.height)
    main.hide()
    pickWindow.setSize(arg.width,  arg.height)
    pickWindow.show()
    pickWindow.webContents.send('start-point-pr')
  })


  ipcMain.on('close-pick-window', function(e, arg) {
    pickWindow.hide()
    main.center()
    main.show()
  })
}


async function createWindow () {
  // Create the browser window.
  
  mainWindow = new BrowserWindow({
    width: 400,
    height: isMac ? 390 : 410,
    resizable: false,
    title: 'Color Point',
    backgroundColor: '#111327',
    icon: APP_ICON,
    darkTheme: true,
    fullscreenWindowTitle: true,
    show: true
  })
  pickWindow = new BrowserWindow({
    width: 10, 
    height: 10,
    left: 0,
    top: 0,
    fullscreen: !isMac || undefined,
    resizable: false,
    movable: false,
    skipTaskbar: true, 
    hasShadow: true,
    frame: false, 
    alwaysOnTop: true,
    transparent: true,
    show: false
  })
  pickWindow.loadFile(PICK_HTML)
  ipcMessager(mainWindow)
  createMenu()
  createtTray(WHILTE_ICON)
  createStore(actions)
  connect(appliction)
  setShortCut(global.Store.DEFAULTE_KEYS)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // and load the index.html of the app.
  mainWindow.loadFile(MAIN_HTML)

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

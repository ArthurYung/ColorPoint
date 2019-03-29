// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray, globalShortcut, Notification } = require('electron')
const { resolve } = require('path')
const { createMenu, menuBuild } = require('./menur')
const { changeShort, pushColor, getColor } = require('./db')
const { actions, DEFAULTE_KEYS, HISTORY_COLOR } = require('./store')

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
let notification
let shortcutCatch

// 不同的action操作中间件
const appliction = (action, event) => {
  switch (action.type) {
    case DEFAULTE_KEYS:
      changeShort('keys', action.payload)
      let keys = action.payload.toLowerCase()
      setShortCut(keys)
      return action.payload

    case HISTORY_COLOR:
      pushColor(action.payload)
      return getColor()

    default:
      return action.payload
  }
}

// 注册全局快捷键
function setShortCut(shortcut) {
  shortcut = shortcut.toLowerCase()
  // 如果指令有问题，则不注册
  if (!shortcut || shortcut.indexOf('+') < 0) {
    return
  }
  // 注册之前删除上一次注册的全局快捷键
  if (shortcutCatch) {
    globalShortcut.unregister(shortcutCatch)
  }
  shortcutCatch = shortcut
  globalShortcut.register(shortcut, startByShort);
}

// 全局变量初始化
function createStore (actions) {
  global.Store = {}
  actions.forEach(action => {
    global.Store[action.type] = action.default
  })
}

// 连接到两个window
function connect (appliction) {
  ipcMain.on('connct-store-context', (event, action) => {
    global.Store[action.type] = appliction(action)
    mainWindow && mainWindow.webContents.send('connct-store-provider', action)
    pickWindow && pickWindow.webContents.send('connct-store-provider', action)
  })
}

// 创建tray
function createtTray(icon) {
  let trayMenu = menuBuild(mainWindow, startByShort)
  trayApp = new Tray(icon)
  trayApp.setContextMenu(trayMenu)
  trayApp.on('right-click', () => { // 右键点击
    if (isMac) mainWindow.show()
  })
  trayApp.on('click', () => { // 右键点击
    mainWindow.show()
  })
}

// 快捷键对应的响应事件
function startByShort() {
  mainWindow.webContents.send('shortcut-show');
}

// 绑定ipc消息
function ipcMessager(main) {

  // 开始选择颜色
  ipcMain.on('start-point', function(event, arg) {
    main.setPosition(arg.width, arg.height)
    main.hide()
    pickWindow.setSize(arg.width,  arg.height)
    pickWindow.show()
    pickWindow.webContents.send('start-point-pr')
  })
  
  // 关闭颜色选择窗口并打开主窗口
  ipcMain.on('close-pick-window', function(e, arg) {
    pickWindow.hide()
    main.center()
    main.show()
  })

  // 复制颜色成功显示通知窗
  ipcMain.on('show-notification', function() {
    notification.show()
  })
}


async function createWindow () {
  // Create the browser window.
  notification = new Notification({
    title: 'Color Point',
    body: '颜色已复制',
    silent: true
  })

  mainWindow = new BrowserWindow({
    width: 400,
    height: isMac ? 390 : 410,
    resizable: false,
    title: 'Color Point',
    backgroundColor: '#111327',
    icon: APP_ICON,
    darkTheme: true,
    fullscreenWindowTitle: true,
    show: false
  })
  
  pickWindow = new BrowserWindow({
    width: 10, 
    height: 10,
    x: 0,
    y: 0,
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

  ipcMessager(mainWindow)
  createMenu(mainWindow)
  createtTray(WHILTE_ICON)
  createStore(actions)
  connect(appliction)
  setShortCut(global.Store.DEFAULTE_KEYS)
  pickWindow.loadFile(PICK_HTML)
  mainWindow.loadFile(MAIN_HTML)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('show', function() {
    mainWindow.setSkipTaskbar(false)
  })

  mainWindow.on('close', function(event) {
    mainWindow.hide(); 
    mainWindow.setSkipTaskbar(true);
    event.preventDefault();
  })

  mainWindow.on('closed', function (e) {
    pickWindow.destroy()
    mainWindow = null
    // app.quit()
  })

  pickWindow.on('closed', function() {
    pickWindow = null
    app.quit()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
  mainWindow.isVisible() || mainWindow.show()
})
app.setName('Color Point')

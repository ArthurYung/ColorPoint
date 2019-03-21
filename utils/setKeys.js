const { changeShort, getShort } = require('./db')
const { globalShortcut } = require('electron')

module.exports = function (shortcut, event) {
  let _shortcut = ''
  shortcut = shortcut || getShort('keys')
  _shortcut = shortcut.toLowerCase()
  globalShortcut.unregisterAll()
  globalShortcut.register(_shortcut, event);
  console.log(_shortcut)
  changeShort('keys', shortcut)
}
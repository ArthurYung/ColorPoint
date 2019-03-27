const { connect } = require('./store/index.js')
const { ipcRenderer } = require( "electron" );
const Keyboard = require('./home/keyboard')
const ColorHistory = require('./home/colorHistory')
const size = {width: screen.availWidth, height: screen.availHeight}

const startCapture = ()=> {
  ipcRenderer.send('start-point', size)
}

ipcRenderer.on('shortcut-show', startCapture)

connect([{
  subs: ['DEFAULTE_KEYS'],
  object: new Keyboard({
    el: document.querySelector('.mixin-keyboard'),
    start: startCapture
  })
}, {
  subs: ['HISTORY_COLOR'],
  object: new ColorHistory({
    el: document.querySelector('.mixin-colors')
  })
}])
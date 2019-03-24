// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { mutation } = require('./store/index.js')
const { ipcRenderer, desktopCapturer } = require( "electron" );
const resetKey = require('./home/resetKey')

const size = {width: screen.width, height: screen.height}

const ResetKey = new resetKey()

const beforeCapture = () => {
  ipcRenderer.send('hide-main', size)
}

sessionStorage.setItem('test', 'istest')

const startCapture = ()=> {
  desktopCapturer.getSources({types: ['screen'], thumbnailSize: size}, function(error, sources) {
    if (error) throw error;
    mutation({
      type: 'PREVIEW_IMAGE',
      payload: sources[0].thumbnail.toDataURL(),
      arg: size
    })
  })
}

document.getElementById('start').addEventListener('click', beforeCapture)

ipcRenderer.on('async-hided', startCapture)

ipcRenderer.on('shortcut-show', beforeCapture)
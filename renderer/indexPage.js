// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { mutation} = require('./store')
const { ipcRenderer, desktopCapturer, clipboard } = require( "electron" );
const resetKey = require('./home/resetKey')

const size = {width: screen.width, height: screen.height}

const ResetKey = new resetKey()

const beforeCapture = () => {
  ipcRenderer.send('hide-main', size)
}

const startCapture = ()=> {
  desktopCapturer.getSources({types: ['screen'], thumbnailSize: size}, function(error, sources) {
    if (error) throw error;
    mutation({name: 'CURRENT_IMG', value: sources[0].thumbnail.toDataURL()})
    clipboard.writeImage(sources[0].thumbnail)
    ipcRenderer.send('create-pick-window', size)
  })
}

document.getElementById('start').addEventListener('click', beforeCapture)

ipcRenderer.on('async-hided', startCapture)

ipcRenderer.on('shortcut-show', beforeCapture)
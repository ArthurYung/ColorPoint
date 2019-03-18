// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { mutation} = require('./store')

const { ipcRenderer, desktopCapturer, clipboard } = require( "electron" );

const w = screen.width
const h = screen.height

document.getElementById('click').addEventListener('click', ()=>{
  ipcRenderer.send('hide-main', {x: w, y: h})
  desktopCapturer.getSources({types: ['screen'], thumbnailSize: {width: w, height: h}}, function(error, sources) {
    if (error) throw error;
    mutation({name: 'CURRENT_IMG', value: sources[0].thumbnail})
    ipcRenderer.send('create-pick-window', {w, h})
  })
})
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { mutation} = require('./store')
const { ipcRenderer, desktopCapturer } = require( "electron" );
const ShortKeys = require('./shortKey')

const size = {width: screen.width, height: screen.height}

const $click = document.getElementById('click')
const $ok = document.getElementById('ok')
const $input = document.getElementById('trues')




let short = new ShortKeys($input)


const beforeCapture = () => {
  ipcRenderer.send('hide-main', size)
}

const startCapture = ()=> {
  desktopCapturer.getSources({types: ['screen'], thumbnailSize: size}, function(error, sources) {
    if (error) throw error;
    mutation({name: 'CURRENT_IMG', value: sources[0].thumbnail.toDataURL()})
    ipcRenderer.send('show-pick-window', size)
  })
}

$click.addEventListener('click', beforeCapture)
$ok.addEventListener('click', function() {
  changeShort('start',$input.value)
  console.log(changeShort)
})

ipcRenderer.on('async-hided', startCapture)

ipcRenderer.on('shortcut-show', beforeCapture)
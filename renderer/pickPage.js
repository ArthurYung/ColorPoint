const { ipcRenderer, desktopCapturer } = require( "electron" );
const { getStore } = require('./store')


class App {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.addEventBody()
  }
  _init() {
    this.w = document.body.clientWidth
    this.h = document.body.clientHeight
    this.data = getStore('CURRENT_IMG')
    this.canvas.width = this.w
    this.canvas.height = this.h
    let img = new Image()
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, this.w, this.h)
    }
    img.src = this.data
  }
  addEventBody() {
    document.body.addEventListener('click', function () {
      ipcRenderer.send('close-pick-window')
    })
  }
}

const app = new App()
ipcRenderer.on('pick-img-init', ()=> {
  app._init()
})

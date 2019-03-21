const { ipcRenderer, desktopCapturer } = require( "electron" );
const { getStore } = require('./store')


class App {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.addEventBody()
    this._init()
  }
  _init() {
    this.data = getStore('CURRENT_IMG')
    let img = new Image()
    img.onload = () => {
      this.canvas.width = img.width
      this.canvas.height = img.height
      this.ctx.drawImage(img, 0, 0, img.width, img.height)
    }
    img.src = this.data
  }
  send (action, arg) {
    ipcRenderer.send(action, arg)
  }
  addEventBody() {
    document.body.addEventListener('click', () => {
      this.send('close-pick-window')
    })
  }
}
const app = new App()

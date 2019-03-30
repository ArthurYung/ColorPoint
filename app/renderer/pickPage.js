const { ipcRenderer, desktopCapturer, clipboard } = require( "electron" );
const { mutation } = require('./store')
class App {
  constructor(opt) {
    this.size = {
      width: screen.width,
      height: screen.height
    }
    this.inputLabel = [{
      value: 1,
      text: '十六进制'
    }, {
      value: 2,
      text: 'RGBA'
    }]
    this.imgData = []
    this.clipData = []
    this.radius = 60
    this.range = 14
    this.valueType = 1
    this.inMenu = false
    this.currentColor = ''
    this.clipRange = Math.ceil((2 * this.radius) / this.range)
    this.view = opt.el || document.body
    this._init()
  }
  _init() {
    this.drawEvent = this.drawEvent.bind(this)
    this.hideClip = this.hideClip.bind(this)
    this.showClip = this.showClip.bind(this)
    this.changeType = this.changeType.bind(this)
    this.menuToggle = this.menuToggle.bind(this)
    this.handleSend = this.handleSend.bind(this)
    this.playVideo = this.playVideo.bind(this)
    this.createCanvas()
    this.createMenu()
    this.addEventListener()
  }
  createCanvas() {
    this.video = document.createElement('video')
    this.video.autoplay = 'autoplay'
    this.background = document.createElement('canvas')
    this.clipView = document.createElement('div')
    this.colorValue = document.createElement('span')
    this.canvas = document.createElement('canvas')
    this.bg = this.background.getContext('2d')
    this.ctx = this.canvas.getContext('2d')
    this.background.width =  this.size.width
    this.background.height =  this.size.height
    this.canvas.width = this.canvas.height = 2 * this.radius
    this.clipView.className = 'clip-view'
    this.clipView.style.width = `${2 * this.radius}px`
    this.clipView.style.height = `${2 * this.radius}px`
    this.clipView.style.left = `-${this.radius}px`
    this.clipView.style.top = `-${this.radius}px`
    this.clipView.appendChild(this.canvas)
    this.clipView.appendChild(this.colorValue)
  }

  createMenu() {
    this.menu = document.createElement('div')
    this.button = document.createElement('a')
    this.button.className = 'menu-show'
    this.menu.className = 'menu-view'
    this.labels = this.createLable()
    this.labels.forEach(label => {
      this.menu.appendChild(label)
    })
    this.menu.appendChild(this.button)
  }

  createLable () {
    let labels = []
    this.inputLabel.forEach(label => {
      let div = document.createElement('div')
      div.className = 'canvas-label'
      div.setAttribute('data-value', label.value)
      div.innerHTML =  `
        <span class="${label.value === this.valueType ? 'checked-value' : ''}"></span>
        <span class="label-text">${label.text}</span>
      `
      labels.push(div)
    })
    return labels
  }

  start() {
    this.imgGeted = false
    this.exitProject()
    this.getScreenImage()
  }
  
  getScreenImage() {
      desktopCapturer.getSources({
        types: ['screen'], 
        thumbnailSize: {width: 1,height: 1}
      }, (err, sources) => {
        if (err) {
          return reject(err) 
        }
        navigator.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sources[0].id,
              minWidth: this.size.width,
              minHeight: this.size.height,
              maxWidth: this.size.width,
              maxHeight: this.size.height,
            },
          }
        },
        stream => {
          this.video.setAttribute('src', URL.createObjectURL(stream));
        },
        err => {console.log(err)})
      })
  }

  playVideo() {
    this.video.pause()
    this.bg.drawImage(this.video, 0, 0, this.size.width, this.size.height)
    this.imgData = this.bg.getImageData(0, 0, this.size.width, this.size.height)
    this.imgGeted = true
    this.view.appendChild(this.background)
    // this.view.appendChild(this.clipView)
    document.body.appendChild(this.menu)
  }

  addEventListener() {
    this.video.addEventListener('play', this.playVideo)
    this.background.addEventListener('mouseenter', this.showClip)
    this.menu.addEventListener('mouseenter', this.hideClip)
    this.button.addEventListener('click', this.menuToggle)
    this.canvas.addEventListener('click', this.handleSend)
    this.labels.forEach(label => {
      label.addEventListener('click', this.changeType)
    })
    document.body.addEventListener('mousemove', this.drawEvent)
  }

  hideClip() {
    this.view.removeChild(this.clipView)
    this.inMenu = true
  }

  showClip(e) {
    this.inMenu = false
    this.setPosition(e)
    this.getClipData()
    this.drawPoint()
    this.view.appendChild(this.clipView)
  }

  changeType(e) {
    let target = e.target
    while (target !== document.body) {
      if (target.dataset.value) {
        this.valueType = +target.dataset.value
        this.changeClass()
        break
      }
      target = target.parentNode
    }
  }

  changeClass() {
    document.querySelectorAll('.checked-value').forEach(dom => {
      dom.className = ''
    })
    this.menu.querySelector(`div[data-value="${this.valueType}"]`).firstElementChild.className = 'checked-value'
  }

  menuToggle(e) {
    if (this.button.className === 'menu-show') {
      this.button.className = 'menu-hide'
      this.menu.classList.add('hide-view')
    } else {
      this.button.className = 'menu-show'
      this.menu.classList.remove('hide-view')
    }
  }

  drawEvent(e) {
    if (!this.imgGeted || this.inMenu) return
    this.setPosition(e)
    this.getClipData()
    this.drawPoint()
  }

  setPosition(e) {
    this.point = {
      x: e.clientX,
      y: e.clientY
    }
    this.current = {
      x: e.clientX - this.background.offsetLeft,
      y: e.clientY - this.background.offsetTop
    }
  }

  getClipData () {
    this.clipData = []
    let [x, y] = [~~(this.current.x - this.radius / this.range), ~~(this.current.y - this.radius / this.range)]
    let data = this.imgData.data
    let index, r, g, b, a
    for (let i = 0; i < this.clipRange; i ++) {
      for (let j = 0; j < this.clipRange; j ++) {
        index = ~~((y + i) * this.imgData.width + x + j)
        r = data[index * 4 + 0]
        g = data[index * 4 + 1]
        b = data[index * 4 + 2]
        a = data[index * 4 + 3] / 255
        this.clipData.push(`rgba(${r}, ${g}, ${b}, ${a})`)
      }
    }
  }

  drawPoint () {
    let ctx = this.ctx
    let resize = this.radius * 2 - this.range * this.clipRange
    let length = this.clipData.length
    let current = ~~(length / 2)
    let x, y, cp = {}
    this.clipView.style.transform = `translate(${this.point.x}px, ${this.point.y}px)`
    ctx.save()
    for (let i = 0 ; i < length; i ++) {
      y = ~~(i / this.clipRange)
      x = i - y * this.clipRange
      if (i === current) {
        cp = {
          x: x * this.range + resize,
          y: y * this.range + resize
        }
      } else {
        ctx.lineWidth = 0.4
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'
        ctx.fillStyle = this.clipData[i]
        ctx.fillRect(x * this.range + resize, y * this.range + resize, this.range, this.range)
        ctx.strokeRect(x * this.range + resize, y * this.range + resize, this.range, this.range)
        ctx.restore() 
      }
    }
    ctx.lineWidth = 2
    ctx.strokeStyle = '#fc04db'
    ctx.fillStyle = this.clipData[current]
    ctx.fillRect(cp.x, cp.y, this.range, this.range)
    ctx.strokeRect(cp.x, cp.y, this.range, this.range)
    ctx.restore()
    this.setValue(this.clipData[current])
  }
  setValue(val) {
    let text = ''
    if (this.valueType === 1) {
      text = '#'
      val.replace(/^(rgba\()(.*)(\))$/,'$2').split(',').forEach((color, i) => {
        if (i === 3) return
        let int = parseInt(color, 10).toString(16)
        text += int.length === 1 ? `0${int}` : int
      })
    } else {
      text = val
    }
    this.currentColor = text
    this.colorValue.innerText = text
  }

  handleSend () {
    mutation({
      type: 'HISTORY_COLOR',
      payload: this.currentColor
    })
    clipboard.writeText(this.currentColor)
    this.exitProject()
    setTimeout(()=>{
      ipcRenderer.send('close-pick-window')
      ipcRenderer.send('show-notification')
    }, 30)
  }

  exitProject() {
    this.valueType = 1
    this.inMenu = false
    this.currentColor = ''
    this.changeClass()
    if (this.menu.parentNode === document.body) {
      document.body.removeChild(this.menu)
    }
    if (this.clipView.parentNode === this.view) {
      this.view.removeChild(this.clipView)
    }
    if (this.background.parentNode === this.view) {
      this.view.removeChild(this.background)
    }
  }
}
const app = new App({
  el: document.querySelector('.view')
})

ipcRenderer.on('start-point-pr', function() {
  app.start()
})

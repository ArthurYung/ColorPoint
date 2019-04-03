const { ipcRenderer, desktopCapturer, clipboard } = require( "electron" );
const { mutation } = require('./store')

const getRGB = (str) => {
  if (!str) return [,,,]
  const [r, g, b] = str.replace(/^(rgba\()(.*)(\))$/, '$2').split(',')
  return [r, g, b]
}

const colorFormat = color => {
  if (color >= 255) {
    return '+'
  }
  if (color < 0) {
    return '-'
  }
  return Math.round(color)
}

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
    }, {
      value: 3,
      text: '(rgba)透明度'
    }]
    this.startType = false
    this.imgData = []
    this.clipData = []
    this.radius = 80
    this.range = 11
    this.valueType = 1
    this.inMenu = false
    this.currentColor = ''
    this.clipRange = Math.ceil((2 * this.radius) / this.range)
    this.view = opt.el || document.body
    this._init()
  }
  _init() {
    this.createCanvas()
    this.createMenu()
    this.createProxy()
    this.addEventListener()
  }

  createProxy() {
    let self = this
    this.alpha = new Proxy({}, {
      set(proxy, key, value) {
        self.changeRanger(key, value)
        proxy[key] = value
        return true
      }
    })
  }

  changeRanger(key, value) {
    if (key === 'opacity') {
      this.input.getElementsByTagName('span')[0].innerText = value
      this.input.getElementsByTagName('input')[0].value = value * 10
    }
    if (key === 'background') {
      this.input.getElementsByTagName('i')[0].style.background = value
    }
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
    this.input = this.createRanger()
    this.labels.forEach(label => {
      this.menu.appendChild(label)
    })
    this.menu.appendChild(this.button)
    this.menu.appendChild(this.input)
  }

  createRanger() {
    let div = document.createElement('div')
    let input = document.createElement('input')
    let value = document.createElement('span')
    let background = document.createElement('i')
    div.className = 'range-box'
    input.type = 'range'
    input.value = 5
    input.min = 0
    input.max = 10
    div.appendChild(background)
    div.appendChild(input)
    div.appendChild(value)
    this.bindEvent(background, 'click', function() {
      if (this.valueType !== 3) return
      this.alpha.background = this.alpha.background === 'rgba(255,255,255,1)' ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)'
    })
    this.bindEvent(input, 'input', function(e) {
      if (this.valueType !== 3) return
      this.alpha.opacity = e.target.value / 10
    })
    return div
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

  start(type) {
    this.startType = type
    this.imgGeted = false
    this.background.width =  this.size.width
    this.background.height =  this.size.height
    this.canvas.width = this.canvas.height = 2 * this.radius
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
    this.video.src = ""
    document.body.appendChild(this.menu)
    this.alpha.background = 'rgba(255,255,255,1)'
    this.alpha.opacity = 0.5
  }

  bindEvent(el, type, fn) {
    fn = fn.bind(this)
    el = typeof el === 'string' ? this[el] : el
    el.addEventListener(type, fn)
  }

  addEventListener() {
    this.bindEvent('video', 'play', this.playVideo)
    this.bindEvent('background', 'mouseenter', this.showClip)
    this.bindEvent('menu', 'mouseenter', this.hideClip)
    this.bindEvent('button', 'click', this.menuToggle)
    this.bindEvent('canvas', 'mousedown', this.handleMousedown)
    this.labels.forEach(label => {
      this.bindEvent(label, 'click', this.changeType)
    })
    this.bindEvent(document.body, 'mousemove', this.drawEvent)
  }

  hideClip() {
    if (this.clipView.parentNode === this.view) {
      this.view.removeChild(this.clipView)
    }
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
    if (this.valueType === 3) {
      this.input.classList.add('is-alpha')
    } else {
      this.input.classList.remove('is-alpha')
    }
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
    if (!data) return
    for (let i = 0; i < this.clipRange; i ++) {
      for (let j = 0; j < this.clipRange; j ++) {
        index = ~~((y + i) * this.imgData.width + x + j)
        r = data[index * 4 + 0]
        g = data[index * 4 + 1]
        b = data[index * 4 + 2]
        a = data[index * 4 + 3] / 255
        this.clipData.push(`rgba(${r},${g},${b},${a})`)
      }
    }
  }

  drawPoint () {
    let ctx = this.ctx
    let resize = this.radius - this.range * this.clipRange / 2
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
    this.currentRGB = getRGB(val)
    if (this.valueType === 1) {
      text = '#'
      this.currentRGB.forEach(color => {
        let int = parseInt(color, 10).toString(16)
        text += int.length === 1 ? `0${int}` : int
      })
    } else if (this.valueType === 2) {
      text = val
    } else if (this.valueType === 3) {
      let [r, g, b] = getRGB(val)
      let [r1, g1, b1] = getRGB(this.alpha.background)
      let r2, g2, b2, a2 = this.alpha.opacity
      r2 = colorFormat((r - r1 * (1 - a2)) / a2)
      g2 = colorFormat((g - g1 * (1 - a2)) / a2)
      b2 = colorFormat((b - b1 * (1 - a2)) / a2)
      text = `rgba(${r2},${g2},${b2},${a2})`
    }
    this.currentColor = text
    this.colorValue.innerText = text
  }


  handleMousedown(e) {
    if (e.button == 2 && this.valueType == 3) {
      this.alpha.background = `rgba(${this.currentRGB[0]},${this.currentRGB[1]},${this.currentRGB[2]},1)`
    }
    if (e.button == 0) {
      this.handleSend()
    }
  }

  handleSend () {
    mutation({
      type: 'HISTORY_COLOR',
      payload: this.currentColor
    })
    clipboard.writeText(this.currentColor)
    this.exitProject()
    setTimeout(()=>{
      ipcRenderer.send('close-pick-window', this.startType)
      ipcRenderer.send('show-notification')
    }, 30)
  }

  exitProject() {
    this.valueType = 1
    this.inMenu = false
    this.currentColor = ''
    this.changeClass()
    this.imgData = []
    this.clipData = []
    this.canvas.width = this.canvas.height = 0
    this.background.width = this.background.height = 0
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // this.bg.clearRect(0, 0, this.background.width, this.background.height)
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

ipcRenderer.on('start-point-pr', function(event, type) {
  app.start(type)
})

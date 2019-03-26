const { ipcRenderer, desktopCapturer } = require( "electron" );
class App {
  constructor() {
    this._init()
  }
  _init() {
    this.video = document.createElement('video')
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.size = {width: screen.width, height: screen.height}
    this.canvas.setAttribute('style', 'cursor: pointer')
    this.addEventListener()
  }
  start() {
    this.getScreenImage()
  }
  asyncScreenImage() {
    return new Promise((resolve, reject) => {
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
        stream => {resolve(stream)},
        err => {reject(err)})
      })
    })
  }
  getScreenImage() {
    let self = this
    document.body.style.cursor = 'none'
    this.asyncScreenImage().then(stream => {
      self.video.addEventListener('play', function() {
        self.video.pause();
        self.canvas.setAttribute('width', self.size.width);
        self.canvas.setAttribute('height', self.size.height);
        self.ctx.drawImage(self.video, 0, 0, self.size.width, self.size.height);
        document.body.appendChild(self.canvas)
      });

      self.video.addEventListener('canplay', function() {
        self.video.play();
      });
      self.video.setAttribute('src', URL.createObjectURL(stream));
    }).catch(err => {
      console.log(err)
    })
  }
  addEventListener() {
    this.canvas.addEventListener('click', () => {
      document.body.removeChild(this.canvas)
      ipcRenderer.send('close-pick-window')
    })
  }
}
const app = new App()

ipcRenderer.on('start-point-pr', function() {
  app.start()
})

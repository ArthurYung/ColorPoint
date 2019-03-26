const AppExtend = require('./appExtends')
const { getter, mutation } = require('../store')
class ColorHistory extends AppExtend {
  constructor(opt) {
    super()
    this.view = opt.el || document.body
    this.init()
  }
  init () {
    this.proxy()
    this.bind()
    this._render()
    this.colors.render = getter('HISTORY_COLOR')
  }
  proxy () {
    let self = this
    this.colors = new Proxy({}, {
      set(proxy, key, value) {
        proxy[key] = value
        self.colorRender(value)
        return true
      },
      get(proxy, key) {
        return proxy[key]
      }
    })
  }

  dispatch(action) {
    this.colors.render = action.payload
  }

  _render() {
    this.view.innerHTML = this.render()
  }

  bindEvent() {
    let self = this
    return {
      clicks: {
        handleClick () {
          mutation({
          type: 'HISTORY_COLOR',
          payload: []
        })
        },
        chooseColor (event) {
          const color = event.target.dataset.color
          if (color) {
            event.stopPropagation()
          }
        }
      }
    }
  }

  colorRender(colors) {
    let LISTS = ''
    colors.forEach(color => {
      LISTS += `<span style="background-color:${color}" data-color="${color}" class="color-list"></span>`
    })
    this.find('.color-view') && (this.find('.color-view').innerHTML = LISTS)
  }

  render() {
    return `
    <div class="history-view">
      <div class="main-title">
        <span class="main-text color-title">History colors</span>
      </div>
      <div class="color-view" data-click="chooseColor"></div>
      <button data-click="handleClick" class="button delete-all"><i class="icon icon-delete"></i></button>
    </div>`
  }
}

module.exports = ColorHistory
const ShortKeys = require('./shortKey')
const AppExtend = require('./appExtends')
const { getter, mutation } = require('../store')
class KeyboardApp extends AppExtend {
  constructor(opt) {
    super()
    this.view = opt.el || document.body
    this.start = opt.start || new Function()
    this.shortKey = new ShortKeys()
    this.keyboard = getter('DEFAULTE_KEYS')
    this.buttonText = "Start Picking Colors"
    this.type = 1
    this.init()
  }
  init() {
    this.bind()
    this._render()
    this.shortKey.onkeypress(value => {
      if (value === '') {
        value = 'Shortcut keys is null'
      }
      this.keyboard = value
      this.find('.keyboard-view') && (this.find('.keyboard-view').value = value)
    })
  }
  
  _render() {
    this.view.innerHTML = this.render()
    this.bindOthre()
  }
  switch() {
    this.type = this.type === 1 ? 2 : 1
    this._render()
  }
  bindEvent() {
    let self = this
    return {
      clicks: {
        handleClick () {
          self.switch()
        },
        handleStart () {
          self.start()
        }
      },
      focus: {
        handleFocus (e) {
          e.target.parentNode.classList.add('reset-input-focus')
          self.shortKey.onFocus()
        }
      },
      blur: {
        handleBlur (e) {
          e.target.parentNode.classList.remove('reset-input-focus')
          self.shortKey.onBlur()
          mutation({
            type: 'DEFAULTE_KEYS',
            payload: self.keyboard
          })
        }
      }
    }
  }
  dispatch(action) {
    this.keyboard = action.payload
  }
  render() {
    if (this.type === 1) {
      return `
      <div class="start-view">
        <div class="start-btn" data-click="handleStart">
          <div class="button-text">${this.buttonText}</div>
          <div class="button-juder">${this.keyboard}</div>
        </div>
        <button data-click="handleClick" class="button reset-key"><i class="icon icon-reset"></i></button>
      </div>`
    } else {
      return `
      <div class="start-view">
        <div class="reset-input">
          <input data-focus="handleFocus" data-blur="handleBlur" value="${this.keyboard}" type="text" class="keyboard-view">
        </div>
        <button data-click="handleClick" class="button reset-key"><i class="icon icon-reset"></i></button>
      </div>`
    }
  }
}

module.exports = KeyboardApp
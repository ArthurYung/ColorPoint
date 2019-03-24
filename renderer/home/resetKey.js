const ShortKeys = require('./shortKey')
const { getter, mutation } = require('../store/index.js')
const { ipcRenderer } = require('electron')

class ResetKey {
  constructor () {
    this.VIEW = document.getElementById('short')
    this.SUBMIT = document.getElementById('update')
    this.shortKey = new ShortKeys()
    this.cacheKey = ''
    this.init()
  }

  init () {
    this.bindEvent()
    this.getAppShort()
    this.shortKey.onkeypress((keys) => {
      this.cacheKey = keys
      this.render()
    })
  }

  bindEvent () {
    this.VIEW.addEventListener('focus', this.focused.bind(this))
    this.VIEW.addEventListener('blur', this.blurred.bind(this))
    this.SUBMIT.addEventListener('click', this.submitKey.bind(this))
  }

  getAppShort () {
    this.cacheKey = getter('DEFAULTE_KEYS')
    this.render()
  }

  focused () {
    this.shortKey.onFocus()
  }

  blurred () {
    this.shortKey.onBlur()
    if (this.VIEW.value === '') {
      this.getAppShort()
    }
  }

  submitKey () {
    mutation({
      type: 'DEFAULTE_KEYS',
      payload: this.cacheKey
    })
  }

  render () {
    this.VIEW.value = this.cacheKey
  }

}

module.exports = ResetKey
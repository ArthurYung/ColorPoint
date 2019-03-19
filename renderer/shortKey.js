const { changeShort, getShort } = require('../utils/db')


class ShortKeys{
  constructor(dom) {
    this.view = dom
    this.keys = []
    this.currKey = []
    this.init()
  }
  init() {
    this.proxyFn()
    this.addEventKey()
  }
  _formatter (key) {
    return key.toLowerCase().replace(/^[a-z]/, $1=>$1.toUpperCase());
  }
  proxyFn() {
    let self = this
    this.proxyData = new Proxy([], {
      set (proxy, key, value) {
        proxy[key] = value
        self.view.value = proxy.join('+')
        return true
      }
    })
  }
  push(key) {
    key = this._formatter(key)
    if (this.proxyData.includes(key)) return
    this.proxyData.push(key)
    this.currKey.push(key)
  }
  empty() {
    this.proxyData.length = 0
  }
  addEventKey() {
    document.onkeydown = e => {
      e.preventDefault()
      if (this.currKey.length === 0) {
        this.proxyData.length = 0
      }
      this.push(e.key)
    }
    document.onkeyup = e => {
      const key = this._formatter(e.key)
      const index = this.currKey.indexOf(key)
      if (index >= 0) {
        this.currKey.splice(index, 1)
      }
    }
  }

  resetData() {
    // this.proxyData = {
    //   length: 0
    // }
    // const defaults = getShort('keys').split('+')
    // this._set(defaults)
  }
}

module.exports = ShortKeys
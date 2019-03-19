const { changeShort, getShort } = require('../utils/db')
const os = require('os')

const commands = ['command', 'control', 'shift','capslock', 'alt', 'enter', 'delete', 'backspace']
const locals = [
  'A', 'B', 'C', 'D', 'E', 'F','G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N', 
  'O', 'P', 'Q', 'R', 'S', 'T', 
  'U', 'V', 'W', 'X', 'Y', 'Z',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  '-', '='
  ]

const _KEY_ = /^(Key)/
const _DIG_ = /^(Digit)/
const _COM_ = /^(Meta)/
const _SHF_ = /^(Shift)(.*)/
const _ALT_ = /^(Alt)(.*)/
class ShortKeys{
  constructor(dom) {
    this.view = dom
    this.keys = []
    this.currKey = []
    this.os = os.platform()
    this.init()
  }
  init() {
    this.proxyFn()
    this.addEventKey()
  }
  _formatter (key) {
    if (_KEY_.test(key)) {
      key = key.replace(_KEY_, '')
    } 
    if (_DIG_.test(key)) {
      key = key.replace(_DIG_, '')
    }
    if (_SHF_.test(key)) {
      key = key.replace(_SHF_, '$1')
    }
    if (_ALT_.test(key)) {
      key = key.replace(_ALT_, '$1')
    }
    if (_COM_.test(key)) {
      key = 'command'
    }
    return key.toLowerCase().replace(/^[a-z]/, $1=>$1.toUpperCase());
  }
  proxyFn() {
    let self = this
    this.proxyData = new Proxy({}, {
      set (proxy, key, value) {
        proxy[key] = value
        if (value) self.proxy()
        return true
      }
    })
  }
  proxy() {
    let matchKeys = []
    commands.map(com => {
      com = this._formatter(com)
      if (this.proxyData[com] && matchKeys.length < 4) {
        matchKeys.push(com)
      }
    })
    if (matchKeys.length < 4) {
      let i = locals.length
      while(i--) {
        if (this.proxyData[locals[i]]) {
          matchKeys.push(locals[i])
          break
        }
      }
    }
    this.view.value = matchKeys.join('+')
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
      
      let key = this._formatter(e.code)
      this.proxyData[key] = true
    }
    document.onkeyup = e => {
      console.log(e.code)
      let key = this._formatter(e.code)
      this.proxyData[key] = false
    }
    document.onkeypress = e => {
      // console.log(e)
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
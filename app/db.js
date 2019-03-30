const low = require('lowdb')
const { resolve } = require('path')
const FileSync = require('lowdb/adapters/FileSync')
const json = resolve(__dirname, 'db.json')

const adapter = new FileSync(json)
const db = low(adapter)

const isMac = process.platform === 'darwin'
const defaultShort = `${isMac ? 'Command' : 'Control'}+Alt+G`

db.defaults({ shortcut: defaultShort, colors: [] }).write()

exports.changeShort = key => {
  db.set('shortcut', key).write()
}

exports.getShort = () => {
  return db.get('shortcut').value()
}

exports.pushColor = color => {
  if (Array.isArray(color) && color.length === 0) {
    return db.set('colors', []).write()
  }
  const _COLOR_ = db.get('colors')
  const size = _COLOR_.size().value()
  if (size >= 9) {
    _COLOR_.remove(_COLOR_.first().value()).write()
  }
  _COLOR_.push({
    ID: Date.now().toString(),
    value: color
  }).write()
}

exports.getColor = () => {
  return db.get('colors').value().map(color => {
    return color.value
  })
}

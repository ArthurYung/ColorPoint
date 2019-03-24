const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ shortcut: {}, colors: [] }).write()

exports.changeShort = (name, key) => {
  db.set('shortcut.' + String(name), key).write()
}

exports.getShort = name => {
  return db.get('shortcut.' + String(name)).value()
}

exports.pushColor = color => {
  const _COLOR_ = db.get('colors')
  const size = _COLOR_.size().value()
  if (size >= 5) {
    _COLOR_.remove(_COLOR_.first().value()).write()
  }
  _COLOR_.push({
    ID: Date.now().toString(),
    value: color
  }).write()
}

exports.getColor = () => {
  return db.get('colors').value()
}

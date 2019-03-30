const { getShort, getColor } = require('./db')

const DEFAULTE_KEYS = 'DEFAULTE_KEYS'
const HISTORY_COLOR = 'HISTORY_COLOR'

const actions = [
  {
    type: DEFAULTE_KEYS,
    default: getShort()
  },
  {
    type: HISTORY_COLOR,
    default: getColor()
  }
]



module.exports = { actions, DEFAULTE_KEYS, HISTORY_COLOR }
const { getShort, getColor } = require('./db')

const PREVIEW_IMAGE = 'PREVIEW_IMAGE'
const DEFAULTE_KEYS = 'DEFAULTE_KEYS'
const HISTORY_COLOR = 'HISTORY_COLOR'

const actions = [{
    type: PREVIEW_IMAGE,
    default: ''
  },
  {
    type: DEFAULTE_KEYS,
    default: getShort('keys')
  },
  {
    type: HISTORY_COLOR,
    default: getColor()
  }
]



module.exports = { actions, PREVIEW_IMAGE, DEFAULTE_KEYS, HISTORY_COLOR }
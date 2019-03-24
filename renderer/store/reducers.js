const homepage = (action) => {
  if (action.type === 'HISTORY_COLOR') {
    return action.payload
  }
}

module.exports = {setImage, getImage}
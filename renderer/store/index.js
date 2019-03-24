const { remote, ipcRenderer } = require( "electron" );

const mutation = (action)=>{
  ipcRenderer.send('connct-store-context', action)
}

const getter = (key) => {
  return remote.getGlobal( "Store" )[key]
}

const connect = (App, reducer, opt = {}) => {
  ipcRenderer.on('connct-store-provide', (event, action) => {
    App.dispatch(action)
  })
  App.prototype.dispatch = reducer
  return new App(opt, reducer)
}

module.exports = {mutation, getter, connect}
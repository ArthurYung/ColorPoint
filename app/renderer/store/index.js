const { remote, ipcRenderer } = require( "electron" );

const mutation = (action)=>{
  ipcRenderer.send('connct-store-context', action)
}

const getter = (key) => {
  return remote.getGlobal( "Store" )[key]
}

const connect = (apps = []) => {
  ipcRenderer.on('connct-store-provider', (event, action) => {
    apps.forEach(app => {
      if (app.subs.includes(action.type)) {
        app.object.dispatch(action)
      }
    })
  })
}

module.exports = {mutation, getter, connect}
const { ipcRenderer, remote } = require( "electron" );

const mutation = ({name, value})=>{
  ipcRenderer.send('mutation-global', {name, value})
}

const getStore = name => {
  return remote.getGlobal( "myGlobalVariable" )[name]
}

module.exports = {mutation, getStore}
const { Menu } = require('electron')
const { platform } = require('process')
const isMac = platform === 'darwin'

const trayTemplate = [
  {
    label: 'Help',
    role: 'help'
  },
  {
    label: 'Quit',
    role: 'quit'
  }
]


exports.menuBuild = unshiftFn => {
  trayTemplate.unshift({
    label: 'Start',
    click: unshiftFn
  })
  return  Menu.buildFromTemplate(trayTemplate)
} 

exports.createMenu = () => {
  const template = [
    {
      label: 'Color Point',
      submenu: [
        { role: 'help'},
        { role: 'quit'}
      ]
    },
    {
      label: 'Help',
      role: 'help'
    },
    {
      label: 'Quit',
      role: 'quit'
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  if (isMac) {
    Menu.setApplicationMenu(menu)
  } else {
    Menu.setApplicationMenu(null)
  }
}




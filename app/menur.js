const { Menu, app, BrowserWindow } = require('electron')
const { platform } = require('process')
const isMac = platform === 'darwin'


exports.menuBuild = (main, start) => {
  trayTemplate = [
    {
      label: 'Start',
      click: start
    },
    {
      label: 'Show',
      click () {
        main.show()
      }
    },
    {
      label: 'Help',
      click() {
        console.log(BrowserWindow.getAllWindows())

      }
    },
    {
      label: 'Quit',
      click () {
        main.destroy()
      }
    }
  ]
  return  Menu.buildFromTemplate(trayTemplate)
} 

exports.createMenu = (main) => {
  const template = [
    {
      label: 'Color Point',
      submenu: [
        {
          label: 'Help',
          role: 'help'
        },
        {
          label: 'Quit',
          click () {
            main.destroy()
          }
        }
      ]
    },
    {
      label: 'Help',
      role: 'help'
    },
    {
      label: 'Quit',
      click () {
         main.destroy()
      }
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  if (isMac) {
    Menu.setApplicationMenu(menu)
  } else {
    Menu.setApplicationMenu(null)
  }
}




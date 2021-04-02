// Modules to control application life and create native browser window
const {app, BrowserWindow, BrowserView} = require('electron')

const { markets, defaultMainWindowHeight, defaultMainWindowWidth} = require("./config.json")

app.commandLine.appendSwitch('disable-site-isolation-trials')

const subWindowWidth = 800;
const subWindowHeight = 270;

let views = [];
let mainBrowserWindow;

function setAllWindowBounds(mainWindowWidth) {
  const maxSubPerMainWidth = Math.floor(mainWindowWidth/subWindowWidth);
  let y = 0;
  for (let i = 0; i < views.length; i++) {
    mainBrowserWindow.removeBrowserView(views[i])
    const remain = i % maxSubPerMainWidth;
    const x = remain*subWindowWidth;
    if ( remain === 0 && i >= maxSubPerMainWidth) {
      y += subWindowHeight;
    } 
    views[i].setBounds({ x: x, y: y, width: subWindowWidth, height: subWindowHeight });
    views[i].webContents.executeJavaScript(`
    document.getElementsByClassName("orderscontainer")[0].scrollIntoView();
        `)
    mainBrowserWindow.addBrowserView(views[i])
  }
}

function generateViews(mainWindow) {
  for (let i = 0; i < markets.length; i++) {
    let market = markets[i];

    const view = new BrowserView();
    mainWindow.addBrowserView(view);
    views.push(view)
    
    view.webContents.loadURL(`https://tradeogre.com/exchange/${market}`)

    view.webContents.on('dom-ready', () => {
      view.webContents.insertCSS(`* {
          visibility: hidden;
      }
      .orderscontainer * {
          visibility: initial;
      }
      body {
        overflow: hidden;
      }
      `)
    })
  }
  setAllWindowBounds(defaultMainWindowWidth);
}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: defaultMainWindowWidth,
    height: defaultMainWindowHeight,
    webPreferences: {
      webSecurity: false
    }
  })

  mainBrowserWindow = mainWindow;
  generateViews(mainWindow);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
  mainWindow.on("resize", () => {
    console.log("Beginning resize event")
    setAllWindowBounds(mainWindow.getSize()[0]);
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

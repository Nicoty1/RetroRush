const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 480,
    fullscreen: true,
    webPreferences: {
      // Hier wird standardmäßig kein Node-Integration erlaubt,
      // du kannst aber auch nodeIntegration: true setzen, falls nötig.
      contextIsolation: true
      //preload: path.join(__dirname, 'preload.js'), // falls du einen Preload-Script nutzen möchtest
    }
  });

  win.loadFile('index.html');
  // Optional: DevTools öffnen
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 480,
    fullscreen: true,
    webPreferences: {
      // Hier wird standardmäßig kein Node-Integration erlaubt,
      // du kannst aber auch nodeIntegration: true setzen, falls nötig.
      contextIsolation: false,
      nodeIntegration: true
      //preload: path.join(__dirname, 'preload.js'), // falls du einen Preload-Script nutzen möchtest
    }
  });
  win.loadFile(path.join(__dirname, 'splash.html'));
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

// IPC-Handler zum Beenden der App
ipcMain.on('app-exit', () => {
  console.log("app-exit empfangen")
  app.quit();
});

// IPC-Handler zum Herunterfahren des Raspberry Pi
ipcMain.on('app-shutdown', () => {
  // Für den Shutdown auf einem Raspberry Pi: "sudo shutdown -h now"
  // Stelle sicher, dass der Benutzer, unter dem Electron läuft, die nötigen Rechte hat
  console.log("app-shutdown empfangen")
  exec('shutdown -h now', (error, stdout, stderr) => {
    if (error) {
      console.error(`Shutdown-Fehler: ${error}`);
      return;
    }
    console.log('Shutdown gestartet.');
  });
});


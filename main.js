const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');
});

ipcMain.handle("capture-screen", async (_, { x, y, width, height }) => {
    const sources = await desktopCapturer.getSources({ types: ["screen"] });
    const screen = sources[0]; // 

    // Capture screen as image
    const image = await screen.thumbnail.crop({ x, y, width, height }).toDataURL();
    return image; // Send image back to renderer process
});

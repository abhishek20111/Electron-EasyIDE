const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const { exec } = require("child_process");

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Open File Dialog
ipcMain.handle("open-file", async () => {
  const { filePaths } = await dialog.showOpenDialog({ properties: ["openFile"] });
  if (filePaths.length === 0) return null;

  const content = fs.readFileSync(filePaths[0], "utf-8");
  return { content, path: filePaths[0] };
});

// Save File Dialog
ipcMain.handle("save-file", async (event, { content, filePath }) => {
  if (!filePath) {
    const { filePath: newPath } = await dialog.showSaveDialog({});
    if (!newPath) return;
    filePath = newPath;
  }
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
});

// Run JavaScript File
ipcMain.handle("run-file", async (event, filePath) => {
  return new Promise((resolve, reject) => {
    exec(`node "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        resolve(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
});

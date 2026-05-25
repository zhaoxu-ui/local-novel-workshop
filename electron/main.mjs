import { app, BrowserWindow, dialog, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let serverHandle = null;
let mainWindow = null;

function appProjectsDir() {
  return path.join(app.getPath("documents"), "本地小说工坊", "projects");
}

async function createWindow() {
  process.env.PROJECTS_DIR = process.env.PROJECTS_DIR || appProjectsDir();
  process.env.PORT = "0";

  const { startServer } = await import("../server.mjs");
  serverHandle = await startServer(0);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: "#edf1f4",
    icon: path.join(__dirname, "..", "public", "icons", "app-icon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  await mainWindow.loadURL(`http://127.0.0.1:${serverHandle.port}`);
}

app.whenReady().then(createWindow).catch((error) => {
  dialog.showErrorBox("本地小说工坊启动失败", error?.stack || error?.message || String(error));
  app.quit();
});

app.on("window-all-closed", () => {
  if (serverHandle?.server) {
    serverHandle.server.close();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

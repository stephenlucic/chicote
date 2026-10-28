const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');

let tray, overlay;
let overlayReady = false;
let spawnQueued = false;

if (process.platform === 'darwin') app.dock.hide();

function getTrayIcon() {
  const img = nativeImage
    .createFromPath(path.join(__dirname, 'icon', 'Template.png'))
    .resize({ width: 18, height: 18 });
  img.setTemplateImage(true);
  return img;
}

// ── Overlay window ──────────────────────────────────────────────────────────
function createOverlay() {
  const { bounds } = screen.getPrimaryDisplay();
  overlay = new BrowserWindow({
    x: bounds.x, y: bounds.y,
    width: bounds.width, height: bounds.height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    focusable: false,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  overlay.setAlwaysOnTop(true, 'screen-saver');
  // Visible también sobre apps en pantalla completa y en cualquier escritorio
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayReady = false;
  overlay.loadFile('overlay.html');
  overlay.webContents.on('did-finish-load', () => {
    overlayReady = true;
    if (spawnQueued && overlay && overlay.isVisible()) {
      spawnQueued = false;
      overlay.webContents.send('spawn-whip');
    }
  });
  overlay.on('closed', () => {
    overlay = null;
    overlayReady = false;
    spawnQueued = false;
  });
}

function toggleOverlay() {
  if (overlay && overlay.isVisible()) {
    overlay.webContents.send('drop-whip');
    return;
  }
  if (!overlay) createOverlay();
  overlay.show();
  if (overlayReady) {
    overlay.webContents.send('spawn-whip');
  } else {
    spawnQueued = true;
  }
}

// ── IPC ─────────────────────────────────────────────────────────────────────
// Solo visual/sonido: el latigazo no envía teclas
ipcMain.on('whip-crack', () => {});
ipcMain.on('hide-overlay', () => { if (overlay) overlay.hide(); });

// ── App lifecycle ───────────────────────────────────────────────────────────
app.whenReady().then(() => {
  tray = new Tray(getTrayIcon());
  tray.setToolTip('OpenWhip - click for whip');
  const trayMenu = Menu.buildFromTemplate([
    { label: 'Quit', click: () => app.quit() },
  ]);
  // En macOS, setContextMenu se traga el click izquierdo: menú solo con click derecho
  tray.on('click', toggleOverlay);
  tray.on('right-click', () => tray.popUpContextMenu(trayMenu));
});

app.on('window-all-closed', e => e.preventDefault()); // keep alive in tray

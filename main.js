const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let tray, overlay;
let overlayReady = false;
let spawnQueued = false;

// ── Sensibilidad del latigazo ───────────────────────────────────────────────
// Velocidad mínima de la punta para que suene (menor = más fácil)
const SENSITIVITIES = [
  { id: 'baja',    label: 'Baja (original)', crackSpeed: 340 },
  { id: 'media',   label: 'Media',           crackSpeed: 260 },
  { id: 'alta',    label: 'Alta',            crackSpeed: 190 },
  { id: 'maxima',  label: 'Máxima',          crackSpeed: 130 },
];
const DEFAULT_SENSITIVITY = 'media';

// ── Estilos del látigo (deben existir en SKINS de overlay.html) ─────────────
const SKINS = [
  { id: 'clasico',  label: 'Clásico' },
  { id: 'cuero',    label: 'Cuero' },
  { id: 'rojo',     label: 'Rojo' },
  { id: 'dorado',   label: 'Dorado' },
  { id: 'neon',     label: 'Neón' },
  { id: 'arcoiris', label: 'Arcoíris' },
  { id: 'electrico', label: '⚡ Eléctrico' },
  { id: 'aura',      label: '✨ Aura dorada' },
  { id: 'energia',   label: '🔵 Energía azul' },
  { id: 'fuego',     label: '🔥 Fuego' },
];
const DEFAULT_SKIN = 'clasico';

const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');
let sensitivity = DEFAULT_SENSITIVITY;
let skin = DEFAULT_SKIN;

function loadSettings() {
  try {
    const s = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    if (SENSITIVITIES.some(x => x.id === s.sensitivity)) sensitivity = s.sensitivity;
    if (SKINS.some(x => x.id === s.skin)) skin = s.skin;
  } catch {}
}

function saveSettings() {
  try {
    fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
    fs.writeFileSync(settingsPath(), JSON.stringify({ sensitivity, skin }));
  } catch (e) {
    console.warn('no se pudo guardar settings:', e.message);
  }
}

function sendCrackSpeed() {
  if (!overlay || !overlayReady) return;
  const { crackSpeed } = SENSITIVITIES.find(x => x.id === sensitivity);
  overlay.webContents.send('set-crack-speed', crackSpeed);
}

function sendSkin() {
  if (!overlay || !overlayReady) return;
  overlay.webContents.send('set-skin', skin);
}

function setSkin(id) {
  skin = id;
  saveSettings();
  sendSkin();
}

function setSensitivity(id) {
  sensitivity = id;
  saveSettings();
  sendCrackSpeed();
}

if (process.platform === 'darwin') app.dock.hide();

function getTrayIcon() {
  if (process.platform === 'win32') {
    return nativeImage.createFromPath(path.join(__dirname, 'icon', 'icon.ico'));
  }
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
  // macOS: visible también sobre apps en pantalla completa y en cualquier escritorio
  if (process.platform === 'darwin') {
    overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
  overlayReady = false;
  overlay.loadFile('overlay.html');
  overlay.webContents.on('did-finish-load', () => {
    overlayReady = true;
    sendCrackSpeed();
    sendSkin();
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
  loadSettings();
  tray = new Tray(getTrayIcon());
  tray.setToolTip('Chicote - click para el látigo');
  const buildTrayMenu = () => Menu.buildFromTemplate([
    {
      label: 'Sensibilidad',
      submenu: SENSITIVITIES.map(s => ({
        label: s.label,
        type: 'radio',
        checked: s.id === sensitivity,
        click: () => setSensitivity(s.id),
      })),
    },
    {
      label: 'Estilo',
      submenu: SKINS.flatMap(s => [
        // Separa los colores simples de los estilos con efectos
        ...(s.id === 'electrico' ? [{ type: 'separator' }] : []),
        {
          label: s.label,
          type: 'radio',
          checked: s.id === skin,
          click: () => setSkin(s.id),
        },
      ]),
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  // setContextMenu se traga el click izquierdo en macOS: menú solo con click derecho
  tray.on('click', toggleOverlay);
  tray.on('right-click', () => tray.popUpContextMenu(buildTrayMenu()));
});

app.on('window-all-closed', e => e.preventDefault()); // keep alive in tray

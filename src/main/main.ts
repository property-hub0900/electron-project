const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain, shell, BrowserView } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

const __dirname = __filename ? path.dirname(__filename) : __dirname;

class DataExtractorApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private db: Database.Database;
  private browserView: BrowserView | null = null;

  constructor() {
    this.db = new Database('extractions.db');
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS extractions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        title TEXT,
        data TEXT,
        template_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        selectors TEXT NOT NULL,
        container_selector TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      frame: false,
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#1e293b',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/preload.js'),
        webSecurity: false
      }
    });

    // Load the React app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.setupBrowserView();
    this.setupEventHandlers();
    this.registerGlobalShortcuts();
  }

  private setupBrowserView() {
    this.browserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        preload: path.join(__dirname, '../preload/browserPreload.js')
      }
    });

    if (this.mainWindow) {
      this.mainWindow.setBrowserView(this.browserView);
      // Position the browser view in the center panel
      this.browserView.setBounds({ x: 300, y: 60, width: 800, height: 780 });
      this.browserView.setAutoResize({ width: true, height: true });
    }
  }

  private setupEventHandlers() {
    // Database operations
    ipcMain.handle('db-insert-extraction', (_, data) => {
      const stmt = this.db.prepare('INSERT INTO extractions (url, title, data, template_name) VALUES (?, ?, ?, ?)');
      return stmt.run(data.url, data.title, JSON.stringify(data.data), data.templateName);
    });

    ipcMain.handle('db-get-extractions', () => {
      const stmt = this.db.prepare('SELECT * FROM extractions ORDER BY created_at DESC');
      return stmt.all();
    });

    ipcMain.handle('db-save-template', (_, template) => {
      const stmt = this.db.prepare('INSERT OR REPLACE INTO templates (name, selectors, container_selector) VALUES (?, ?, ?)');
      return stmt.run(template.name, JSON.stringify(template.selectors), template.containerSelector);
    });

    ipcMain.handle('db-get-templates', () => {
      const stmt = this.db.prepare('SELECT * FROM templates ORDER BY created_at DESC');
      return stmt.all();
    });

    // Browser navigation
    ipcMain.handle('navigate-to-url', (_, url) => {
      if (this.browserView) {
        this.browserView.webContents.loadURL(url);
      }
    });

    ipcMain.handle('get-page-content', () => {
      if (this.browserView) {
        return this.browserView.webContents.executeJavaScript(`
          document.documentElement.outerHTML
        `);
      }
    });

    // Element selection
    ipcMain.handle('highlight-element', (_, selector) => {
      if (this.browserView) {
        this.browserView.webContents.executeJavaScript(`
          window.highlightElement('${selector}');
        `);
      }
    });

    // File operations
    ipcMain.handle('export-data', async (_, data, format) => {
      const { dialog } = await import('electron');
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        filters: [
          { name: format.toUpperCase(), extensions: [format] }
        ]
      });
      
      if (!result.canceled && result.filePath) {
        const fs = await import('fs/promises');
        let content = '';
        
        if (format === 'json') {
          content = JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
          content = this.convertToCSV(data);
        }
        
        await fs.writeFile(result.filePath, content);
        return result.filePath;
      }
    });

    // Window controls
    ipcMain.on('window-minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.on('window-maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.on('window-close', () => {
      this.mainWindow?.close();
    });
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  private createSystemTray() {
    const trayIconPath = path.join(__dirname, '../assets/tray-icon.png');
    this.tray = new Tray(trayIconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          this.mainWindow?.show();
        }
      },
      {
        label: 'Start Extraction',
        accelerator: 'CmdOrCtrl+Shift+E',
        click: () => {
          this.mainWindow?.webContents.send('start-extraction');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Advanced Data Extractor');
  }

  private registerGlobalShortcuts() {
    globalShortcut.register('CmdOrCtrl+Shift+E', () => {
      this.mainWindow?.webContents.send('start-extraction');
      this.mainWindow?.show();
    });
  }

  public async initialize() {
    await app.whenReady();
    
    this.createMainWindow();
    this.createSystemTray();

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
      this.db.close();
    });
  }
}

const extractorApp = new DataExtractorApp();
extractorApp.initialize();
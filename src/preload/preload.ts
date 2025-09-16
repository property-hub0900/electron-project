import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Database operations
  insertExtraction: (data: any) => ipcRenderer.invoke('db-insert-extraction', data),
  getExtractions: () => ipcRenderer.invoke('db-get-extractions'),
  saveTemplate: (template: any) => ipcRenderer.invoke('db-save-template', template),
  getTemplates: () => ipcRenderer.invoke('db-get-templates'),

  // Browser operations
  navigateToUrl: (url: string) => ipcRenderer.invoke('navigate-to-url', url),
  getPageContent: () => ipcRenderer.invoke('get-page-content'),
  highlightElement: (selector: string) => ipcRenderer.invoke('highlight-element', selector),

  // File operations
  exportData: (data: any, format: string) => ipcRenderer.invoke('export-data', data, format),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Event listeners
  onStartExtraction: (callback: () => void) => {
    ipcRenderer.on('start-extraction', callback);
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
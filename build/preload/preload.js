import { contextBridge, ipcRenderer } from 'electron';
const electronAPI = {
    // Database operations
    insertExtraction: (data) => ipcRenderer.invoke('db-insert-extraction', data),
    getExtractions: () => ipcRenderer.invoke('db-get-extractions'),
    saveTemplate: (template) => ipcRenderer.invoke('db-save-template', template),
    getTemplates: () => ipcRenderer.invoke('db-get-templates'),
    // Browser operations
    navigateToUrl: (url) => ipcRenderer.invoke('navigate-to-url', url),
    getPageContent: () => ipcRenderer.invoke('get-page-content'),
    highlightElement: (selector) => ipcRenderer.invoke('highlight-element', selector),
    // File operations
    exportData: (data, format) => ipcRenderer.invoke('export-data', data, format),
    // Window controls
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    closeWindow: () => ipcRenderer.send('window-close'),
    // Event listeners
    onStartExtraction: (callback) => {
        ipcRenderer.on('start-extraction', callback);
    }
};
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

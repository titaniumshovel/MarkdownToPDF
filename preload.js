const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  generatePDF: (htmlContent) => ipcRenderer.invoke('generate-pdf', htmlContent)
});
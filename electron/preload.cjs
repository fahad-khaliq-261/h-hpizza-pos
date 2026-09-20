const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  printReceipt: (options) => ipcRenderer.send('print-receipt', options),
  onPrintReceiptReply: (callback) => ipcRenderer.on('print-receipt-reply', (_event, value) => callback(value)),
  isElectron: true
});   

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jarvis', {
  ask: (prompt) => ipcRenderer.invoke('jarvis:ask', prompt),
  reset: () => ipcRenderer.invoke('jarvis:reset'),
});

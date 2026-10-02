const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jurisAI', {
  getConfig: () => ipcRenderer.invoke('ai:get-config'),
  saveConfig: config => ipcRenderer.invoke('ai:save-config', config),
  testConfig: config => ipcRenderer.invoke('ai:test-config', config),
  analyze: payload => ipcRenderer.invoke('ai:analyze', payload),
  disconnect: () => ipcRenderer.invoke('ai:disconnect'),
  openProvider: provider => ipcRenderer.invoke('ai:open-provider', provider)
});
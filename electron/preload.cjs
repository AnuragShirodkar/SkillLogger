// Preload kept minimal — UI stays fully client-side in the renderer.
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('skillLoggerDesktop', {
  isDesktop: true,
})

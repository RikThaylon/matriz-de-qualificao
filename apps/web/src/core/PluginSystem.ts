export interface DigitalTwinPlugin {
  id: string
  name: string
  version: string
  init: () => void
  destroy: () => void
}

class PluginManager {
  private plugins: Map<string, DigitalTwinPlugin> = new Map()

  public register(plugin: DigitalTwinPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[PluginManager] Plugin ${plugin.id} already registered.`)
      return
    }
    this.plugins.set(plugin.id, plugin)
    plugin.init()
    console.log(`[PluginManager] Registered & initialized plugin: ${plugin.name} v${plugin.version}`)
  }

  public unregister(id: string): void {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.destroy()
      this.plugins.delete(id)
      console.log(`[PluginManager] Unregistered plugin: ${id}`)
    }
  }

  public getPlugin(id: string): DigitalTwinPlugin | undefined {
    return this.plugins.get(id)
  }
}

export const pluginManager = new PluginManager()

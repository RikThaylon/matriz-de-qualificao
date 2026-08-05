import { useEffect } from 'react'
import { FactoryCanvas } from './components/3d/FactoryCanvas'
import { AIExplainableModal } from './components/hud/AIExplainableModal'
import { CommandPalette } from './components/hud/CommandPalette'
import { HeaderHUD } from './components/hud/HeaderHUD'
import { MachineDetailPanel } from './components/hud/MachineDetailPanel'
import { NotificationToast } from './components/hud/NotificationToast'
import { SquadPanel } from './components/hud/SquadPanel'
import { nativePlantEngine } from './engine/NativePlantEngine'

export function App() {
  useEffect(() => {
    nativePlantEngine.startNativeEngine()
    return () => nativePlantEngine.stopNativeEngine()
  }, [])
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05070A] select-none font-sans">
      {/* 3D Digital Twin Three.js Factory Canvas */}
      <FactoryCanvas />

      {/* Futuristic Industrial Command Center HUD Overlay */}
      <HeaderHUD />
      <NotificationToast />
      <MachineDetailPanel />
      <SquadPanel />

      {/* Interactive Modals */}
      <AIExplainableModal />
      <CommandPalette />
    </main>
  )
}

export default App

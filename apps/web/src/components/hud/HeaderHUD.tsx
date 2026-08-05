import {
  Activity, AlertTriangle, Bot, Command, Crosshair, Factory,
  RotateCcw, ShieldCheck, Zap
} from 'lucide-react'
import { useDigitalTwinStore } from '../../store/digitalTwinStore'
import { HeatmapToggle } from './HeatmapToggle'
import { PerformanceOverlay } from './PerformanceOverlay'
import { TimelineReplayBar } from './TimelineReplayBar'

export function HeaderHUD() {
  const plantOEE = useDigitalTwinStore((s) => s.plantOEE)
  const activeOperatorsCount = useDigitalTwinStore((s) => s.activeOperatorsCount)
  const operationalSafetyIndex = useDigitalTwinStore((s) => s.operationalSafetyIndex)
  const emergencyStopActive = useDigitalTwinStore((s) => s.emergencyStopActive)
  const triggerEmergencyStop = useDigitalTwinStore((s) => s.triggerEmergencyStop)
  const resetEmergencyStop = useDigitalTwinStore((s) => s.resetEmergencyStop)
  const setCommandPaletteOpen = useDigitalTwinStore((s) => s.setCommandPaletteOpen)
  const setAiModalOpen = useDigitalTwinStore((s) => s.setAiModalOpen)
  const setCameraMode = useDigitalTwinStore((s) => s.setCameraMode)

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
      {/* Brand & Digital Twin Status */}
      <div className="flex items-center gap-3 bg-[#0A0F17]/85 backdrop-blur-xl border border-[#00F3FF]/30 rounded-xl px-4 py-2.5 shadow-[0_0_25px_rgba(0,243,255,0.15)]">
        <div className="w-9 h-9 rounded-lg bg-[#00F3FF]/10 border border-[#00F3FF]/40 flex items-center justify-center text-[#00F3FF] animate-pulse">
          <Factory size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
              CYBERPLANT DIGITAL TWIN 01
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" /> REALTIME LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Planta Fabril Alpha • GigaFactory Command Center</p>
        </div>
      </div>

      {/* Center Plant Live Telemetry Gauges */}
      <div className="hidden lg:flex items-center gap-6 bg-[#0A0F17]/85 backdrop-blur-xl border border-slate-800 rounded-xl px-6 py-2">
        {/* Plant OEE Gauge */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="20" cy="20" r="16" stroke="#1E293B" strokeWidth="3" fill="transparent" />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#00FF9D"
                strokeWidth="3"
                strokeDasharray={100}
                strokeDashoffset={100 - plantOEE}
                fill="transparent"
                strokeLinecap="round"
              />
            </svg>
            <Zap size={14} className="absolute text-[#00FF9D]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">OEE Planta</span>
            <div className="text-lg font-mono font-bold text-[#00FF9D]">{plantOEE}%</div>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-800" />

        {/* Safety Index Gauge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#00F3FF]/10 flex items-center justify-center text-[#00F3FF]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Segurança NR-12</span>
            <div className="text-lg font-mono font-bold text-[#00F3FF]">{operationalSafetyIndex}%</div>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-800" />

        {/* Active Operators Count */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FFB800]/10 flex items-center justify-center text-[#FFB800]">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Operadores Ativos</span>
            <div className="text-lg font-mono font-bold text-[#FFB800]">{activeOperatorsCount} Postos</div>
          </div>
        </div>
      </div>

      {/* Heatmap & Timeline Controls */}
      <div className="hidden xl:flex items-center gap-3">
        <HeatmapToggle />
        <TimelineReplayBar />
        <PerformanceOverlay />
      </div>

      {/* Quick Action Toolbar & Controls */}
      <div className="flex items-center gap-3">
        {/* Explainable AI Recommendations Trigger */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00F3FF]/15 hover:bg-[#00F3FF]/25 border border-[#00F3FF]/40 text-[#00F3FF] font-mono text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)]"
        >
          <Bot size={16} /> IA Recomendação
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs transition-all"
        >
          <Command size={14} /> <span className="hidden sm:inline">Busca</span> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">Ctrl+K</kbd>
        </button>

        {/* Reset Camera */}
        <button
          onClick={() => setCameraMode('overview')}
          title="Resetar Câmera"
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all"
        >
          <Crosshair size={18} />
        </button>

        {/* Emergency Stop Toggle */}
        {emergencyStopActive ? (
          <button
            onClick={resetEmergencyStop}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00FF9D] text-slate-950 font-mono text-xs font-bold animate-bounce shadow-[0_0_20px_#00FF9D]"
          >
            <RotateCcw size={16} /> REINICIAR OPERAÇÃO
          </button>
        ) : (
          <button
            onClick={triggerEmergencyStop}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF2A6D]/20 hover:bg-[#FF2A6D] text-[#FF2A6D] hover:text-white border border-[#FF2A6D]/50 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,42,109,0.3)]"
          >
            <AlertTriangle size={16} /> E-STOP PARADA
          </button>
        )}
      </div>
    </header>
  )
}

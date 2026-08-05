import { Activity, Flame, Layers, Zap } from 'lucide-react'
import { useDigitalTwinStore } from '../../store/digitalTwinStore'

export function HeatmapToggle() {
  const heatmapMode = useDigitalTwinStore((s) => s.heatmapMode)
  const setHeatmapMode = useDigitalTwinStore((s) => s.setHeatmapMode)

  return (
    <div className="flex items-center gap-1 bg-[#0A0F17]/85 backdrop-blur-xl border border-slate-800 rounded-xl p-1 pointer-events-auto shadow-lg">
      <button
        onClick={() => setHeatmapMode('off')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
          heatmapMode === 'off'
            ? 'bg-slate-800 text-slate-100 border border-slate-700'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Layers size={13} /> 3D Padrão
      </button>

      <button
        onClick={() => setHeatmapMode('thermal')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
          heatmapMode === 'thermal'
            ? 'bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Flame size={13} /> Térmico
      </button>

      <button
        onClick={() => setHeatmapMode('traffic')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
          heatmapMode === 'traffic'
            ? 'bg-[#00F3FF]/20 text-[#00F3FF] border border-[#00F3FF]/40'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Activity size={13} /> Tráfego
      </button>

      <button
        onClick={() => setHeatmapMode('stress')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
          heatmapMode === 'stress'
            ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Zap size={13} /> Estresse
      </button>
    </div>
  )
}
